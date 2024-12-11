import { Hono } from "hono";

import {
  getImage,
  uploadFile,
  uploadImage,
} from "../controllers/FileController";

const router = new Hono();

router.post("uploads", (c) => uploadFile(c));
router.post("upload-image", (c) => uploadImage(c));
router.get("image", (c) => getImage(c));

export const FileRoutes = router;
