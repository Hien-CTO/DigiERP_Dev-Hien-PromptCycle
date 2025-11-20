# 🎨 Green Theme UI Components

Bộ component UI với theme xanh lá cây đẹp mắt và hiện đại cho DigiERP Admin Panel.

## 🌟 Tính năng chính

- **Dải màu xanh lá cây** từ nhạt đến đậm
- **Animation hover** mượt mà cho menu và buttons
- **Màu xanh đậm** cho các nút bấm chính
- **Top headline và footer** với dải màu gợn sóng
- **Responsive design** hoàn toàn
- **Dark mode support**

## 📦 Components

### 1. GreenButton

Button với theme xanh lá cây và nhiều variant.

```tsx
import { GreenButton, AnimatedGreenButton, WaveGreenButton } from '@/components/ui';

// Basic button
<GreenButton variant="primary" size="md">
  Click me
</GreenButton>

// Button với icon
<GreenButton variant="primary" icon={<Plus className="w-4 h-4" />}>
  Add Item
</GreenButton>

// Loading button
<GreenButton variant="primary" loading>
  Processing...
</GreenButton>

// Animated buttons
<AnimatedGreenButton variant="primary">
  Pulse Animation
</AnimatedGreenButton>

<WaveGreenButton variant="secondary">
  Wave Effect
</WaveGreenButton>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'outline' | 'ghost'
- `size`: 'sm' | 'md' | 'lg'
- `loading`: boolean
- `icon`: React.ReactNode

### 2. GreenCard

Card component với nhiều style khác nhau.

```tsx
import { GreenCard, AnimatedGreenCard, WaveGreenCard, GreenStatsCard } from '@/components/ui';

// Basic card
<GreenCard>
  <h3>Card Title</h3>
  <p>Card content</p>
</GreenCard>

// Card với header và footer
<GreenCard
  header={<h3>Header</h3>}
  footer={<div>Footer content</div>}
>
  <p>Card content</p>
</GreenCard>

// Stats card
<GreenStatsCard
  title="Total Users"
  value="1,234"
  icon={<Users className="w-6 h-6" />}
  trend={{ value: 12, isPositive: true }}
/>
```

**Props:**
- `variant`: 'default' | 'elevated' | 'outlined' | 'gradient'
- `header`: React.ReactNode
- `footer`: React.ReactNode
- `hover`: boolean

### 3. GreenBadge

Badge component với nhiều variant và animation.

```tsx
import { GreenBadge, BounceGreenBadge, WaveGreenBadge, StatusBadge } from '@/components/ui';

// Basic badge
<GreenBadge variant="success">Active</GreenBadge>

// Badge với icon
<GreenBadge variant="info" icon={<Info className="w-4 h-4" />}>
  Information
</GreenBadge>

// Status badge
<StatusBadge status="active" />
<StatusBadge status="pending" animated />

// Animated badges
<BounceGreenBadge variant="success">Bounce</BounceGreenBadge>
<WaveGreenBadge variant="info">Wave</WaveGreenBadge>
```

**Props:**
- `variant`: 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline'
- `size`: 'sm' | 'md' | 'lg'
- `icon`: React.ReactNode
- `dot`: boolean
- `animated`: boolean

### 4. GreenAlert

Alert component với nhiều loại thông báo.

```tsx
import { GreenAlert, SlideInGreenAlert, BounceGreenAlert, WaveGreenAlert } from '@/components/ui';

// Basic alert
<GreenAlert variant="success" title="Success!">
  Operation completed successfully.
</GreenAlert>

// Dismissible alert
<GreenAlert 
  variant="warning" 
  dismissible 
  onDismiss={() => console.log('dismissed')}
>
  This alert can be dismissed.
</GreenAlert>

// Animated alerts
<SlideInGreenAlert variant="info">
  Slide in animation
</SlideInGreenAlert>

<BounceGreenAlert variant="success">
  Bounce animation
</BounceGreenAlert>

<WaveGreenAlert variant="warning">
  Wave background
