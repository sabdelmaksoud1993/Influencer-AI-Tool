import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "GLOW PASS — Access the City. Capture the Glow.",
  description: "The premium creator network for nightlife venues.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${inter.variable} font-[family-name:var(--font-body)] antialiased`}
        style={{ ["--font-heading" as string]: `var(--font-body)` }}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
