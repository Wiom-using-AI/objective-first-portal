export const metadata = {
  title: 'Objective First Portal',
  description: 'Wiom internal project management tool',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
