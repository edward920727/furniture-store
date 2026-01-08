/**
 * 瀏覽器 Console 測試腳本
 * 在瀏覽器 Console (F12) 中執行此腳本來測試產品新增和刪除功能
 * 
 * 使用方法：
 * 1. 打開 http://localhost:3000/admin/products
 * 2. 按 F12 打開 Console
 * 3. 複製貼上以下代碼並執行
 */

// 測試新增產品
async function testCreateProduct() {
  console.log('🧪 開始測試新增產品...')
  
  try {
    // 動態導入 Supabase client
    const { createClient } = await import('/lib/supabase/client.js')
    const supabase = createClient()
    
    // 獲取一個分類 ID
    const { data: categories } = await supabase
      .from('categories')
      .select('id, name')
      .eq('is_active', true)
      .limit(1)
    
    const categoryId = categories && categories.length > 0 ? categories[0].id : null
    console.log('📋 找到分類:', categories?.[0]?.name || '無分類')
    console.log('   分類 ID:', categoryId)
    
    // 創建測試產品
    const testProduct = {
      name: `測試產品-${Date.now()}`,
      slug: `test-product-${Date.now()}`,
      description: '這是一個自動測試產品',
      price: 9999,
      compare_at_price: 12999,
      stock_quantity: 10,
      category_id: categoryId,
      is_featured: true,
      is_active: true,
    }
    
    console.log('📦 準備創建的產品:', testProduct)
    
    const { data, error } = await supabase
      .from('products')
      .insert([testProduct])
      .select()
      .single()
    
    if (error) {
      console.error('❌ 創建失敗:')
      console.error('   錯誤代碼:', error.code)
      console.error('   錯誤訊息:', error.message)
      console.error('   詳細資訊:', error.details)
      alert(`創建失敗：${error.message}\n\n錯誤代碼：${error.code || '未知'}`)
      return null
    }
    
    console.log('✅ 產品創建成功！')
    console.log('   產品 ID:', data.id)
    console.log('   產品名稱:', data.name)
    console.log('   產品 Slug:', data.slug)
    
    alert(`✅ 產品創建成功！\n\n產品名稱：${data.name}\n產品 ID：${data.id}`)
    
    return data
  } catch (err) {
    console.error('❌ 發生異常:', err)
    alert(`發生異常：${err.message}`)
    return null
  }
}

// 測試刪除產品
async function testDeleteProduct(productId) {
  console.log('🗑️  開始測試刪除產品...')
  console.log('   產品 ID:', productId)
  
  if (!productId) {
    console.error('❌ 請提供產品 ID')
    alert('請提供產品 ID')
    return
  }
  
  try {
    const { createClient } = await import('/lib/supabase/client.js')
    const supabase = createClient()
    
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)
    
    if (error) {
      console.error('❌ 刪除失敗:')
      console.error('   錯誤代碼:', error.code)
      console.error('   錯誤訊息:', error.message)
      console.error('   詳細資訊:', error.details)
      alert(`刪除失敗：${error.message}\n\n錯誤代碼：${error.code || '未知'}`)
      return false
    }
    
    console.log('✅ 產品刪除成功！')
    alert(`✅ 產品刪除成功！\n\n產品 ID：${productId}`)
    
    return true
  } catch (err) {
    console.error('❌ 發生異常:', err)
    alert(`發生異常：${err.message}`)
    return false
  }
}

// 完整測試流程：新增 → 檢查前台 → 刪除
async function testFullFlow() {
  console.log('🚀 開始完整測試流程...\n')
  
  // 步驟 1: 新增產品
  const createdProduct = await testCreateProduct()
  if (!createdProduct) {
    console.log('❌ 測試終止：產品創建失敗')
    return
  }
  
  console.log('\n⏳ 等待 3 秒後檢查前台...')
  await new Promise(resolve => setTimeout(resolve, 3000))
  
  // 步驟 2: 檢查前台
  console.log('\n🔍 檢查前台產品列表...')
  const { createClient } = await import('/lib/supabase/client.js')
  const supabase = createClient()
  
  const { data: featuredProducts } = await supabase
    .from('products')
    .select('id, name, slug, price, is_featured, is_active')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(10)
  
  const foundProduct = featuredProducts?.find(p => p.id === createdProduct.id)
  if (foundProduct) {
    console.log('✅ 產品在前台可見！')
    console.log('   找到的產品:', foundProduct.name)
  } else {
    console.log('⚠️  產品未在前台列表中')
    console.log('   可能原因：')
    console.log('   1. 前台需要刷新頁面')
    console.log('   2. 產品的 is_featured 或 is_active 設定有問題')
  }
  
  console.log('\n⏳ 等待 2 秒後刪除產品...')
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // 步驟 3: 刪除產品
  const deleted = await testDeleteProduct(createdProduct.id)
  if (deleted) {
    console.log('\n🎉 完整測試流程完成！')
  } else {
    console.log('\n⚠️  測試流程完成，但刪除失敗')
  }
}

// 執行完整測試
// testFullFlow()

// 或者分別執行：
// testCreateProduct()  // 只測試新增
// testDeleteProduct('產品ID')  // 只測試刪除
