import type { Metadata } from "next";
import { headers } from "next/headers";
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

export async function generateMetadata(): Promise<Metadata> {
  let host = "";
  try {
    const headersList = await headers();
    host = (headersList.get("host") || "").toLowerCase();
  } catch {
    host = "";
  }

  const isDemoDomain =
    host.includes("temin360app.demo.ilyasbozdemir.dev") ||
    host.includes("demo.ilyasbozdemir.dev") ||
    process.env.NO_INDEX === "true" ||
    process.env.NEXT_PUBLIC_NO_INDEX === "true" ||
    process.env.ENVIRONMENT === "demo";

  return {
    title: "TEMİN 360 - Yeni Nesil Süreç, İhale & Hakediş Yönetim Sistemi",
    description:
      "4734 Sayılı Kamu İhale Kanunu ve 5018 standartlarında doğrudan temin, piyasa fiyat araştırması ve hakediş yönetiminde hibrit masaüstü & bulut iş asistanı.",
    keywords: [
      "Doğrudan Temin",
      "4734 Sayılı Kanun",
      "Kamu İhale",
      "Piyasa Fiyat Araştırması",
      "Hakediş",
      "TEMİN 360",
      "İlyas Bozdemir",
    ],
    authors: [{ name: "İlyas Bozdemir", url: "https://www.linkedin.com/in/ilyasbozdemir/" }],
    metadataBase: new URL("https://temin360.ilyasbozdemir.dev"),
    robots: isDemoDomain
      ? {
          index: false,
          follow: false,
          nocache: true,
          googleBot: {
            index: false,
            follow: false,
            noimageindex: true,
          },
        }
      : {
          index: true,
          follow: true,
        },
    openGraph: {
      title: "TEMİN 360 - Kamu Satın Alma & Hakediş Mimarisi",
      description:
        "Masaüstünün yerel işlem hızı ile bulutun senkronizasyon gücünü birleştiren hibrit ihale ve temin asistanı.",
      url: "https://temin360.ilyasbozdemir.dev",
      siteName: "TEMİN 360",
      images: [
        {
          url: "/dashboard-preview.png",
          width: 1920,
          height: 1080,
          alt: "TEMİN 360 Komuta & Karar Destek Merkezi",
        },
      ],
      locale: "tr_TR",
      type: "website",
    },
    icons: {
      icon: [
        { url: "/icon.png", type: "image/png" },
        { url: "/favicon.ico", sizes: "any" },
      ],
      shortcut: "/icon.png",
      apple: "/icon.png",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/icon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/icon.png" />
      </head>
      <body className="min-h-full flex flex-col bg-slate-50 dark:bg-slate-950">{children}</body>
    </html>
  );
}
