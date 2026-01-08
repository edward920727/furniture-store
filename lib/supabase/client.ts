import { createBrowserClient } from '@supabase/ssr'

let clientInstance: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  // 確保在客戶端環境下執行
  if (typeof window === 'undefined') {
    throw new Error('createClient() should only be called in client components')
  }

  // 檢查環境變數是否存在
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please check your .env.local file.'
    )
  }

  // 如果已經有實例，直接返回（避免重複創建）
  if (clientInstance) {
    return clientInstance
  }

  // 創建新的客戶端實例
  // 注意：Supabase 客戶端會自動處理 Schema Cache，但我們可以通過重新創建實例來清除快取
  try {
    clientInstance = createBrowserClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            // 強制檢查：確保只在瀏覽器端運行
            if (typeof window === 'undefined' || typeof document === 'undefined') {
              return []
            }
            try {
              return document.cookie.split(';').map((cookie) => {
                const [name, ...rest] = cookie.trim().split('=')
                return {
                  name: name || '',
                  value: rest.join('=') || '',
                }
              }).filter(cookie => cookie.name) // 過濾空名稱
            } catch (err) {
              console.warn('Failed to get cookies:', err)
              return []
            }
          },
          setAll(cookiesToSet) {
            // 強制檢查：確保只在瀏覽器端運行
            if (typeof window === 'undefined' || typeof document === 'undefined') {
              return
            }
            if (!cookiesToSet || cookiesToSet.length === 0) {
              return
            }
            cookiesToSet.forEach(({ name, value, options }) => {
              try {
                if (!name || value === undefined) {
                  return
                }
                let cookieString = `${name}=${value}; path=${options?.path || '/'}`
                if (options?.maxAge) {
                  cookieString += `; max-age=${options.maxAge}`
                }
                if (options?.domain) {
                  cookieString += `; domain=${options.domain}`
                }
                if (options?.sameSite) {
                  cookieString += `; samesite=${options.sameSite}`
                }
                if (options?.secure) {
                  cookieString += '; secure'
                }
                document.cookie = cookieString
              } catch (err) {
                console.warn('Failed to set cookie:', err)
              }
            })
          },
        },
        // 清除 Schema Cache 的選項
        db: {
          schema: 'public',
        },
        // 確保每次查詢都使用最新的 schema
        global: {
          headers: {
            'x-client-info': 'supabase-js-web',
          },
        },
      }
    )
  } catch (error) {
    console.error('Failed to create Supabase client:', error)
    throw error
  }

  return clientInstance
}

// 清除客戶端實例（用於強制重新載入 schema）
export function clearClientCache() {
  clientInstance = null
}
