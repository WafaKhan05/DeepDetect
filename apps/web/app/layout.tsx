import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Navbar } from "@/components/navbar";
import { AuthProvider } from "@/providers/auth-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DeepDetect - AI Deepfake Detection",
  description: "Advanced deepfake detection powered by artificial intelligence",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <html lang="en">
        <body className={inter.className}>
          <Navbar />
          <div className="pt-16">{children}</div>
        </body>
      </html>
    </AuthProvider>
  );
}
