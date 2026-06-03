import './globals.css';

export const metadata = {
  title: 'Objective First Portal',
  description: 'Wiom internal project management — objective conduction tool',
};

function NavLink({ href, label }) {
  return (
    <a href={href} className="px-3 py-2 text-sm font-medium text-[#EAF1F8] hover:text-white hover:bg-[#1F6FB2] rounded-md transition-colors">
      {label}
    </a>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        <nav className="bg-[#102A43] shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-2">
                <a href="/" className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#1F6FB2] rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">OF</span>
                  </div>
                  <span className="text-white font-semibold text-lg">Objective First</span>
                </a>
              </div>
              <div className="flex items-center gap-1">
                <NavLink href="/" label="Dashboard" />
                <NavLink href="/submit" label="Submit Projects" />
                <NavLink href="/projects" label="Objective Library" />
                <NavLink href="/scoring" label="Alignment Scoring" />
                <NavLink href="/team" label="Team" />
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
