import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.WIOM_PORTAL_ANTHROPIC_KEY || process.env.ANTHROPIC_API_KEY,
});

/**
 * Given two FL objectives for the same/similar project, return a G/A/R score and rationale.
 */
export async function scoreObjectivePair(projectNameA, projectNameB, flA, flB) {
  const sameName = projectNameA.toLowerCase().trim() === projectNameB.toLowerCase().trim();
  const projectLabel = sameName
    ? `"${projectNameA}"`
    : `"${projectNameA}" (FL A's name) / "${projectNameB}" (FL B's name)`;

  const prompt = `You are an objective-alignment scorer for a company called Wiom.

Two functional leads (FLs) independently wrote the objective for what appears to be the same project: ${projectLabel}.

FL A (${flA.name}, ${flA.function || 'unknown function'}):
  Project name: ${projectNameA}
  Objective: ${flA.objective}
  Success Metric: ${flA.success_metric || 'not provided'}

FL B (${flB.name}, ${flB.function || 'unknown function'}):
  Project name: ${projectNameB}
  Objective: ${flB.objective}
  Success Metric: ${flB.success_metric || 'not provided'}

SCORING RULE:
A "match" means the same outcome AND the same success metric, in substance — not exact wording.
- GREEN: Both describe the same outcome AND the same success metric.
- AMBER: Partial — same outcome but different metric, OR same metric but different framing of the outcome.
- RED: Fundamentally different outcomes or contradictory objectives.

Respond ONLY with valid JSON, no other text:
{"score": "green"|"amber"|"red", "rationale": "1-2 sentence explanation of why"}`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 200,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = message.content[0].text.trim();
  try {
    const result = JSON.parse(text);
    if (!['green', 'amber', 'red'].includes(result.score)) {
      return { score: 'amber', rationale: 'Could not determine alignment — manual review needed.' };
    }
    return result;
  } catch {
    return { score: 'amber', rationale: 'Could not parse scoring response — manual review needed.' };
  }
}

/**
 * Detect cross-FL project pairs — exact name matches via SQL.
 */
export function detectExactPairs(db) {
  return db.prepare(`
    SELECT a.id as a_id, a.submitter_name as a_name, a.submitter_function as a_function,
           a.project_name as a_project, a.objective as a_objective, a.success_metric as a_metric,
           b.id as b_id, b.submitter_name as b_name, b.submitter_function as b_function,
           b.project_name as b_project, b.objective as b_objective, b.success_metric as b_metric
    FROM submissions a
    JOIN submissions b ON LOWER(TRIM(a.project_name)) = LOWER(TRIM(b.project_name))
      AND a.submitter_name < b.submitter_name
    ORDER BY a.project_name
  `).all();
}

/**
 * Use Claude to find fuzzy/similar project name matches across different submitters.
 * Returns array of {a_id, b_id, a_project, b_project, ...} for pairs that look like the same project.
 */
export async function detectFuzzyPairs(db, existingPairKeys) {
  const submissions = db.prepare(
    'SELECT id, submitter_name, submitter_function, project_name, objective, success_metric FROM submissions ORDER BY submitter_name'
  ).all();

  if (submissions.length < 2) return [];

  // Group by submitter
  const byPerson = {};
  for (const s of submissions) {
    if (!byPerson[s.submitter_name]) byPerson[s.submitter_name] = [];
    byPerson[s.submitter_name].push(s);
  }
  const people = Object.keys(byPerson);
  if (people.length < 2) return [];

  // Build a compact list for Claude to match
  const lines = submissions.map(s => `[${s.id}] ${s.submitter_name}: "${s.project_name}"`).join('\n');

  const prompt = `Below are project submissions from different people at a company. Some projects may be the SAME project but named slightly differently (abbreviations, typos, rephrasing, different casing, etc.).

${lines}

Find all pairs of submissions from DIFFERENT people that refer to the SAME project. Only include pairs you are confident are the same project — not vaguely related projects.

Respond ONLY with a JSON array of pairs, no other text:
[{"a_id": <number>, "b_id": <number>}]

If no fuzzy matches exist beyond exact name matches, return an empty array: []`;

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = message.content[0].text.trim();
    const matches = JSON.parse(text);
    if (!Array.isArray(matches)) return [];

    // Look up full submission data and filter out exact matches we already have
    const subMap = {};
    for (const s of submissions) subMap[s.id] = s;

    const fuzzyPairs = [];
    for (const m of matches) {
      const a = subMap[m.a_id];
      const b = subMap[m.b_id];
      if (!a || !b) continue;
      if (a.submitter_name === b.submitter_name) continue; // same person, skip

      // Normalize order
      const [first, second] = a.submitter_name < b.submitter_name ? [a, b] : [b, a];
      const key = `${first.id}-${second.id}`;
      if (existingPairKeys.has(key)) continue; // already found by exact match

      fuzzyPairs.push({
        a_id: first.id, a_name: first.submitter_name, a_function: first.submitter_function,
        a_project: first.project_name, a_objective: first.objective, a_metric: first.success_metric,
        b_id: second.id, b_name: second.submitter_name, b_function: second.submitter_function,
        b_project: second.project_name, b_objective: second.objective, b_metric: second.success_metric,
      });
    }

    return fuzzyPairs;
  } catch {
    return [];
  }
}

/**
 * Full detection: exact + fuzzy matches.
 */
export async function detectAllPairs(db) {
  const exact = detectExactPairs(db);
  // Add a_project / b_project to exact pairs (they're the same)
  const exactNormalized = exact.map(p => ({
    ...p,
    a_project: p.a_project || p.project_name,
    b_project: p.b_project || p.project_name,
  }));

  const exactKeys = new Set(exactNormalized.map(p => `${p.a_id}-${p.b_id}`));

  let fuzzy = [];
  if (process.env.WIOM_PORTAL_ANTHROPIC_KEY || process.env.ANTHROPIC_API_KEY) {
    try {
      fuzzy = await detectFuzzyPairs(db, exactKeys);
    } catch {
      // Fuzzy detection failed, continue with exact only
    }
  }

  return [...exactNormalized, ...fuzzy];
}

/**
 * Check which pairs have already been scored.
 */
export function getUnscoredPairs(db, pairs) {
  const scored = db.prepare('SELECT submission_a_id, submission_b_id FROM alignment_scores').all();
  const scoredSet = new Set(scored.map(s => `${s.submission_a_id}-${s.submission_b_id}`));
  return pairs.filter(p => !scoredSet.has(`${p.a_id}-${p.b_id}`));
}
