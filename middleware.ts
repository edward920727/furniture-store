import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 白名單：這些路徑不需要認證，直接放行
  const publicPaths = [
    "/",                    // 首頁
    "/products",            // 產品列表
    "/products/",           // 產品列表（帶斜線）
    "/about",               // 關於我們
    "/contact",             // 聯絡我們
    "/admin/login",         // 管理員登入頁
    "/auth/login",          // 會員登入頁
    "/auth/register",       // 會員註冊頁
    "/profile",             // 會員中心（由頁面自己處理認證）
    "/cart",                // 購物車
    "/checkout",            // 結帳頁面
  ]

  // 靜態資源和 Next.js 內部路徑，直接放行
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/static") ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|css|js|woff|woff2|ttf|eot)$/)
  ) {
    return NextResponse.next()
  }

  // 檢查是否為公開路徑
  const isPublicPath = publicPaths.some((path) => {
    if (path === "/") {
      return pathname === "/"
    }
    return pathname.startsWith(path)
  })

  // 如果是公開路徑，直接放行
  if (isPublicPath) {
    return NextResponse.next()
  }

  // 只有 /admin 開頭的路徑（除了 /admin/login）需要認證
  // 但這裡不進行認證檢查，讓各個頁面自己處理
  // 這樣可以避免攔截首頁和其他公開頁面
  // 注意：認證檢查由 app/admin/layout.tsx 和 app/admin/page.tsx 處理
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    // 讓 admin layout 和頁面自己處理認證，這裡只放行
    // 不會因為過期的 Session 而將已登入的使用者踢回登入頁
    return NextResponse.next()
  }

  // 其他所有路徑都直接放行
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
