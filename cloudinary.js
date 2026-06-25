import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import 'dotenv/config';
import multer from 'multer';

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
})

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params:{
      folder: "profile",
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg']
    }
});

const attachmentStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: "chat_attachments",
      resource_type: "auto" // Allows raw documents, audio voice notes, videos, etc.
    }
});

export const upload = multer({ storage })
export const uploadAttachment = multer({ storage: attachmentStorage })

