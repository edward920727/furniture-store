import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          <h1 className="text-4xl md:text-5xl font-light">關於我們</h1>
          <div className="prose max-w-none space-y-4">
            <p className="text-lg text-muted-foreground leading-relaxed">
              張馨家居致力於為您提供高品質的北歐極簡風格家具，打造理想中的居家空間。
            </p>
            <p className="text-muted-foreground leading-relaxed">
              我們精選來自世界各地的優質家具，每一件產品都經過嚴格篩選，確保品質與設計的完美結合。
            </p>
            <p className="text-muted-foreground leading-relaxed">
              無論是客廳、臥室、書房還是餐廳，我們都能為您提供最適合的家具解決方案。
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
