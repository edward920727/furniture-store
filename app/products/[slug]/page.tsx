import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductDetail } from "@/components/product-detail"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"

export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string }
}) {
  const supabase = await createClient()
  // 暫時移除 product_images 關聯，避免 schema cache 報錯
  const { data: product } = await supabase
    .from("products")
    .select(`
      *,
      categories (name, slug)
    `)
    .eq("slug", params.slug)
    .eq("is_active", true)
    .single()

  if (!product) {
    notFound()
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <ProductDetail product={product} />
      </main>
      <Footer />
    </div>
  )
}