</WaveGreenAlert>
```

**Props:**
- `variant`: 'success' | 'warning' | 'error' | 'info'
- `title`: string
- `dismissible`: boolean
- `onDismiss`: () => void
- `animated`: boolean

### 5. GreenInput

Input component với nhiều variant và tính năng.

```tsx
import { GreenInput, GreenPasswordInput, GreenSearchInput, GreenTextarea } from '@/components/ui';

// Basic input
<GreenInput
  label="Username"
  placeholder="Enter username"
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>

// Password input
<GreenPasswordInput
  label="Password"
  showPassword={showPassword}
  onTogglePassword={() => setShowPassword(!showPassword)}
/>

// Search input
<GreenSearchInput
  label="Search"
  onSearch={(value) => console.log('Search:', value)}
/>

// Textarea
<GreenTextarea
  label="Description"
  placeholder="Enter description"
  rows={4}
/>
```

**Props:**
- `label`: string
- `error`: string
- `helperText`: string
- `leftIcon`: React.ReactNode
- `rightIcon`: React.ReactNode
- `variant`: 'default' | 'filled' | 'outlined'
- `size`: 'sm' | 'md' | 'lg'
- `clearable`: boolean

### 6. GreenModal

Modal component với nhiều loại khác nhau.

```tsx
import { GreenModal, GreenConfirmModal, GreenLoadingModal } from '@/components/ui';

// Basic modal
<GreenModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Modal Title"
  footer={<div>Footer content</div>}
>
  <p>Modal content</p>
</GreenModal>

// Confirmation modal
<GreenConfirmModal
  isOpen={confirmOpen}
  onClose={() => setConfirmOpen(false)}
  onConfirm={handleConfirm}
  title="Confirm Action"
  message="Are you sure you want to proceed?"
  variant="warning"
/>

// Loading modal
<GreenLoadingModal
  isOpen={loadingOpen}
  title="Processing..."
  message="Please wait..."
/>
```

**Props:**
- `isOpen`: boolean
- `onClose`: () => void
- `title`: string
- `size`: 'sm' | 'md' | 'lg' | 'xl' | 'full'
- `closeOnOverlayClick`: boolean
- `showCloseButton`: boolean
- `animated`: boolean

## 🎨 CSS Classes

### Wave Animation
```css
.wave-bg {
  background: linear-gradient(135deg, 
    #f0fdf4 0%, 
    #dcfce7 25%, 
    #bbf7d0 50%, 
    #86efac 75%, 
    #4ade80 100%);
  background-size: 400% 400%;
  animation: wave-gradient 8s ease infinite;
}
```

### Menu Hover Effects
```css
.menu-item {
  @apply transition-all duration-300 ease-in-out;
}

.menu-item:hover {
  @apply transform translate-x-1 bg-green-50 text-green-700 shadow-sm;
}
```

### Button Styles
```css
.btn-primary {
  @apply bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg;
}
```

## 🚀 Demo

Để xem demo của tất cả components, truy cập:
```
/admin/demo-theme
```

## 🎯 Color Palette

- **Green 50**: #f0fdf4 (Xanh rất nhạt)
- **Green 100**: #dcfce7 (Xanh nhạt)
- **Green 200**: #bbf7d0 (Xanh lợt)
- **Green 300**: #86efac (Xanh vừa)
- **Green 400**: #4ade80 (Xanh sáng)
- **Green 500**: #22c55e (Xanh chính)
- **Green 600**: #16a34a (Xanh đậm)
- **Green 700**: #15803d (Xanh rất đậm)
- **Green 800**: #166534 (Xanh tối)
- **Green 900**: #14532d (Xanh đen)

## 🔧 Customization

Bạn có thể customize theme bằng cách:

1. **Thay đổi màu sắc** trong `tailwind.config.ts`
2. **Thêm animation** trong `globals.css`
3. **Tạo variant mới** cho các component
4. **Override CSS classes** theo nhu cầu

## 📱 Responsive

Tất cả components đều responsive và hoạt động tốt trên:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (< 768px)

## 🌙 Dark Mode

Components hỗ trợ dark mode thông qua CSS variables và Tailwind dark mode classes.
