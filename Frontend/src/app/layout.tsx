import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { BottomNav } from "@/components/bottom-nav";
import { CursorSpotlight } from "@/components/cursor-spotlight";
import { FloatingAction } from "@/components/floating-action";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { ScrollProgress } from "@/components/scroll-progress";
import { SimpleBuyWidget } from "@/components/simple-buy-widget";
import "./globals.css";

import { StoreProvider } from "@/store/StoreProvider";
import { AuthInit } from "@/components/auth-init";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SubscriptionModal } from "@/components/subscription-modal";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });

export const metadata: Metadata = {
  title: "GroupBuying | Pay Less Together",
  description: "India's group buying real estate platform for developer-direct savings.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jakarta.variable}`}>
        <StoreProvider>
          <TooltipProvider>
            <AuthInit />
            <ScrollProgress />
            <CursorSpotlight />
            <Navbar />
            
            {children}
            <Footer />
            <FloatingAction />
            <SimpleBuyWidget />
            <SubscriptionModal />
            <BottomNav />
          </TooltipProvider>
        </StoreProvider>
      </body>
    </html>
  );
}


