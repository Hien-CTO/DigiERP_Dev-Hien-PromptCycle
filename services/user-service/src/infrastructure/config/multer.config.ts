import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

export const multerConfig = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      // Use absolute path: from dist folder, go up one level to services/user-service, then to uploads/avatars
      const uploadPath = join(process.cwd(), 'uploads', 'avatars');
      
      // Tạo thư mục nếu chưa tồn tại
      if (!existsSync(uploadPath)) {
        mkdirSync(uploadPath, { recursive: true });
      }
      
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      // Tạo tên file: user-{userId}-{timestamp}-{random}.{extension}
      // Thêm random string để đảm bảo filename luôn unique ngay cả khi upload trong cùng millisecond
      const userId = req.params?.id || 'unknown';
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 8); // 6 ký tự random
      const ext = extname(file.originalname);
      const filename = `user-${userId}-${timestamp}-${random}${ext}`;
      cb(null, filename);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Only image files are allowed (JPEG, PNG, GIF, WebP). Received: ${file.mimetype}`), false);
    }
  },
};

