import { Plus_Jakarta_Sans, Inter } from "next/font/google";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { CommunityDataProvider } from "@/components/providers/CommunityDataProvider";
import { ToastProvider } from "@/components/ui/ToastProvider";
import "./globals.css";
import "@/styles/globals.scss";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-light",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-dark",
});

export const metadata = {
  title: "RateYourArea | Real Residents. Real Reviews.",
  description:
    "Anonymous society and area reviews by real residents. Know your area before you move.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body
        className={`${plusJakarta.variable} ${inter.variable} min-h-screen antialiased transition-colors duration-300`}
      >
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              <CommunityDataProvider>
                <Header />
                <main className="site-main flex-1">{children}</main>
                <Footer />
                <MobileBottomNav />
              </CommunityDataProvider>
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
