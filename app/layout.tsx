import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
});

export const metadata: Metadata = {
    title: "BredOrganogramaDigital - Organograma Corporativo",
    description: "Sistema de organograma corporativo da BredCompany com suporte premium para avatares",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt-BR" suppressHydrationWarning>
            <body className={inter.className} suppressHydrationWarning>
                {children}
            </body>
        </html>
    );
}
