import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "IA Inclusiva STEM+",
  description: "Plataforma educativa adaptativa para docentes, estudiantes y padres de familia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${geistSans.className} min-h-screen antialiased flex flex-col`}>
        {children}
      </body>
    </html>
  );
}