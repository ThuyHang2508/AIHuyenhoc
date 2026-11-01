import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AiSettingsDialog from "@/components/AiSettings";

export const metadata: Metadata = {
  title: { default: "AetherAI — Huyền Học & Vận Mệnh", template: "%s · AetherAI" },
  description: "Lập lá số Tử Vi, Thần Số Học Pythagoras và trải bài Tarot với AI luận giải. Nội dung mang tính tham khảo, giải trí.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className="dark">
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400..800;1,400..800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
        />
      </head>
      <body className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 pt-20">{children}</main>
        <Footer />
        <AiSettingsDialog />
      </body>
    </html>
  );
}
