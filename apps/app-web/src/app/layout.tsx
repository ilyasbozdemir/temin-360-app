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
    title: "Temin 360 - Kamu İhale ve Harcama Yönetim Portalı",
    description:
      "Temin 360 masaüstü uygulaması için veri senkronizasyonu ve API entegrasyon yönetim arayüzü.",
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
