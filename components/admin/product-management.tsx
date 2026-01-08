"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Plus, Edit, Trash2, Image as ImageIcon, Search } from "lucide-react"
import { formatPrice } from "@/lib/utils"
import dynamic from "next/dynamic"
import Cropper, { Area } from "react-easy-crop"

// 動態載入富文本編輯器（避免 SSR 問題）
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false })
import "react-quill/dist/quill.snow.css"

interface Product {
  id: string
  name: string
  slug: string
  description?: string
  rich_description?: string
  price: number
  compare_at_price?: number
  stock_quantity: number
  category_id?: string
  is_featured: boolean
  is_active: boolean
  created_at?: string
  image_url?: string
  categories: { name: string } | null
}

interface Category {
  id: string
  name: string
}

export function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const { toast } = useToast()

  // 表單狀態
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    rich_description: "",
    price: "",
    compare_at_price: "",
    stock_quantity: "",
    category_id: "",
    is_featured: false,
    is_active: true,
  })

  // 圖片上傳狀態
  const [uploadedImages, setUploadedImages] = useState<Array<{ url: string; key: string }>>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [manualImageUrl, setManualImageUrl] = useState("")
  const [showManualInput, setShowManualInput] = useState(false)
  
  // 圖片裁切狀態
  const [showCropModal, setShowCropModal] = useState(false)
  const [imageToCrop, setImageToCrop] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [cropAspectRatio, setCropAspectRatio] = useState(1) // 1:1 正方形，適合產品圖片

  // 使用 useEffect 呼叫 fetchProducts
  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  // 簡化讀取：只抓 products 表的基礎欄位，不關聯 product_images
  async function fetchProducts() {
    try {
      setLoading(true)
      const supabase = createClient()

      // 只讀取 products 表的基礎欄位，絕對不關聯 product_images 表
      const { data, error } = await supabase
        .from("products")
        .select(`
          id,
          name,
          slug,
          description,
          price,
          compare_at_price,
          stock_quantity,
          category_id,
          is_featured,
          is_active,
          created_at,
          image_url,
          categories (name)
        `)
        .order("created_at", { ascending: false })

      // 調試日誌
      console.log("Products Debug:", { data, error })

      if (error) {
        console.error("❌ Error fetching products:", error)
        console.error("錯誤代碼:", error.code)
        console.error("錯誤訊息:", error.message)
        alert(`載入產品失敗：${error.message}\n\n錯誤代碼：${error.code || "未知"}`)
        toast({
          title: "載入產品失敗",
          description: error.message || "無法載入產品列表",
          variant: "destructive",
        })
        setProducts([])
        setFilteredProducts([])
      } else {
        // 處理 categories 的類型轉換
        const productsData = (data || []).map((item: any) => ({
          ...item,
          categories: item.categories && Array.isArray(item.categories) && item.categories.length > 0
            ? item.categories[0]
            : item.categories || null,
        })) as Product[]
        setProducts(productsData)
        setFilteredProducts(productsData)
        console.log("✅ 成功載入", productsData.length, "個產品")
      }
    } catch (err: any) {
      console.error("Exception in fetchProducts:", err)
      alert(`載入產品異常：${err.message || "發生未知錯誤"}`)
      toast({
        title: "載入產品失敗",
        description: err.message || "發生未知錯誤",
        variant: "destructive",
      })
      setProducts([])
      setFilteredProducts([])
    } finally {
      setLoading(false)
    }
  }

  // 搜尋和篩選功能
  useEffect(() => {
    let filtered = [...products]

    // 搜尋篩選
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.slug.toLowerCase().includes(query)
      )
    }

    // 分類篩選
    if (selectedCategory !== "all") {
      filtered = filtered.filter((product) => product.category_id === selectedCategory)
    }

    setFilteredProducts(filtered)
  }, [products, searchQuery, selectedCategory])

  async function fetchCategories() {
    try {
      setCategoriesLoading(true)
      const supabase = createClient()
      const { data, error } = await supabase
        .from("categories")
        .select("id, name")
        .eq("is_active", true)
        .order("sort_order")

      if (error) {
        console.error("Error fetching categories:", error)
        toast({
          title: "載入分類失敗",
          description: error.message,
          variant: "destructive",
        })
        setCategories([])
      } else {
        const validCategories = (data || []).filter(
          (cat) => cat && cat.id && cat.name
        ) as Category[]
        setCategories(validCategories)
      }
    } catch (error: any) {
      console.error("Error fetching categories:", error)
      toast({
        title: "載入分類失敗",
        description: error.message || "無法載入分類資料",
        variant: "destructive",
      })
      setCategories([])
    } finally {
      setCategoriesLoading(false)
    }
  }

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product)
      setFormData({
        name: product.name,
        description: product.description || "",
        rich_description: product.rich_description || "",
        price: product.price.toString(),
        compare_at_price: product.compare_at_price?.toString() || "",
        stock_quantity: product.stock_quantity.toString(),
        category_id: product.category_id || "",
        is_featured: product.is_featured,
        is_active: product.is_active,
      })
      // 如果有 image_url，載入為已上傳的圖片（用於預覽）
      if (product.image_url && product.image_url !== "https://placehold.co/600x400?text=No+Image") {
        setUploadedImages([{ url: product.image_url, key: `existing-${product.id}` }])
      } else {
        setUploadedImages([])
      }
    } else {
      setEditingProduct(null)
      setFormData({
        name: "",
        description: "",
        rich_description: "",
        price: "",
        compare_at_price: "",
        stock_quantity: "99", // 預設值改為 99
        category_id: "",
        is_featured: false,
        is_active: true,
      })
      setUploadedImages([])
    }
    setDialogOpen(true)
  }

  const handleRemoveImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index))
  }

  // 上傳圖片到 Supabase Storage
  const uploadImageToSupabase = async (file: File): Promise<string | null> => {
    try {
      const supabase = createClient()
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `products/${fileName}`

      // 上傳到 Supabase Storage 的 product-images bucket
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('上傳失敗:', error)
        throw error
      }

      // 獲取公開 URL
      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath)

      return urlData.publicUrl
    } catch (error: any) {
      console.error('上傳圖片錯誤:', error)
      return null
    }
  }

  // 處理檔案選擇（先顯示裁切視窗）
  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return

    const file = files[0]

    // 檢查檔案類型
    if (!file.type.startsWith('image/')) {
      alert('請選擇圖片檔案！')
      return
    }

    // 檢查檔案大小（限制 5MB）
    if (file.size > 5 * 1024 * 1024) {
      alert('圖片大小不能超過 5MB！')
      return
    }

    // 讀取檔案並顯示裁切視窗
    const reader = new FileReader()
    reader.onload = () => {
      setImageToCrop(reader.result as string)
      setShowCropModal(true)
      setCrop({ x: 0, y: 0 })
      setZoom(1)
    }
    reader.readAsDataURL(file)
  }

  // 裁切完成後的回調
  const onCropComplete = (croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }

  // 將裁切後的圖片轉換為 Blob
  const createImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const image = new Image()
      image.addEventListener('load', () => resolve(image))
      image.addEventListener('error', (error) => reject(error))
      image.src = url
    })
  }

  // 獲取裁切後的圖片 Blob
  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: Area
  ): Promise<Blob> => {
    const image = await createImage(imageSrc)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      throw new Error('無法創建 Canvas 上下文')
    }

    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    )

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Canvas 轉換失敗'))
          return
        }
        resolve(blob)
      }, 'image/jpeg', 0.95)
    })
  }

  // 確認裁切並上傳
  const handleConfirmCrop = async () => {
    if (!imageToCrop || !croppedAreaPixels) return

    setIsUploading(true)
    try {
      // 將裁切後的圖片轉換為 Blob
      const croppedBlob = await getCroppedImg(imageToCrop, croppedAreaPixels)
      
      // 創建 File 物件
      const croppedFile = new File([croppedBlob], `cropped-${Date.now()}.jpg`, {
        type: 'image/jpeg',
      })

      // 上傳到 Supabase Storage
      const imageUrl = await uploadImageToSupabase(croppedFile)

      if (imageUrl) {
        setUploadedImages([...uploadedImages, { url: imageUrl, key: `upload-${Date.now()}` }])
        toast({
          title: "上傳成功",
          description: "圖片已成功裁切並上傳",
        })
        // 關閉裁切視窗
        setShowCropModal(false)
        setImageToCrop(null)
        setCroppedAreaPixels(null)
      } else {
        // 上傳失敗，顯示手動輸入選項
        alert('❌ 上傳失敗！\n\n可能的原因：\n1. Supabase Storage bucket "product-images" 不存在\n2. 權限設定問題\n\n請點擊「手動輸入圖片網址」作為備案。')
        setShowManualInput(true)
        setShowCropModal(false)
        setImageToCrop(null)
      }
    } catch (error: any) {
      console.error('上傳錯誤:', error)
      alert(`❌ 上傳失敗：${error.message || '未知錯誤'}\n\n請點擊「手動輸入圖片網址」作為備案。`)
      setShowManualInput(true)
      setShowCropModal(false)
      setImageToCrop(null)
    } finally {
      setIsUploading(false)
    }
  }

  // 拖曳處理
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    handleFileSelect(files)
  }

  // 手動輸入圖片 URL
  const handleManualImageUrlSubmit = () => {
    if (manualImageUrl.trim()) {
      // 簡單驗證 URL 格式
      try {
        new URL(manualImageUrl)
        setUploadedImages([...uploadedImages, { url: manualImageUrl.trim(), key: `manual-${Date.now()}` }])
        setManualImageUrl("")
        setShowManualInput(false)
        toast({
          title: "圖片已添加",
          description: "手動輸入的圖片 URL 已加入",
        })
      } catch {
        alert('請輸入有效的圖片網址！')
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()

    // 確保類別 ID 是有效的 UUID
    let categoryId: string | null = null
    if (formData.category_id && formData.category_id !== "__none__") {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      if (uuidRegex.test(formData.category_id)) {
        categoryId = formData.category_id
      } else {
        const foundCategory = categories.find(cat => cat.id === formData.category_id)
        if (foundCategory) {
          categoryId = foundCategory.id
        }
      }
    }

    // 準備產品資料
    // 如果有上傳圖片，使用第一張圖片的 URL；否則使用 placeholder
    const imageUrl = uploadedImages.length > 0 
      ? uploadedImages[0].url 
      : "https://placehold.co/600x400?text=No+Image"

    const productData: any = {
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      rich_description: formData.rich_description || null,
      price: parseFloat(formData.price) || 0,
      compare_at_price: formData.compare_at_price ? parseFloat(formData.compare_at_price) : null,
      stock_quantity: formData.stock_quantity ? parseInt(formData.stock_quantity) : 99, // 如果為空，預設為 99
      category_id: categoryId,
      is_featured: formData.is_featured || false,
      is_active: formData.is_active !== undefined ? formData.is_active : true,
      image_url: imageUrl, // 將圖片 URL 加入產品資料
    }

    console.log("準備提交的產品資料:", productData)

    if (editingProduct) {
      // 更新產品
      // 如果有上傳圖片，使用第一張圖片的 URL；否則保持原有圖片或使用 placeholder
      const updateImageUrl = uploadedImages.length > 0 
        ? uploadedImages[0].url 
        : (editingProduct.image_url || "https://placehold.co/600x400?text=No+Image")
      
      const updateData = {
        ...productData,
        image_url: updateImageUrl,
      }

      const { error } = await supabase
        .from("products")
        .update(updateData)
        .eq("id", editingProduct.id)

      if (error) {
        console.error("更新產品錯誤:", error)
        alert(`更新失敗：${error.message}\n\n錯誤代碼：${error.code || "未知"}`)
        toast({
          title: "更新失敗",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "更新成功",
          description: "產品已更新",
        })
        setDialogOpen(false)
        await fetchProducts()
      }
    } else {
      // 創建產品：使用唯一 slug
      const slug = `product-${Date.now()}`

      console.log("準備創建產品，使用 slug:", slug)

      try {
        const { data: insertData, error } = await supabase
          .from("products")
          .insert([{ ...productData, slug }])
          .select()

        // 調試日誌
        console.log("Insert Result:", { data: insertData, error })

        if (error) {
          console.error("創建產品錯誤:", error)
          console.error("錯誤代碼:", error.code)
          console.error("錯誤訊息:", error.message)
          console.error("錯誤詳情:", error.details)

          // 檢查是否為 RLS 權限錯誤
          const isRLSError = error.code === "42501" ||
                            error.message.includes("permission") ||
                            error.message.includes("policy") ||
                            error.message.includes("RLS")

          if (isRLSError) {
            alert(`❌ RLS 權限錯誤！\n\n錯誤訊息：${error.message}\n\n請檢查：\n1. 是否已登入管理員帳號\n2. admin_users 表中是否有你的記錄\n3. admin_users.is_active 是否為 true\n\n錯誤代碼：${error.code || "未知"}`)
          } else {
            alert(`創建失敗：${error.message}\n\n錯誤代碼：${error.code || "未知"}\n詳細資訊：${error.details || "無"}`)
          }

          toast({
            title: "創建失敗",
            description: error.message || "發生未知錯誤",
            variant: "destructive",
          })
        } else {
          // 成功創建產品，處理圖片
          const productId = insertData[0].id

          if (uploadedImages.length > 0) {
            const imageRecords = uploadedImages.map((img, index) => ({
              product_id: productId,
              image_url: img.url,
              alt_text: `${productData.name} - 圖片 ${index + 1}`,
              sort_order: index,
              is_primary: index === 0,
            }))

            const { error: imageError } = await supabase
              .from("product_images")
              .insert(imageRecords)

            if (imageError) {
              console.error("插入圖片失敗:", imageError)
              toast({
                title: "產品創建成功",
                description: "但圖片上傳失敗，請稍後編輯產品添加圖片",
                variant: "default",
              })
            }
          }

          console.log("✅ 產品創建成功！", insertData)
          toast({
            title: "創建成功",
            description: "產品已創建",
          })
          setDialogOpen(false)
          setFormData({
            name: "",
            description: "",
            rich_description: "",
            price: "",
            compare_at_price: "",
            stock_quantity: "0",
            category_id: "",
            is_featured: false,
            is_active: true,
          })
          setUploadedImages([])
          // 重新獲取產品列表
          await fetchProducts()
        }
      } catch (err: any) {
        console.error("創建產品異常：", err)
        alert(`創建異常：${err.message || "發生未知錯誤"}\n\n詳細資訊：${JSON.stringify(err, null, 2)}`)
        toast({
          title: "創建失敗",
          description: err.message || "發生未知錯誤",
          variant: "destructive",
        })
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("確定要刪除此產品嗎？此操作無法復原。")) {
      return
    }

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id)

      if (error) {
        console.error("刪除產品錯誤:", error)
        alert(`刪除失敗：${error.message}\n\n錯誤代碼：${error.code || "未知"}`)
        toast({
          title: "刪除失敗",
          description: error.message || "無法刪除產品",
          variant: "destructive",
        })
      } else {
        console.log("✅ 產品刪除成功！")
        toast({
          title: "刪除成功",
          description: "產品已刪除",
        })
        await fetchProducts()
      }
    } catch (err: any) {
      console.error("刪除產品異常：", err)
      alert(`刪除異常：${err.message || "發生未知錯誤"}`)
      toast({
        title: "刪除失敗",
        description: err.message || "發生未知錯誤",
        variant: "destructive",
      })
    }
  }

  // 快速生成測試產品
  const handleCreateTestProduct = async () => {
    try {
      const supabase = createClient()
      const randomId = Math.floor(Math.random() * 100000)

      const { data: categories } = await supabase
        .from("categories")
        .select("id")
        .eq("is_active", true)
        .limit(1)

      const testProduct = {
        name: `測試沙發 ${randomId}`,
        slug: `product-${Date.now()}`,
        description: "這是一個自動生成的測試產品",
        price: 5000 + randomId,
        compare_at_price: 6000 + randomId,
        stock_quantity: 10,
        category_id: categories && categories.length > 0 ? categories[0].id : null,
        is_featured: false,
        is_active: true,
      }

      const { data, error } = await supabase
        .from("products")
        .insert([testProduct])
        .select()

      console.log("Insert Result:", { data, error })

      if (error) {
        console.error("創建測試產品失敗:", error)
        alert(`創建測試產品失敗：${error.message}\n\n錯誤代碼：${error.code || "未知"}`)
        toast({
          title: "創建測試產品失敗",
          description: error.message || "無法創建測試產品",
          variant: "destructive",
        })
      } else {
        console.log("✅ 測試產品創建成功:", data)
        toast({
          title: "測試產品已創建",
          description: `已成功創建「${testProduct.name}」`,
        })
        await fetchProducts()
      }
    } catch (err: any) {
      console.error("創建測試產品異常:", err)
      alert(`創建測試產品異常：${err.message || "發生未知錯誤"}`)
      toast({
        title: "創建測試產品失敗",
        description: err.message || "發生未知錯誤",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">載入中...</p>
        <p className="text-sm text-muted-foreground mt-2">請查看瀏覽器 Console 了解載入狀態</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">產品管理</h1>
          <p className="text-muted-foreground mt-2">管理您的產品目錄</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleCreateTestProduct}
          >
            快速生成測試資料
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                新增產品
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? "編輯產品" : "新增產品"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">產品名稱 *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category_id">分類</Label>
                    {categoriesLoading ? (
                      <div className="flex h-10 items-center px-3 text-sm text-muted-foreground border rounded-md bg-muted">
                        載入分類中...
                      </div>
                    ) : (
                      <Select
                        value={formData.category_id || "__none__"}
                        onValueChange={(value) => {
                          const categoryId = value === "__none__" ? "" : value
                          setFormData({ ...formData, category_id: categoryId })
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="選擇分類" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">無分類</SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>產品圖片</Label>
                  <div className="space-y-4">
                    {/* 已上傳的圖片預覽 */}
                    {uploadedImages.length > 0 && (
                      <div className="grid grid-cols-4 gap-4">
                        {uploadedImages.map((img, index) => (
                          <div key={index} className="relative group">
                            <div className="relative aspect-square rounded-md overflow-hidden border">
                              <img
                                src={img.url}
                                alt={`產品圖片 ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              ×
                            </button>
                            {index === 0 && (
                              <div className="absolute bottom-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                                主圖
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 拖曳上傳區塊 */}
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`
                        relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
                        ${isDragging 
                          ? 'border-primary bg-primary/5' 
                          : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                        }
                        ${isUploading ? 'opacity-50 pointer-events-none' : ''}
                      `}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="image-upload-input"
                        onChange={(e) => handleFileSelect(e.target.files)}
                        disabled={isUploading}
                      />
                      <label
                        htmlFor="image-upload-input"
                        className="cursor-pointer flex flex-col items-center gap-4"
                      >
                        {isUploading ? (
                          <>
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                            <p className="text-sm text-muted-foreground">上傳中...</p>
                          </>
                        ) : (
                          <>
                            <div className="text-4xl">📷</div>
                            <div>
                              <p className="text-sm font-medium">
                                拖曳圖片至此或點擊上傳
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                支援 JPG、PNG、WebP，最大 5MB • 上傳前可裁切圖片
                              </p>
                            </div>
                          </>
                        )}
                      </label>
                    </div>

                    {/* 手動輸入圖片 URL（備案） */}
                    {showManualInput && (
                      <div className="space-y-2 p-4 border rounded-lg bg-muted/50">
                        <Label className="text-sm font-medium">手動輸入圖片網址（備案）</Label>
                        <div className="flex gap-2">
                          <Input
                            type="url"
                            placeholder="https://example.com/image.jpg"
                            value={manualImageUrl}
                            onChange={(e) => setManualImageUrl(e.target.value)}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleManualImageUrlSubmit}
                          >
                            確認
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setShowManualInput(false)
                              setManualImageUrl("")
                            }}
                          >
                            取消
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          如果 Supabase Storage 上傳失敗，可以手動貼入圖片網址
                        </p>
                      </div>
                    )}

                    {/* 顯示手動輸入按鈕（如果沒有顯示手動輸入區塊） */}
                    {!showManualInput && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowManualInput(true)}
                        className="w-full"
                      >
                        或手動輸入圖片網址
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">簡短描述</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rich_description">詳細描述（富文本）</Label>
                  {typeof window !== "undefined" && (
                    <ReactQuill
                      value={formData.rich_description}
                      onChange={(value) => setFormData({ ...formData, rich_description: value })}
                      theme="snow"
                    />
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">價格 *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="compare_at_price">原價</Label>
                    <Input
                      id="compare_at_price"
                      type="number"
                      step="0.01"
                      value={formData.compare_at_price}
                      onChange={(e) => setFormData({ ...formData, compare_at_price: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock_quantity">庫存數量 *</Label>
                    <Input
                      id="stock_quantity"
                      type="number"
                      min="0"
                      value={formData.stock_quantity}
                      onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                      placeholder="99"
                      required
                    />
                    <p className="text-xs text-muted-foreground">預設值：99（現貨供應）</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_featured"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor="is_featured">精選產品</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor="is_active">啟用</Label>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    取消
                  </Button>
                  <Button type="submit">儲存</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* 圖片裁切 Modal */}
          <Dialog open={showCropModal} onOpenChange={setShowCropModal}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>裁切圖片</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {imageToCrop && (
                  <>
                    <div className="relative w-full h-[400px] bg-black rounded-lg overflow-hidden">
                      <Cropper
                        image={imageToCrop}
                        crop={crop}
                        zoom={zoom}
                        aspect={cropAspectRatio}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropComplete}
                        cropShape="rect"
                        showGrid={true}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>縮放</Label>
                      <input
                        type="range"
                        value={zoom}
                        min={1}
                        max={3}
                        step={0.1}
                        onChange={(e) => setZoom(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowCropModal(false)
                          setImageToCrop(null)
                          setCroppedAreaPixels(null)
                        }}
                      >
                        取消
                      </Button>
                      <Button
                        type="button"
                        onClick={handleConfirmCrop}
                        disabled={isUploading || !croppedAreaPixels}
                      >
                        {isUploading ? "上傳中..." : "確認裁切"}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 搜尋和篩選工具列 */}
      {products.length > 0 && (
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="搜尋產品名稱、描述或代碼..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="選擇分類" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有分類</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {(searchQuery || selectedCategory !== "all") && (
            <div className="mt-2 text-sm text-muted-foreground">
              找到 {filteredProducts.length} 個產品
            </div>
          )}
        </Card>
      )}

      {/* 產品列表 */}
      {products.length === 0 ? (
        <div className="text-center py-12 space-y-4">
          <p className="text-lg text-muted-foreground">目前無產品，請點擊新增</p>
          <p className="text-sm text-muted-foreground">
            請檢查瀏覽器 Console（按 F12）查看詳細的調試資訊
          </p>
          <div className="mt-6">
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              立即新增產品
            </Button>
          </div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12 space-y-4">
          <p className="text-lg text-muted-foreground">沒有找到符合條件的產品</p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery("")
              setSelectedCategory("all")
            }}
          >
            清除篩選條件
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredProducts.map((product) => (
            <Card key={product.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle>{product.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {product.categories?.name || "無分類"} • {formatPrice(product.price)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleOpenDialog(product)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  {/* 產品縮圖 - 縮小尺寸 */}
                  <div className="w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0 border">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {product.description || "無描述"}
                    </p>
                    <div className="flex gap-2 mt-2">
                      {product.is_featured && (
                        <span className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded">
                          精選
                        </span>
                      )}
                      {product.is_active ? (
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                          啟用
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded">
                          停用
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
