import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Распределение спецтехники",
  description: "Планирование работ, переброски и статуса спецтехники по районам",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
