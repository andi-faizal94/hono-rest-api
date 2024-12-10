import { Hono } from "hono";
import {
  createPost,
  deletePost,
  getImage,
  getPostById,
  getPosts,
  updatePost,
  uploadFile,
  uploadImage,
} from "../controllers/PostController";

const router = new Hono();

// router.get("/", (c) => getPosts(c));
// router.post("/", (c) => createPost(c));
// router.get("/:id", (c) => getPostById(c));
// router.patch("/:id", (c) => updatePost(c));
// router.delete("/:id", (c) => deletePost(c));
// router.post("/uploads", (c) => uploadFile(c));
router.post("/upload-image", (c) => uploadImage(c));
router.get("/image", (c) => getImage(c));

export const Routes = router;
