import "./globals.css";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children} {/* This renders page.tsx */}
      </body>
    </html>
  );
}
