import express from "express";
import isLoggedIn from "../middlewares/isLoggedIn.middleware.js";
import {
  addComment,
  deleteComment,
  getCommentsById,
} from "../controllers/comment.controller.js";

const router = express.Router();

router.post("/addComment/:postId", isLoggedIn, addComment);
router.delete("/deleteComment/:commentId", isLoggedIn, deleteComment);
router.get("/getComments/:postId", isLoggedIn, getCommentsById);

export default router;
