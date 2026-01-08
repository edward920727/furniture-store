"use client"

import Link from "next/link"
import { Search, Menu, ShoppingCart, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/contexts/cart-context"
import { createClient } from "@/lib/supabase/client"

export function Header() {
  const [searchQuery, setSearchQuery] = useState("")
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const { totalItems } = useCart()

  useEffect(() => {
    // 確保在客戶端環境下執行
    if (typeof window === 'undefined') {
      return
    }
    checkUser()
  }, [])

  async function checkUser() {
    try {
      // 確保在客戶端環境下創建 Supabase 客戶端
      if (typeof window === 'undefined') {
        return
      }
      
      const supabase = createClient()
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (!error && user) {
        setUser(user)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error("Failed to check user:", error)
      setUser(null)
    }
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    router.refresh()
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200/50 bg-white/90 backdrop-blur-md supports-[backdrop-filter]:bg-white/90 shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold tracking-tight text-[#333]">張馨家居 CYNTHIA</span>
        </Link>

        {/* 桌面導航 */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
            首頁
          </Link>
          <Link href="/products" className="text-sm font-medium transition-colors hover:text-primary">
            所有產品
          </Link>
          <Link href="/about" className="text-sm font-medium transition-colors hover:text-primary">
            關於我們
          </Link>
          <Link href="/contact" className="text-sm font-medium transition-colors hover:text-primary">
            聯絡我們
          </Link>
        </nav>

        {/* 搜尋欄 */}
        <form onSubmit={handleSearch} className="hidden md:flex items-center gap-2 flex-1 max-w-md mx-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="搜尋產品..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </form>

        {/* 會員與購物車 */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link href="/profile">
                <Button variant="ghost" size="icon" title="會員中心">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                登出
              </Button>
            </>
          ) : (
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">
                <User className="h-4 w-4 mr-2" />
                登入
              </Button>
            </Link>
          )}
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </Button>
          </Link>
        </div>

        {/* 行動選單按鈕 */}
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </div>
    </header>
  )
}
