import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/header";
import FloatingActionButton from "@/components/ui/floating-action-button";
import { ReviewProvider } from "@/contexts/ReviewContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { ShareModalProvider } from "@/contexts/ShareModalContext";
import GlobalShareModal from "@/components/ui/global-share-modal";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WorkplaceReviews - Anonymous IT Company Reviews",
  description: "Share and discover anonymous workplace reviews for IT and software companies",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ShareModalProvider>
          <NotificationProvider>
            <ReviewProvider>
              <div className="min-h-screen bg-gray-50/30">
                <Header />
                <main className="flex min-h-[calc(100vh-5rem)]">
                  {children}
                </main>
                <FloatingActionButton />
                <GlobalShareModal />
              </div>
            </ReviewProvider>
          </NotificationProvider>
        </ShareModalProvider>
      </body>
    </html>
  );
}
