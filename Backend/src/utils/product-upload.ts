import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

const uploadDir = path.join(__dirname, '../../uploads/products');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

export const productUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export const processProductImage = async (file: Express.Multer.File, filenamePrefix: string) => {
  const timestamp = Date.now();
  const mainFilename = `${filenamePrefix}-${timestamp}-main.webp`;
  const thumbFilename = `${filenamePrefix}-${timestamp}-thumb.webp`;
  
  const mainFilepath = path.join(uploadDir, mainFilename);
  const thumbFilepath = path.join(uploadDir, thumbFilename);

  // Main Image
  await sharp(file.buffer)
    .resize(1000, 1000, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(mainFilepath);

  // Thumbnail
  await sharp(file.buffer)
    .resize(250, 250, { fit: 'cover' })
    .webp({ quality: 70 })
    .toFile(thumbFilepath);

  return {
    image_url: `/uploads/products/${mainFilename}`,
    thumbnail_url: `/uploads/products/${thumbFilename}`
  };
};
