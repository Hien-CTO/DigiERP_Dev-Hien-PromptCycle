# Debug Hướng dẫn kiểm tra lỗi đăng nhập

## Các bước kiểm tra:

### 1. Kiểm tra Backend có đang chạy không?
Backend phải chạy ở `http://localhost:4000`

**Cách kiểm tra:**
- Mở browser: http://localhost:4000/api/health (hoặc tương tự)
- Hoặc xem terminal có service đang chạy không

### 2. Kiểm tra Console Log
Mở Developer Tools (F12) → Console tab

**Những gì cần xem:**
- Có error màu đỏ không?
- Network errors (CORS, Connection refused)?
- Response từ `/api/auth/login`

### 3. Kiểm tra Network Tab
F12 → Network tab → Thử login lại

**Xem request `/api/auth/login`:**
- Status code: 200 (thành công) hay 401/400/500 (lỗi)?
- Response body: Có message gì không?
- Request payload: Username/password có đúng không?

### 4. Các lỗi thường gặp:

#### a) Backend không chạy
```
Error: Network Error
Error: connect ECONNREFUSED 127.0.0.1:4000
```
**Giải pháp:** Start backend service

#### b) CORS Error
```
Access to XMLHttpRequest blocked by CORS policy
```
**Giải pháp:** Kiểm tra CORS config trong backend

#### c) Wrong credentials
```
401 Unauthorized
Invalid username or password
```
**Giải pháp:** Kiểm tra username/password trong database

#### d) Database connection
```
500 Internal Server Error
Database connection failed
```
**Giải pháp:** Kiểm tra database có chạy không

### 5. Test Manual API Call
Mở Console và chạy lệnh này:

```javascript
fetch('http://localhost:4000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
  body: JSON.stringify({
    usernameOrEmail: 'admin',
    password: 'admin123'
  })
})
.then(res => res.json())
.then(data => console.log('✅ Success:', data))
.catch(err => console.error('❌ Error:', err));
```

### 6. Kiểm tra Environment Variables
File: `.env.local` trong admin-panel

Đảm bảo có:
```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

---

## Quick Checklist:

- [ ] Backend đang chạy ở port 4000
- [ ] Database đang chạy
- [ ] NEXT_PUBLIC_API_URL đúng
- [ ] Username: admin, Password: admin123
- [ ] Không có CORS errors
- [ ] Cookie được set (check Application tab)

