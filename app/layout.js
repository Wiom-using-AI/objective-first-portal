import './globals.css';
import Sidebar from './components/Sidebar';
import { auth } from '../lib/auth';

export const metadata = {
  title: 'Objective First Portal',
  description: 'Wiom internal project management — objective conduction tool',
};

export default async function RootLayout({ children }) {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-gray-50 min-h-screen" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
        {isLoggedIn && <Sidebar user={session.user} />}
        <main className={isLoggedIn ? 'ml-60 min-h-screen transition-all duration-300 p-8' : ''}>
          {children}
        </main>
      </body>
    </html>
  );
}
