import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { FloatingContactButtons } from "@/components/floating-contact-buttons"
import { CartProvider } from "@/contexts/cart-context"

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "張馨家居 | 高端家具電商",
  description: "精選北歐極簡風格家具，打造理想居家空間",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW" className={inter.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <CartProvider>
          {children}
          <Toaster />
          <FloatingContactButtons />
        </CartProvider>
      </body>
    </html>
  )
}
