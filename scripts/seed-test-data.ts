// 用於在 Supabase 中插入測試數據的腳本
// 使用方法：在 Supabase SQL Editor 中執行此腳本，或使用 Supabase CLI

import { testProducts } from "../lib/test-data"

// 這個腳本可以轉換為 SQL INSERT 語句
export function generateSeedSQL() {
  const sqlStatements: string[] = []

  // 先確保分類存在
  const categories = [
    { slug: "sofa", name: "沙發" },
    { slug: "dining", name: "餐桌椅" },
    { slug: "bedroom", name: "床組" },
    { slug: "bookshelf", name: "書櫃" },
    { slug: "coffee-table", name: "茶几" },
    { slug: "lighting", name: "燈具" },
  ]

  categories.forEach((cat) => {
    sqlStatements.push(`
      INSERT INTO categories (slug, name, is_active, sort_order)
      VALUES ('${cat.slug}', '${cat.name}', true, 1)
      ON CONFLICT (slug) DO NOTHING;
    `)
  })

  // 插入產品
  testProducts.forEach((product, index) => {
    const categoryId = `(SELECT id FROM categories WHERE slug = '${product.category}' LIMIT 1)`
    
    sqlStatements.push(`
      INSERT INTO products (
        name, slug, description, price, compare_at_price, 
        stock_quantity, category_id, is_featured, is_active,
        dimensions, weight
      )
      VALUES (
        '${product.name.replace(/'/g, "''")}',
        '${product.slug}',
        '${product.description.replace(/'/g, "''")}',
        ${product.price},
        ${product.compare_at_price || "NULL"},
        ${product.stock_quantity},
        ${categoryId},
        ${product.is_featured},
        true,
        '${JSON.stringify(product.dimensions)}'::jsonb,
        ${product.weight}
      )
      ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        price = EXCLUDED.price;
    `)

    // 插入產品圖片
    product.images.forEach((imageUrl, imgIndex) => {
      sqlStatements.push(`
        INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
        VALUES (
          (SELECT id FROM products WHERE slug = '${product.slug}' LIMIT 1),
          '${imageUrl}',
          '${product.name} - 圖片 ${imgIndex + 1}',
          ${imgIndex},
          ${imgIndex === 0}
        );
      `)
    })
  })

  return sqlStatements.join("\n")
}

// 如果直接執行此文件，輸出 SQL
if (require.main === module) {
  console.log(generateSeedSQL())
}
