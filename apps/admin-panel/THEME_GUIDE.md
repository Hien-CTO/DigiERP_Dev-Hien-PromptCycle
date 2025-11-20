# 🎨 Hướng dẫn xem Theme Xanh Lá Cây

## 🚀 Cách xem theme mới

### 1. **Truy cập Admin Panel**
```
http://localhost:3000/admin
```

### 2. **Xem Theme Preview (Trang demo đầy đủ)**
```
http://localhost:3000/theme-preview
```

### 3. **Xem Demo Components**
```
http://localhost:3000/demo-theme
```

## 🎯 Những gì bạn sẽ thấy

### ✅ **Trang Admin chính (`/admin`)**
- **Alert xanh lá cây** thông báo theme đã được áp dụng
- **Stats cards** với theme xanh lá cây và trend indicators
- **Module cards** với icon xanh và hover effects
- **Buttons** với màu xanh đậm và animation

### ✅ **Trang Theme Preview (`/theme-preview`)**
- **Wave header/footer** với animation gradient
- **Tất cả components** với theme xanh lá cây
- **Interactive elements** với hover effects
- **Modal demo** với theme mới

### ✅ **Layout chính**
- **Sidebar** với gradient xanh lá cây
- **Menu items** với hover animation
- **Top bar** với backdrop blur
- **Wave effects** ở header và footer

## 🎨 Tính năng Theme

### 🌈 **Dải màu xanh lá cây**
- `green-50` → `green-900` (từ nhạt đến đậm)
- Primary: `#16a34a` (green-600)
- Accent: `#10b981` (emerald-600)

### ✨ **Animations**
- **Menu hover**: Transform + màu sắc
- **Button hover**: Scale + shadow
- **Wave gradient**: 8s infinite animation
- **Fade-in/Slide-in**: Smooth transitions

### 🎯 **Components mới**
- `GreenButton` - Button với nhiều variant
- `GreenCard` - Card với header/footer
- `GreenBadge` - Badge với status
- `GreenAlert` - Alert với animation
- `GreenInput` - Input với validation
- `GreenModal` - Modal với theme

## 🔧 Troubleshooting

### Nếu không thấy theme mới:

1. **Hard refresh** browser: `Ctrl + F5`
2. **Clear cache** browser
3. **Restart dev server**:
   ```bash
   cd apps/admin-panel
   npm run dev
   ```

### Nếu có lỗi build:
```bash
cd apps/admin-panel
npm run build
```

## 📱 Responsive Design

Theme hoạt động tốt trên:
- **Desktop** (1024px+)
- **Tablet** (768px - 1023px)  
- **Mobile** (< 768px)

## 🌙 Dark Mode

Theme hỗ trợ dark mode thông qua CSS variables.

## 🎉 Kết quả

Bạn sẽ thấy một giao diện admin panel hiện đại với:
- **Màu xanh lá cây** làm chủ đạo
- **Animation mượt mà** khi hover
- **Wave effects** đẹp mắt
- **Components nhất quán** trong toàn bộ app

---

**Lưu ý**: Nếu vẫn không thấy theme, hãy kiểm tra console browser để xem có lỗi gì không.
