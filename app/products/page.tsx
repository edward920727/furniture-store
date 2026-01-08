import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductList } from "@/components/product-list"
import { Suspense } from "react"

interface SearchParams {
  search?: string
  category?: string
  page?: string
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<div className="container py-12 text-center">載入中...</div>}>
          <ProductList
            searchQuery={searchParams.search}
            categorySlug={searchParams.category}
            page={searchParams.page ? parseInt(searchParams.page) : 1}
          />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
