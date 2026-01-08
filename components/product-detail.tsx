"use client"

import { useState } from "react"
import Image from "next/image"
import { formatPrice } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Phone, MessageCircle, ShoppingCart } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { useToast } from "@/components/ui/use-toast"

interface ProductImage {
  image_url: string
  alt_text?: string
  sort_order: number
  is_primary: boolean
}

interface Product {
  id: string
  name: string
  description?: string
  rich_description?: string
  price: number
  compare_at_price?: number
  stock_quantity: number
  dimensions?: { length?: number; width?: number; height?: number }
  weight?: number
  product_images?: ProductImage[] // 改為可選，因為暫時不讀取
  categories: { name: string; slug: string } | null
}

export function ProductDetail({ product }: { product: Product }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const { addItem } = useCart()
  const { toast } = useToast()
  // 暫時處理：如果沒有 product_images，使用空陣列
  const productImages = product.product_images || []
  const sortedImages = [...productImages].sort(
    (a, b) => a.sort_order - b.sort_order
  )
  const primaryImageIndex = sortedImages.findIndex((img) => img.is_primary) || 0
  const displayImageIndex = selectedImageIndex || primaryImageIndex || 0

  const phoneNumber = process.env.NEXT_PUBLIC_PHONE_NUMBER || "+886-2-1234-5678"
  const lineId = process.env.NEXT_PUBLIC_LINE_ID || "your-line-id"

  const handleAddToCart = () => {
    // 只有當 stock_quantity 明確等於 0 時才顯示缺貨
    const stock = product.stock_quantity ?? null
    if (stock !== null && stock <= 0) {
      toast({
        title: "無法加入購物車",
        description: "此商品目前缺貨",
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
      image_url: sortedImages[0]?.image_url,
      stock_quantity: stock ?? 99, // 如果為 null，預設為 99
    })

    toast({
      title: "已加入購物車",
      description: `${product.name} 已加入購物車`,
    })
  }

  return (
    <div className="container py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* 圖片區 */}
        <div className="space-y-4">
          {/* 主圖 */}
          <Card className="border-0 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="relative aspect-square bg-muted">
                {sortedImages.length > 0 ? (
                  <Image
                    src={sortedImages[displayImageIndex]?.image_url || sortedImages[0].image_url}
                    alt={sortedImages[displayImageIndex]?.alt_text || product.name}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-neutral-100 to-neutral-200" />
                )}
              </div>
            </CardContent>
          </Card>

          {/* 縮圖 */}
          {sortedImages.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {sortedImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative aspect-square rounded-md overflow-hidden border-2 transition-all ${
                    index === displayImageIndex
                      ? "border-primary"
                      : "border-transparent hover:border-muted-foreground/20"
                  }`}
                >
                  <Image
                    src={image.image_url}
                    alt={image.alt_text || `${product.name} - 圖片 ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 25vw, 12.5vw"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 產品資訊 */}
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-light mb-4">{product.name}</h1>
            {product.categories && (
              <p className="text-muted-foreground mb-4">
                分類：{product.categories.name}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <span className="text-3xl font-semibold">
                {formatPrice(product.price)}
              </span>
              {product.compare_at_price && product.compare_at_price > product.price && (
                <>
                  <span className="text-xl text-muted-foreground line-through">
                    {formatPrice(product.compare_at_price)}
                  </span>
                  <span className="text-sm text-destructive">
                    省 {formatPrice(product.compare_at_price - product.price)}
                  </span>
                </>
              )}
            </div>
          </div>

          {product.description && (
            <div className="prose max-w-none">
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          {/* 產品規格 */}
          {(product.dimensions || product.weight) && (
            <div className="border-t pt-6 space-y-2">
              <h3 className="font-semibold mb-4">產品規格</h3>
              {product.dimensions && (
                <div className="text-sm text-muted-foreground">
                  <p>
                    尺寸：{product.dimensions.length} × {product.dimensions.width} × {product.dimensions.height} cm
                  </p>
                </div>
              )}
              {product.weight && (
                <div className="text-sm text-muted-foreground">
                  <p>重量：{product.weight} kg</p>
                </div>
              )}
            </div>
          )}

          {/* 庫存狀態 */}
          <div className="border-t pt-6">
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

          {/* 行動按鈕 */}
          <div className="flex gap-4 pt-6">
            <Button
              size="lg"
              className="flex-1"
              onClick={handleAddToCart}
              disabled={product.stock_quantity !== null && product.stock_quantity <= 0}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {product.stock_quantity === null || product.stock_quantity > 0 ? "加入購物車" : "缺貨中"}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="flex-1"
              onClick={() => window.open(`tel:${phoneNumber}`, "_self")}
            >
              <Phone className="mr-2 h-5 w-5" />
              電話諮詢
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="flex-1"
              onClick={() => window.open(`https://line.me/ti/p/${lineId}`, "_blank")}
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              LINE 諮詢
            </Button>
          </div>
        </div>
      </div>

      {/* 詳細描述 */}
      {product.rich_description && (
        <div className="border-t pt-12">
          <h2 className="text-2xl font-light mb-6">產品詳情</h2>
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: product.rich_description }}
          />
        </div>
      )}
    </div>
  )
}
