import { auth } from '../../lib/auth';
import SubmitForm from './SubmitForm';

export const dynamic = 'force-dynamic';

export default async function SubmitPage() {
  const session = await auth();
  const userName = session?.user?.name || '';
  const userEmail = session?.user?.email || '';

  return <SubmitForm userName={userName} userEmail={userEmail} />;
}
