import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CortexAI",
  description: "RAG System powered by Mistral/Zephyr",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-800">{children}</body>
    </html>
  );
}