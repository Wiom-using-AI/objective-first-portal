import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

/**
 * Given two FL objectives for the same project, return a G/A/R score and rationale.
 * Uses Claude to judge semantic alignment (not wording).
 */
export async function scoreObjectivePair(projectName, flA, flB) {
  const prompt = `You are an objective-alignment scorer for a company called Wiom.

Two functional leads (FLs) independently wrote the objective for the same project: "${projectName}".

FL A (${flA.name}, ${flA.function || 'unknown function'}):
  Objective: ${flA.objective}
  Success Metric: ${flA.success_metric || 'not provided'}

FL B (${flB.name}, ${flB.function || 'unknown function'}):
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
 * Detect cross-FL project pairs from submissions and auto-score any unscored pairs.
 */
export function detectCrossFlPairs(db) {
  // Find project names submitted by more than one person
  const pairs = db.prepare(`
    SELECT a.id as a_id, a.submitter_name as a_name, a.submitter_function as a_function,
           a.project_name, a.objective as a_objective, a.success_metric as a_metric,
           b.id as b_id, b.submitter_name as b_name, b.submitter_function as b_function,
           b.objective as b_objective, b.success_metric as b_metric
    FROM submissions a
    JOIN submissions b ON LOWER(TRIM(a.project_name)) = LOWER(TRIM(b.project_name))
      AND a.submitter_name < b.submitter_name
    ORDER BY a.project_name
  `).all();

  return pairs;
}

/**
 * Check which pairs have already been scored (by submission IDs).
 */
export function getUnscoredPairs(db, pairs) {
  const scored = db.prepare('SELECT submission_a_id, submission_b_id FROM alignment_scores').all();
  const scoredSet = new Set(scored.map(s => `${s.submission_a_id}-${s.submission_b_id}`));

  return pairs.filter(p => !scoredSet.has(`${p.a_id}-${p.b_id}`));
}
