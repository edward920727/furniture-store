"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import Image from "next/image"
import { formatPrice } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { useToast } from "@/components/ui/use-toast"
import { ProductQuickView } from "@/components/product-quick-view"

interface Product {
  id: string
  name: string
  slug: string
  price: number
  compare_at_price?: number
  description?: string
  image_url?: string
  stock_quantity?: number
}

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)
  const [quickViewOpen, setQuickViewOpen] = useState(false)
  const { addItem } = useCart()
  const { toast } = useToast()

  useEffect(() => {
    async function fetchProducts() {
      try {
        // 使用 createClient 創建客戶端 Supabase 實例（不需要 Session）
        const supabase = createClient()
        
        // 徹底重寫：直接從 products 表讀取所有啟用的產品
        // 明確指定需要讀取的欄位，包含 image_url
        // 使用匿名客戶端，不需要登入即可讀取公開產品
        const { data, error } = await supabase
          .from("products")
          .select("id, name, slug, price, compare_at_price, description, image_url, stock_quantity, is_active, created_at")
          .eq("is_active", true)
          .limit(8)
          .order("created_at", { ascending: false })

        console.log("前台 - Supabase 查詢結果:", { data, error })
        console.log("前端收到的產品資料：", data)

        // 無論是否有錯誤，都先顯示測試產品，確保畫面不是空白
        const testProduct: Product = {
          id: "test-product-001",
          name: "測試沙發",
          slug: "test-sofa",
          price: 9800,
          compare_at_price: undefined,
          description: "測試模式",
        }

        if (error) {
          console.error("前台 - Error fetching products:", error)
          // 發生錯誤時強制顯示測試產品
          setProducts([testProduct])
        } else if (data && data.length > 0) {
          // 獲取 Supabase Storage URL 前綴（用於處理相對路徑）
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
          const storageUrl = supabaseUrl ? `${supabaseUrl}/storage/v1/object/public/product-images/` : ""
          
          // 映射資料，確保欄位名稱正確，並確保價格格式正確
          const mappedProducts = data.map((product: any) => {
            // 處理 image_url：如果是相對路徑，加上 Supabase Storage URL 前綴
            let imageUrl = product.image_url || ""
            if (imageUrl) {
              // 如果 image_url 是相對路徑（不包含 http:// 或 https://）
              if (!imageUrl.startsWith("http://") && !imageUrl.startsWith("https://")) {
                // 移除開頭的斜線（如果有）
                const cleanPath = imageUrl.startsWith("/") ? imageUrl.substring(1) : imageUrl
                imageUrl = `${storageUrl}${cleanPath}`
              }
            }
            
            return {
              id: product.id,
              name: product.name,
              slug: product.slug,
              price: Number(product.price) || 0, // 確保價格是數字
              compare_at_price: product.compare_at_price ? Number(product.compare_at_price) : undefined,
              description: product.description || "",
              image_url: imageUrl, // 包含處理後的 image_url
              stock_quantity: product.stock_quantity !== undefined && product.stock_quantity !== null 
                ? Number(product.stock_quantity) 
                : null, // 保留 null，不要轉換為 0
            }
          })
          setProducts(mappedProducts as Product[])
          console.log("前台 - 成功載入產品:", mappedProducts.length, "個")
          console.log("前台 - 產品列表:", mappedProducts)
          console.log("前端收到的產品資料（含圖片URL）：", mappedProducts.map(p => ({ name: p.name, image_url: p.image_url })))
        } else {
          // 如果資料庫沒有資料，強制顯示測試產品
          console.log("前台 - 資料庫沒有產品，顯示測試產品")
          setProducts([testProduct])
        }
      } catch (err) {
        console.error("前台 - 讀取產品時發生錯誤:", err)
        // 發生錯誤時也強制顯示測試產品，確保畫面不是空白
        const testProduct: Product = {
          id: "test-product-001",
          name: "測試沙發",
          slug: "test-sofa",
          price: 9800,
          compare_at_price: undefined,
          description: "測試模式",
        }
        setProducts([testProduct])
      } finally {
        setLoading(false)
      }
    }

    // 立即執行，確保測試產品能快速顯示
    fetchProducts()
  }, [])

  if (loading) {
    return (
      <section className="py-24 bg-muted/30">
        <div className="container">
          <div className="text-center">
            <p className="text-muted-foreground">載入中...</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-24 bg-muted/30">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-light mb-4 text-[#333]">精選產品</h2>
          <p className="text-[#333]/70 text-lg">為您推薦的優質家具</p>
        </motion.div>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg mb-2">新品準備中</p>
            <p className="text-sm text-muted-foreground">我們正在為您準備優質的家具產品，敬請期待</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {products.map((product, index) => {
              // 檢查是否為測試產品
              const isTestProduct = product.id === "test-product-001" || product.description === "測試模式"
              
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-0 shadow-sm overflow-hidden h-full flex flex-col">
                    <CardContent className="p-0">
                      <div 
                        className="relative aspect-square bg-muted overflow-hidden cursor-pointer"
                        onClick={() => {
                          setQuickViewProduct(product)
                          setQuickViewOpen(true)
                        }}
                      >
                        {product.image_url ? (
                          <Image
                            src={product.image_url}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                            loading="lazy"
                            unoptimized={product.image_url.startsWith("https://") && product.image_url.includes("supabase.co")}
                          />
                          ) : (
                            <div className="w-full h-full relative">
                              <Image
                                src="https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=800"
                                alt="產品預設圖"
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                loading="lazy"
                              />
                            </div>
                          )}
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-col items-start p-4 md:p-6 space-y-3">
                      <div className="flex items-center gap-2 mb-1 flex-wrap w-full">
                        <h3 
                          className="font-medium text-base md:text-lg group-hover:text-primary transition-colors cursor-pointer flex-1"
                          onClick={() => {
                            setQuickViewProduct(product)
                            setQuickViewOpen(true)
                          }}
                        >
                          {product.name}
                        </h3>
                        {isTestProduct && (
                          <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full font-medium whitespace-nowrap">
                            (測試模式)
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 w-full">
                        <span className="text-xl md:text-2xl font-bold text-amber-700">
                          {formatPrice(Number(product.price) || 0)}
                        </span>
                        {product.compare_at_price && Number(product.compare_at_price) > Number(product.price) && (
                          <span className="text-sm text-muted-foreground line-through">
                            {formatPrice(Number(product.compare_at_price))}
                          </span>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full mt-2 border-2 border-[#D2B48C]/50 text-[#333] hover:bg-[#D2B48C] hover:text-white hover:border-[#D2B48C] transition-all duration-300"
                        onClick={(e) => {
                          e.stopPropagation()
                          const stock = product.stock_quantity ?? null
                          // 只有當 stock 明確等於 0 時才顯示缺貨
                          if (stock === null || stock > 0) {
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
                              description: `${product.name} 已成功加入購物車。`,
                            })
                          } else {
                            toast({
                              title: "商品缺貨",
                              description: "此商品目前無庫存。",
                              variant: "destructive",
                            })
                          }
                        }}
                        disabled={product.stock_quantity !== null && product.stock_quantity <= 0}
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        加入購物車
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Quick View Modal */}
        <ProductQuickView
          product={quickViewProduct}
          open={quickViewOpen}
          onOpenChange={setQuickViewOpen}
        />

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <Link href="/products">
            <button className="text-primary hover:underline font-medium">
              查看所有產品 →
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
