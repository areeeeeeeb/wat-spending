import localFont from "next/font/local";
import "./globals.css";
import { TransactionsProvider } from "@/components/providers/transactions-provider";
import { GooseProvider } from '@/components/providers/goose-provider';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "WAT Was Spent?",
  description: "WAT You Spent, WAT You Saved, WAT You Did.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TransactionsProvider>
          <GooseProvider>
            {children}
          </GooseProvider>
        </TransactionsProvider>
      </body>
    </html>
  );
}
