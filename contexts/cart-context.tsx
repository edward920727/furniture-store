"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

export interface CartItem {
  id: string
  name: string
  slug: string
  price: number
  compare_at_price?: number
  image_url?: string
  quantity: number
  stock_quantity: number
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: Omit<CartItem, "quantity">) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  // 從 localStorage 載入購物車
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem("cart")
      if (savedCart) {
        try {
          setItems(JSON.parse(savedCart))
        } catch (error) {
          console.error("載入購物車失敗:", error)
        }
      }
    }
  }, [])

  // 儲存購物車到 localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cart", JSON.stringify(items))
    }
  }, [items])

  const addItem = (item: Omit<CartItem, "quantity">) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.id === item.id)
      if (existingItem) {
        // 如果已存在，增加數量（不超過庫存）
        const newQuantity = Math.min(
          existingItem.quantity + 1,
          item.stock_quantity
        )
        return prevItems.map((i) =>
          i.id === item.id ? { ...i, quantity: newQuantity } : i
        )
      } else {
        // 如果不存在，新增項目
        return [...prevItems, { ...item, quantity: 1 }]
      }
    })
  }

  const removeItem = (id: string) => {
    setItems((prevItems) => prevItems.filter((i) => i.id !== id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    setItems((prevItems) => {
      const item = prevItems.find((i) => i.id === id)
      if (!item) return prevItems

      // 確保數量在有效範圍內
      const newQuantity = Math.max(1, Math.min(quantity, item.stock_quantity))
      return prevItems.map((i) =>
        i.id === id ? { ...i, quantity: newQuantity } : i
      )
    })
  }

  const clearCart = () => {
    setItems([])
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
