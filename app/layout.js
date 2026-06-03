import './globals.css';
import Sidebar from './components/Sidebar';

export const metadata = {
  title: 'Objective First Portal',
  description: 'Wiom internal project management — objective conduction tool',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        <Sidebar />
        <main className="ml-60 min-h-screen transition-all duration-300 p-8">
          {children}
        </main>
      </body>
    </html>
  );
}
