import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ticket Management",
  description: "Frontend reference app — ticket management system",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
