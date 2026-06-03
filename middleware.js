import { auth } from './lib/auth';

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Allow auth routes and API auth routes through
  if (pathname.startsWith('/api/auth') || pathname.startsWith('/login')) {
    return;
  }

  // If not authenticated, redirect to login
  if (!req.auth) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', req.url);
    return Response.redirect(loginUrl);
  }
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
