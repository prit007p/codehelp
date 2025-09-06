import express from "express";
import cloudinary from "cloudinary";
import dotenv from "dotenv";



const router = express.Router();

dotenv.config();

cloudinary.v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

router.get("/", (req, res) => {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const folder = "user_avatars";

  const signature = cloudinary.v2.utils.api_sign_request(
    { timestamp, folder },
    process.env.API_SECRET
  );

  res.json({
    signature,
    timestamp,
    folder,
    api_key: process.env.API_KEY,
    cloud_name: process.env.CLOUD_NAME
  });
});


export default router;