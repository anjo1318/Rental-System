import express from "express";
import {
  savePickupPhoto,
  saveReturnPhoto,
  getBookPhotos,
} from "../controllers/bookPhotoController.js";
import { upload } from "../config/cloudinary.js";

const router = express.Router();

router.post("/pickup-photo/:id", upload.single("photo"), savePickupPhoto);
router.post("/return-photo/:id", upload.single("photo"), saveReturnPhoto);
router.get("/:id", getBookPhotos);

export default router;
