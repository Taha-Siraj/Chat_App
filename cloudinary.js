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
      llowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg',]
    }
});


export const upload = multer({ storage })
