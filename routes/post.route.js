import express from "express";
import {
  createPost,
  editPost,
  uploadToCloudinary,
  uploadToDisk,
  deletePost,
  getPostById,
  // uploadToDiskMultiple,
  getLoggedInUserPosts,
  getAllPosts,
  likePost,
  dislikePost,
  postStatsById,
  getFeeds,
} from "../controllers/post.controller.js";
import upload from "../config/multer.js";
import isLoggedIn from "../middlewares/isLoggedIn.middleware.js";

const router = express.Router();

// router.post("/upload/disk", upload.single("image"), uploadToDisk);
// router.post("/upload/disk-multi", upload.array("images"), uploadToDiskMultiple);

router.post("/upload", upload.single("image"), uploadToCloudinary);
router.post("/createpost", isLoggedIn, createPost);

router.put("/editPost/:id", isLoggedIn, editPost);
router.delete("/deletePost/:id", isLoggedIn, deletePost);
router.get("/getPostById/:id", isLoggedIn, getPostById);
router.get("/myPosts", isLoggedIn, getLoggedInUserPosts);
router.get("/getAllPosts", isLoggedIn, getAllPosts);

router.put("/likePost/:id", isLoggedIn, likePost);
router.put("/dislikePost/:id", isLoggedIn, dislikePost);

router.get("/postStatsById/:id", isLoggedIn, postStatsById);
router.get("/getFeeds", isLoggedIn, getFeeds);

export default router;
