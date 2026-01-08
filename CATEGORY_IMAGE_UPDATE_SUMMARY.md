# 分類區塊背景圖片更新總結

## ✅ 已完成的更新

### 1. 更新分類資料
- ✅ 為分類陣列增加 `image` 屬性
- ✅ 設定對應的 Unsplash 圖片 URL

### 2. 設定對應圖片
- ✅ **沙發**：`https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=500`
- ✅ **餐桌椅**：`https://images.unsplash.com/photo-1577145900570-4c0537cf59a4?q=80&w=500`
- ✅ **床組**：`https://images.unsplash.com/photo-1505693419148-ad3b471e4c57?q=80&w=500`
- ✅ **櫥櫃**：`https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=500`
- ✅ **茶几**：`https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=500`
- ✅ **燈具**：`https://images.unsplash.com/photo-1513506191703-513506191703?q=80&w=500`

### 3. UI 優化
- ✅ 將原本的灰色方塊改為 `background-image`
- ✅ 使用 `bg-cover` 和 `bg-center` 確保圖片填滿
- ✅ 在圖片上覆蓋半透明黑影（`bg-black/40`，hover 時變為 `bg-black/50`）
- ✅ 加上 `hover:scale-105` 效果，滑鼠移過去時圖片會輕微放大
- ✅ 添加 `drop-shadow-lg` 讓文字更清晰

---

## 🎨 UI 設計特點

### 背景圖片
- 使用 `backgroundImage` CSS 屬性
- `bg-cover` 確保圖片填滿容器
- `bg-center` 確保圖片居中顯示

### 覆蓋層
- **預設**：`bg-black/40`（40% 黑色透明度）
- **Hover**：`bg-black/50`（50% 黑色透明度）
- 確保白色文字清晰可見

### Hover 效果
- **圖片縮放**：`group-hover:scale-105`（放大 5%）
- **覆蓋層加深**：hover 時透明度從 40% 變為 50%
- **陰影增強**：`hover:shadow-lg`

### 文字樣式
- **顏色**：白色（`text-white`）
- **字體大小**：`text-lg`
- **字體粗細**：`font-medium`
- **陰影**：`drop-shadow-lg`（讓文字更清晰）

---

## 📋 技術實現

### 分類資料結構
```typescript
const categories = [
  { 
    id: "1", 
    name: "沙發", 
    slug: "sofa", 
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=500" 
  },
  // ... 其他分類
]
```

### UI 結構
```tsx
<div className="relative aspect-square overflow-hidden">
  {/* 背景圖片 */}
  <div 
    className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
    style={{
      backgroundImage: `url(${category.image})`,
    }}
  />
  {/* 半透明覆蓋層 */}
  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-300" />
  {/* 分類文字 */}
  <div className="absolute inset-0 flex items-center justify-center z-10">
    <span className="text-white text-lg font-medium drop-shadow-lg">
      {category.name}
    </span>
  </div>
</div>
```

---

## 🔧 Next.js 配置更新

### 添加 Unsplash 域名支援
在 `next.config.js` 中添加：
```javascript
{
  protocol: 'https',
  hostname: 'images.unsplash.com',
}
```

這樣 Next.js Image 組件可以正常載入 Unsplash 圖片。

---

## ✅ 測試檢查清單

- [ ] 打開首頁，查看分類區塊
- [ ] 確認每個分類都顯示對應的背景圖片
- [ ] 確認圖片填滿整個容器（沒有空白）
- [ ] 確認白色文字清晰可見（有覆蓋層）
- [ ] 測試 hover 效果：滑鼠移過去時圖片放大
- [ ] 測試 hover 效果：覆蓋層變深
- [ ] 確認所有 6 個分類都正常顯示

---

## 📝 修改的檔案

1. **`components/category-section.tsx`**
   - 更新分類陣列，添加 Unsplash 圖片 URL
   - 將灰色背景改為背景圖片
   - 添加半透明覆蓋層
   - 添加 hover 縮放效果
   - 優化文字樣式

2. **`next.config.js`**
   - 添加 `images.unsplash.com` 到 `remotePatterns`

---

## 🎉 完成！

所有更新已完成，沒有語法錯誤。分類區塊現在會顯示美麗的背景圖片，並有流暢的 hover 效果！

**下一步：**
1. 重新整理首頁（Ctrl + F5）
2. 查看分類區塊
3. 測試 hover 效果
4. 確認所有圖片正常顯示
