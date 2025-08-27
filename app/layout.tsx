import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HocaPuan",
  description: "Türkiye'de hocalar ve dersler için değerlendirme platformu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header className="border-b">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="font-semibold" aria-label="HocaPuan ana sayfa">HocaPuan</Link>
            <nav className="text-sm flex gap-4">
              <Link href="/hakkinda" className="hover:underline">Hakkında</Link>
              <Link href="/kullanim-kosullari" className="hover:underline">Kullanım Koşulları</Link>
              <Link href="/gizlilik" className="hover:underline">Gizlilik</Link>
              <Link href="/icerik-kurallari" className="hover:underline">İçerik Kuralları</Link>
            </nav>
          </div>
        </header>
        <Providers>
          <main>{children}</main>
        </Providers>
        <footer className="border-t mt-8">
          <div className="max-w-5xl mx-auto px-4 py-6 text-sm flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-muted-foreground">© {new Date().getFullYear()} HocaPuan</p>
            <div className="flex gap-4">
              <Link href="/kvkk" className="hover:underline">KVKK Aydınlatma</Link>
              <Link href="/takedown" className="hover:underline">Kaldırma Talebi</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
