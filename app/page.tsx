import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { HeroBanner } from "@/components/hero-banner"
import { CategorySection } from "@/components/category-section"
import { FeaturedProducts } from "@/components/featured-products"

// 強制重新驗證，確保每次重新整理都會抓到最新資料
export const revalidate = 0

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <HeroBanner />
        <CategorySection />
        <FeaturedProducts />
      </main>
      <Footer />
    </div>
  )
}
