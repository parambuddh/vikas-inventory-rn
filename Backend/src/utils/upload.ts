import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

const uploadDir = path.join(__dirname, '../../uploads/users');
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

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

export const processImage = async (file: Express.Multer.File, filenamePrefix: string): Promise<string> => {
  const filename = `${filenamePrefix}-${Date.now()}.webp`;
  const filepath = path.join(uploadDir, filename);

  await sharp(file.buffer)
    .resize(500, 500, { fit: 'cover', withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(filepath);

  return `/uploads/users/${filename}`;
};
