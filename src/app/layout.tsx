import type { Metadata, Viewport } from "next";
import { Fredoka, Nunito_Sans } from "next/font/google";
import type { ReactNode } from "react";
import { APP_NAME } from "@/config/site";
import "./globals.css";

// Titulares: redondeada y amable. Texto: clara y muy legible en pantalla.
const displayFont = Fredoka({
  subsets: ["latin"],
  variable: "--font-fredoka",
  display: "swap",
});

const bodyFont = Nunito_Sans({
  subsets: ["latin"],
  variable: "--font-nunito-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s · ${APP_NAME}`,
  },
  description:
    "Plataforma de robótica con LEGO Education SPIKE Prime para 1º, 2º y 3º de ESO: 9 unidades por curso con bloques de palabras.",
};

export const viewport: Viewport = {
  themeColor: "#00a3b4",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="es" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <body className="min-h-dvh bg-ink-50 font-sans text-ink-900 antialiased">
        {/*
          La bienvenida sale al entrar en la web, pero no cuando vuelves al
          login desde dentro (cerrar sesión, pulsar el logo). Se decide aquí,
          antes de que se pinte nada, para que no asome ni un fotograma.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(document.referrer&&new URL(document.referrer).origin===location.origin)document.documentElement.dataset.splash='visto'}catch(e){}",
          }}
        />
        {children}
      </body>
    </html>
  );
}
