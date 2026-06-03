import { signIn } from '../../lib/auth';

export default function LoginPage({ searchParams }) {
  const error = searchParams?.error;

  return (
    <div className="min-h-screen bg-[#1A1A2E] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-sm w-full text-center">
        {/* Logo */}
        <div className="w-14 h-14 bg-[#E91E63] rounded-xl flex items-center justify-center mx-auto mb-5">
          <span className="text-white font-bold text-xl">OF</span>
        </div>

        <h1 className="text-xl font-bold text-gray-900 mb-1">Objective First</h1>
        <p className="text-sm text-gray-500 mb-6">Sign in with your Wiom account to continue.</p>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-5 text-sm text-red-700">
            {error === 'AccessDenied'
              ? 'Access denied — only @wiom.in accounts are allowed.'
              : 'Something went wrong. Please try again.'}
          </div>
        )}

        <form
          action={async () => {
            'use server';
            await signIn('google', { redirectTo: '/' });
          }}
        >
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border-2 border-gray-200 rounded-lg hover:border-[#E91E63] hover:bg-pink-50 transition-colors font-medium text-sm text-gray-700 cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </button>
        </form>

        <p className="text-xs text-gray-400 mt-5">Only <strong>@wiom.in</strong> accounts are allowed.</p>
      </div>
    </div>
  );
}
