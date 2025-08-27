import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
            <a href="/" className="font-semibold">HocaPuan</a>
            <nav className="text-sm flex gap-4">
              <a href="/hakkinda" className="hover:underline">Hakkında</a>
              <a href="/kullanim-kosullari" className="hover:underline">Kullanım Koşulları</a>
              <a href="/gizlilik" className="hover:underline">Gizlilik</a>
              <a href="/icerik-kurallari" className="hover:underline">İçerik Kuralları</a>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="border-t mt-8">
          <div className="max-w-5xl mx-auto px-4 py-6 text-sm flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-muted-foreground">© {new Date().getFullYear()} HocaPuan</p>
            <div className="flex gap-4">
              <a href="/kvkk" className="hover:underline">KVKK Aydınlatma</a>
              <a href="/takedown" className="hover:underline">Kaldırma Talebi</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
