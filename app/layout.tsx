import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Marcador de Puntos",
  description: "Herramienta para llevar el puntaje de dos jugadores",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
