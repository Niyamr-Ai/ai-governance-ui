import "@/styles/globals.css";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";

const defaultUrl = process.env.NEXT_PUBLIC_SITE_URL
    ? process.env.NEXT_PUBLIC_SITE_URL
    : (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000");

export const metadata = {
    metadataBase: new URL(defaultUrl),
    title: "AI Governance Platform",
    description: "The unified AI Governance OS",
};

const inter = Inter({
    subsets: ["latin"],
    display: "swap",
});

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={inter.className}>
            <body className="bg-background text-foreground">
                <main className="min-h-screen flex flex-col items-center">
                    {children}
                </main>
                <Toaster />
            </body>
        </html>
    );
}
