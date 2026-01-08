"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"

interface Category {
  id: string
  name: string
  slug: string
  image_url?: string
}

// 預設分類圖片（如果資料庫沒有圖片時使用）
const defaultCategoryImages: Record<string, string> = {
  sofa: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=800",
  dining: "https://images.unsplash.com/photo-1617806118233-18e1de208fa0?q=80&w=800",
  bedroom: "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?q=80&w=800",
  bookshelf: "https://images.unsplash.com/photo-1556912173-3bb406ef7e77?q=80&w=800",
  "coffee-table": "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=800",
  lighting: "https://images.unsplash.com/photo-1543248939-ff40856f65d4?q=80&w=800",
}

export function CategorySection() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [])

  async function fetchCategories() {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug, image_url")
        .eq("is_active", true)
        .order("sort_order")

      if (error) {
        console.error("Error fetching categories:", error)
        // 如果載入失敗，使用預設分類
        setCategories([])
      } else {
        // 為沒有圖片的分類添加預設圖片
        const categoriesWithImages = (data || []).map((cat) => ({
          ...cat,
          image_url: cat.image_url || defaultCategoryImages[cat.slug] || defaultCategoryImages.sofa,
        }))
        setCategories(categoriesWithImages)
      }
    } catch (error) {
      console.error("Exception in fetchCategories:", error)
      setCategories([])
    } finally {
      setLoading(false)
    }
  }
  return (
    <section className="py-24 bg-background">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-light mb-4 text-[#333]">產品分類</h2>
          <p className="text-[#333]/70 text-lg">探索我們的精選系列</p>
        </motion.div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">載入分類中...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">暫無分類</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Link href={`/products?category=${category.slug}`}>
                  <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm overflow-hidden h-full">
                    <CardContent className="p-0">
                      <div className="relative aspect-square overflow-hidden rounded-lg">
                        {/* 背景圖片 */}
                        <div 
                          className="absolute inset-0 bg-cover bg-center transition-all duration-500 group-hover:scale-105"
                          style={{
                            backgroundImage: `url(${category.image_url})`,
                          }}
                        />
                        {/* 半透明覆蓋層（確保文字清晰可見） */}
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-all duration-500" />
                        {/* 分類文字 */}
                        <div className="absolute inset-0 flex items-center justify-center z-10">
                          <span className="text-white text-lg font-medium drop-shadow-lg group-hover:drop-shadow-2xl transition-all duration-500">
                            {category.name}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
