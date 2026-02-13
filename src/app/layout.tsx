// import "./globals.css";

export const metadata = {
  title: "Smart Bookmark App",
  description: "Bookmark manager with Supabase and Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
