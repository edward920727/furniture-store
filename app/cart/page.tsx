"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useCart } from "@/contexts/cart-context"
import { formatPrice } from "@/lib/utils"
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalItems, totalPrice } = useCart()

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container py-12">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <ShoppingBag className="h-24 w-24 mx-auto text-muted-foreground" />
            <h1 className="text-3xl font-bold">購物車是空的</h1>
            <p className="text-muted-foreground">快去選購您喜歡的商品吧！</p>
            <Link href="/products">
              <Button>前往選購</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container py-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">購物車</h1>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 購物車項目 */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      {/* 產品圖片 */}
                      <div className="relative w-24 h-24 rounded-md overflow-hidden bg-muted flex-shrink-0">
                        {item.image_url ? (
                          <Image
                            src={item.image_url}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <ShoppingBag className="h-8 w-8" />
                          </div>
                        )}
                      </div>

                      {/* 產品資訊 */}
                      <div className="flex-1">
                        <Link href={`/products/${item.slug}`}>
                          <h3 className="font-medium text-lg hover:text-primary transition-colors">
                            {item.name}
                          </h3>
                        </Link>
                        <p className="text-muted-foreground mt-1">
                          {formatPrice(item.price)}
                        </p>
                        <div className="flex items-center gap-4 mt-4">
                          {/* 數量控制 */}
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-12 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= item.stock_quantity}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* 刪除按鈕 */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(item.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* 小計 */}
                      <div className="text-right">
                        <p className="font-semibold text-lg">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* 訂單摘要 */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardContent className="p-6 space-y-4">
                  <h2 className="text-xl font-bold">訂單摘要</h2>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">商品數量</span>
                      <span>{totalItems} 件</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">小計</span>
                      <span>{formatPrice(totalPrice)}</span>
                    </div>
                    <div className="pt-4 border-t">
                      <div className="flex justify-between font-bold text-lg">
                        <span>總計</span>
                        <span>{formatPrice(totalPrice)}</span>
                      </div>
                    </div>
                  </div>
                  <Link href="/checkout" className="block">
                    <Button className="w-full" size="lg">
                      前往結帳
                    </Button>
                  </Link>
                  <Link href="/products">
                    <Button variant="outline" className="w-full">
                      繼續購物
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
