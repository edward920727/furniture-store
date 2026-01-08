"use client"

import Link from "next/link"
import { Facebook, Instagram } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 關於 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">關於我們</h3>
            <p className="text-sm text-muted-foreground">
              專注於提供高品質的北歐極簡風格家具，為您打造理想的居家空間。
            </p>
            {/* 社群媒體 */}
            <div className="flex items-center gap-4 pt-2">
              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://www.instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* 快速連結 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">快速連結</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products" className="text-muted-foreground hover:text-foreground transition-colors">
                  所有產品
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  關於我們
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                  聯絡我們
                </Link>
              </li>
            </ul>
          </div>

          {/* 客戶服務 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">客戶服務</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>運送資訊</li>
              <li>退換貨政策</li>
              <li>常見問題</li>
            </ul>
          </div>

          {/* 聯絡資訊 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">聯絡我們</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>電話：{process.env.NEXT_PUBLIC_PHONE_NUMBER || "+886-2-1234-5678"}</li>
              <li>Email：info@hsinfyhome.com</li>
              <li>營業時間：週一至週五 9:00-18:00</li>
            </ul>
          </div>
        </div>

        {/* 付款方式 */}
        <div className="mt-12 pt-8 border-t">
          <div className="flex flex-col items-center gap-4">
            <h4 className="text-sm font-semibold text-muted-foreground">付款方式</h4>
            <div className="flex items-center gap-4 flex-wrap justify-center">
              <div className="px-4 py-2 bg-muted rounded-md text-xs font-medium">信用卡</div>
              <div className="px-4 py-2 bg-muted rounded-md text-xs font-medium">ATM轉帳</div>
              <div className="px-4 py-2 bg-muted rounded-md text-xs font-medium">貨到付款</div>
              <div className="px-4 py-2 bg-muted rounded-md text-xs font-medium">LINE Pay</div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} 張馨家居. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
