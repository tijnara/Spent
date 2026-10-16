import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import PwaManager from "@/components/pwa/PwaManager";
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
    title: "Spent | Track Every Cents",
    description: "A fast, mobile-first, offline-ready daily budget tracker.",
    manifest: "/manifest.json",
    icons: {
        icon: "/icon.svg",
        apple: "/icon.svg",
    },
};

export const viewport: Viewport = {
    themeColor: "#6b46c1",
    width: "device-width",
    initialScale: 1,
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
        >
        <body className="min-h-full flex flex-col">
        <PwaManager />
        {children}
        </body>
        </html>
    );
}