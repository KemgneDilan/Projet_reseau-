import { Inter } from "next/font/google";
import "./globals.css";
import { ConditionalLayout } from "@/components/layout/ConditionalLayout";
import { Providers } from "@/components/Providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Loomdaah - Ta maison est chez moi",
  description: "Plateforme communautaire de partage d'hospitalité, d'échange de séjours et d'entraide.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} h-full antialiased font-sans`}
    >
      <body className="min-h-screen flex flex-col bg-charcoal-50 dark:bg-charcoal-950">
        <Providers>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </Providers>
      </body>
    </html>
  );
}
