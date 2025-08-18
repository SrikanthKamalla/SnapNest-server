import express from "express";
import userRoutes from "./user.route.js";
import postRoutes from "./post.route.js";
import commentRoutes from "./comment.route.js";
import analyticsRoutes from "./analytics.route.js";

const router = express.Router();
router.use("/auth", userRoutes);
router.use("/post", postRoutes);
router.use("/comment", commentRoutes);
router.use("/analytics", analyticsRoutes);
export default router;
