"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search, Filter } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { formatPrice } from "@/lib/utils"
import { useRouter, useSearchParams } from "next/navigation"

interface Product {
  id: string
  name: string
  slug: string
  price: number
  compare_at_price?: number
  stock_quantity?: number | null
  product_images: { image_url: string; alt_text?: string }[]
  categories: { name: string; slug: string } | null
}

interface Category {
  id: string
  name: string
  slug: string
}

export function ProductList({
  searchQuery: initialSearch,
  categorySlug: initialCategory,
  page: initialPage = 1,
}: {
  searchQuery?: string
  categorySlug?: string
  page?: number
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(initialSearch || "")
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || "all")
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [totalPages, setTotalPages] = useState(1)
  const [sortBy, setSortBy] = useState("newest")

  // 同步 URL 參數變化
  useEffect(() => {
    const search = searchParams.get("search") || ""
    const category = searchParams.get("category") || "all"
    const page = parseInt(searchParams.get("page") || "1")
    setSearchQuery(search)
    setSelectedCategory(category)
    setCurrentPage(page)
  }, [searchParams])

  const itemsPerPage = 12

  useEffect(() => {
    async function fetchCategories() {
      const supabase = createClient()
      const { data } = await supabase
        .from("categories")
        .select("id, name, slug")
        .eq("is_active", true)
        .order("sort_order")

      if (data) {
        setCategories(data as Category[])
      }
    }

    fetchCategories()
  }, [])

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true)
      const supabase = createClient()

      // 先獲取分類 ID（如果選擇了分類）
      let categoryId: string | null = null
      if (selectedCategory !== "all") {
        const category = categories.find((c) => c.slug === selectedCategory)
        categoryId = category?.id || null
      }

      // 暫時移除 product_images 關聯，避免 schema cache 報錯
      let query = supabase
        .from("products")
        .select(`
          id,
          name,
          slug,
          price,
          compare_at_price,
          stock_quantity,
          categories (name, slug)
        `, { count: "exact" })
        .eq("is_active", true)

      // 搜尋
      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
      }

      // 分類篩選
      if (categoryId) {
        query = query.eq("category_id", categoryId)
      }

      // 排序
      if (sortBy === "newest") {
        query = query.order("created_at", { ascending: false })
      } else if (sortBy === "price-low") {
        query = query.order("price", { ascending: true })
      } else if (sortBy === "price-high") {
        query = query.order("price", { ascending: false })
      }

      // 分頁
      const from = (currentPage - 1) * itemsPerPage
      const to = from + itemsPerPage - 1
      query = query.range(from, to)

      const { data, error, count } = await query

      if (!error && data) {
        setProducts(data as Product[])
        setTotalPages(Math.ceil((count || 0) / itemsPerPage))
      }
      setLoading(false)
    }

      fetchProducts()
    }, [searchQuery, selectedCategory, currentPage, sortBy, categories])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    const params = new URLSearchParams(searchParams.toString())
    if (searchQuery.trim()) {
      params.set("search", searchQuery.trim())
    } else {
      params.delete("search")
    }
    router.push(`/products?${params.toString()}`)
  }

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value)
    setCurrentPage(1)
    const params = new URLSearchParams(searchParams.toString())
    if (value !== "all") {
      params.set("category", value)
    } else {
      params.delete("category")
    }
    router.push(`/products?${params.toString()}`)
  }

  return (
    <div className="container py-12">
      {/* 標題 */}
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-light mb-4">所有產品</h1>
        <p className="text-muted-foreground">探索我們的完整產品目錄</p>
      </div>

      {/* 篩選與搜尋 */}
      <div className="mb-8 space-y-4 md:flex md:items-center md:justify-between md:space-y-0">
        <form onSubmit={handleSearch} className="flex-1 max-w-md">
          <div className="relative">
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

        <div className="flex gap-4">
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="選擇分類" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有分類</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.slug}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="排序方式" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">最新上架</SelectItem>
              <SelectItem value="price-low">價格：低到高</SelectItem>
              <SelectItem value="price-high">價格：高到低</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 產品網格 */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">載入中...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">找不到符合條件的產品</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {products.map((product) => (
              <Link key={product.id} href={`/products/${product.slug}`}>
                <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-sm overflow-hidden h-full flex flex-col">
                  <CardContent className="p-0">
                    <div className="relative aspect-square bg-muted overflow-hidden">
                      {product.product_images && product.product_images.length > 0 ? (
                        <Image
                          src={product.product_images[0].image_url}
                          alt={product.product_images[0].alt_text || product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                          loading="lazy"
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
                  <CardFooter className="flex flex-col items-start p-6 space-y-2">
                    <h3 className="font-medium text-lg group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-semibold">
                        {formatPrice(product.price)}
                      </span>
                      {product.compare_at_price && product.compare_at_price > product.price && (
                        <span className="text-sm text-muted-foreground line-through">
                          {formatPrice(product.compare_at_price)}
                        </span>
                      )}
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>

          {/* 分頁 */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                上一頁
              </Button>
              <span className="flex items-center px-4 text-sm text-muted-foreground">
                第 {currentPage} 頁，共 {totalPages} 頁
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                下一頁
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
