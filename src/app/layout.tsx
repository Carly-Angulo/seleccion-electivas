import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Sistema de Selección de Electivas',
  description: 'Sistema web para la selección y administración de materias/electivas para estudiantes de 11º y 12º grado',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} font-sans`}>
      <body className="min-h-screen bg-secondary-50">{children}</body>
    </html>
  );
}