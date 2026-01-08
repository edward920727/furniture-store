import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-6xl font-light">404</h1>
          <p className="text-xl text-muted-foreground">找不到此頁面</p>
          <Link href="/">
            <Button>返回首頁</Button>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}
