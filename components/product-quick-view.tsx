"use client"

import { useState } from "react"
import Image from "next/image"
import { formatPrice } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Plus, Minus } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { useToast } from "@/components/ui/use-toast"

interface Product {
  id: string
  name: string
  slug: string
  price: number
  compare_at_price?: number
  description?: string
  image_url?: string
  stock_quantity?: number | null
}

interface ProductQuickViewProps {
  product: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProductQuickView({ product, open, onOpenChange }: ProductQuickViewProps) {
  const [quantity, setQuantity] = useState(1)
  const { addItem } = useCart()
  const { toast } = useToast()

  if (!product) return null

  const handleAddToCart = () => {
    // 只有當 stock_quantity 明確等於 0 時才顯示缺貨
    const stock = product.stock_quantity ?? null
    if (stock !== null && stock <= 0) {
      toast({
        title: "商品缺貨",
        description: "此商品目前無庫存，無法加入購物車。",
        variant: "destructive",
      })
      return
    }

    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      compare_at_price: product.compare_at_price,
      image_url: product.image_url,
      stock_quantity: stock ?? 99, // 如果為 null，預設為 99
    })

    toast({
      title: "已加入購物車",
      description: `${product.name} x${quantity} 已成功加入購物車。`,
    })
    
    // 重置數量
    setQuantity(1)
  }

  const handleQuantityChange = (delta: number) => {
    const stock = product.stock_quantity ?? 99 // 如果為 null，預設為 99
    const newQuantity = Math.max(1, Math.min(quantity + delta, stock))
    setQuantity(newQuantity)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{product.name}</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* 產品圖片 */}
          <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                unoptimized={product.image_url.startsWith("https://") && product.image_url.includes("supabase.co")}
              />
            ) : (
              <div className="w-full h-full relative">
                <Image
                  src="https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=800"
                  alt="產品預設圖"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  loading="lazy"
                />
              </div>
            )}
          </div>

          {/* 產品資訊 */}
          <div className="space-y-4">
            {/* 價格 */}
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold text-amber-700">
                  {formatPrice(product.price)}
                </span>
                {product.compare_at_price && product.compare_at_price > product.price && (
                  <>
                    <span className="text-xl text-muted-foreground line-through">
                      {formatPrice(product.compare_at_price)}
                    </span>
                    <span className="text-sm text-destructive font-medium">
                      省 {formatPrice(product.compare_at_price - product.price)}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* 描述 */}
            {product.description && (
              <div className="prose max-w-none">
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* 庫存狀態 */}
            <div className="border-t pt-4">
              {(() => {
                const stock = product.stock_quantity ?? null
                // 只有當 stock 明確等於 0 時才顯示缺貨
                if (stock !== null && stock === 0) {
                  return <p className="text-sm mb-4 text-destructive">目前缺貨</p>
                } else if (stock !== null) {
                  return <p className="text-sm mb-4 text-green-600">庫存：{stock} 件</p>
                } else {
                  return <p className="text-sm mb-4 text-green-600">現貨供應</p>
                }
              })()}
            </div>

            {/* 數量選擇器 */}
            {(() => {
              const stock = product.stock_quantity ?? null
              // 只有當 stock 明確等於 0 時才隱藏數量選擇器
              return stock === null || stock > 0
            })() && (
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium">數量：</label>
                <div className="flex items-center gap-2 border rounded-md">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= (product.stock_quantity ?? 99)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* 加入購物車按鈕 */}
            <Button
              size="lg"
              className="w-full"
              onClick={handleAddToCart}
              disabled={product.stock_quantity !== null && product.stock_quantity <= 0}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {product.stock_quantity === null || product.stock_quantity > 0 ? "加入購物車" : "商品缺貨"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
