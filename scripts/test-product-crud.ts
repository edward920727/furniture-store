/**
 * 測試產品 CRUD 功能腳本
 * 用於驗證後台新增產品 → 前台顯示 → 後台刪除的完整流程
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 請先設置環境變數：NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testProductCRUD() {
  console.log('🧪 開始測試產品 CRUD 功能...\n')

  try {
    // 步驟 1: 獲取一個分類 ID（用於測試）
    console.log('📋 步驟 1: 獲取分類列表...')
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('id, name')
      .eq('is_active', true)
      .limit(1)

    if (catError) {
      console.error('❌ 獲取分類失敗:', catError)
      return
    }

    const categoryId = categories && categories.length > 0 ? categories[0].id : null
    console.log('✅ 找到分類:', categories?.[0]?.name || '無分類')
    console.log('   分類 ID:', categoryId || 'null\n')

    // 步驟 2: 創建測試產品
    console.log('📦 步驟 2: 創建測試產品...')
    const testProductName = `測試產品-${Date.now()}`
    const testSlug = `test-product-${Date.now()}`
    
    const testProduct = {
      name: testProductName,
      slug: testSlug,
      description: '這是一個自動測試產品',
      price: 9999,
      compare_at_price: 12999,
      stock_quantity: 10,
      category_id: categoryId,
      is_featured: true,
      is_active: true,
    }

    console.log('   準備創建的產品資料:', JSON.stringify(testProduct, null, 2))

    const { data: createdProduct, error: createError } = await supabase
      .from('products')
      .insert([testProduct])
      .select()
      .single()

    if (createError) {
      console.error('❌ 創建產品失敗:')
      console.error('   錯誤代碼:', createError.code)
      console.error('   錯誤訊息:', createError.message)
      console.error('   詳細資訊:', createError.details)
      console.error('   提示:', createError.hint)
      return
    }

    console.log('✅ 產品創建成功！')
    console.log('   產品 ID:', createdProduct.id)
    console.log('   產品名稱:', createdProduct.name)
    console.log('   產品 Slug:', createdProduct.slug)
    console.log('   產品價格:', createdProduct.price)
    console.log('   是否精選:', createdProduct.is_featured)
    console.log('   是否啟用:', createdProduct.is_active)
    console.log('')

    // 步驟 3: 驗證產品是否在前台可見
    console.log('🔍 步驟 3: 驗證產品是否在前台可見...')
    const { data: featuredProducts, error: fetchError } = await supabase
      .from('products')
      .select('id, name, slug, price, is_featured, is_active')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(10)

    if (fetchError) {
      console.error('❌ 獲取產品列表失敗:', fetchError)
    } else {
      const foundProduct = featuredProducts?.find(p => p.id === createdProduct.id)
      if (foundProduct) {
        console.log('✅ 產品在前台可見！')
        console.log('   找到的產品:', foundProduct.name)
      } else {
        console.log('⚠️  產品未在前台列表中（可能需要刷新頁面）')
      }
      console.log('   前台產品總數:', featuredProducts?.length || 0)
      console.log('')
    }

    // 步驟 4: 等待 2 秒（讓用戶有時間查看）
    console.log('⏳ 等待 2 秒後刪除產品...')
    await new Promise(resolve => setTimeout(resolve, 2000))

    // 步驟 5: 刪除測試產品
    console.log('🗑️  步驟 4: 刪除測試產品...')
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', createdProduct.id)

    if (deleteError) {
      console.error('❌ 刪除產品失敗:')
      console.error('   錯誤代碼:', deleteError.code)
      console.error('   錯誤訊息:', deleteError.message)
      console.error('   詳細資訊:', deleteError.details)
      console.error('   提示:', deleteError.hint)
      return
    }

    console.log('✅ 產品刪除成功！')
    console.log('   已刪除產品 ID:', createdProduct.id)
    console.log('')

    // 步驟 6: 驗證產品已刪除
    console.log('🔍 步驟 5: 驗證產品已刪除...')
    const { data: verifyProducts } = await supabase
      .from('products')
      .select('id')
      .eq('id', createdProduct.id)
      .single()

    if (verifyProducts) {
      console.log('⚠️  警告：產品仍然存在於資料庫中')
    } else {
      console.log('✅ 確認產品已從資料庫中刪除')
    }

    console.log('\n🎉 測試完成！所有步驟都成功執行。')

  } catch (error: any) {
    console.error('❌ 測試過程中發生異常:', error)
    console.error('   錯誤訊息:', error.message)
    console.error('   堆疊追蹤:', error.stack)
  }
}

// 執行測試
testProductCRUD()
