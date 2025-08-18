import express from "express";
import sendResponse from "../utils/response.util.js";
import Post from "../models/post.model.js";
import cloudinaryjs from "../config/cloudinary.js";
import cloudinary from "cloudinary";
import { promises as fs } from "fs";

const router = express.Router();

export const uploadToDisk = async (req, res) => {
  sendResponse(res, "File uploaded successfully", 200, { file: req.file });
};

// export const uploadToDiskMultiple = async (req, res) => {
//   sendResponse(res, "Files uploaded successfully", 200, { files: req.files });
// };

export const uploadToCloudinary = async (req, res) => {
  try {
    const uploadedDetails = await cloudinaryjs.uploader.upload(req.file.path, {
      folder: "posts",
    });
    const { secure_url: image, public_id: imageId } = uploadedDetails;
    fs.unlink(req.file.path, (err) => {
      if (err) {
        console.error("Error deleting local file:", err);
      } else {
        console.log("Local file deleted:", req.file.path);
      }
    });
    sendResponse(res, "File uploaded successfully", 200, { image, imageId });
  } catch (error) {
    sendResponse(res, error.message, 404);
  }
};

export const createPost = async (req, res) => {
  try {
    const { text, image, imageId, isScheduled, scheduledTime } = req.body;
    const newPost = await new Post({
      text,
      image,
      imageId,
      user: req.user.id,
      isScheduled,
      scheduledTime,
    });
    const savePost = await newPost.save();
    sendResponse(res, "Post uploaded successfully", 200, { savePost });
  } catch (error) {
    sendResponse(res, error.message, 404);
  }
};

export const editPost = async (req, res) => {
  try {
    const { text, image, imageId } = req.body;
    const { id } = req.params;

    if (!text) {
      return sendResponse(res, "Caption is required field", 400);
    }

    const foundPost = await Post.findById(id);

    if (!foundPost) {
      return sendResponse(res, "Post not found", 400);
    }

    if (foundPost.user.toString() !== req.user.id) {
      return sendResponse(res, "User not authorized to edit post", 400);
    }

    if (image && foundPost.imageId) {
      try {
        await cloudinary.v2.uploader.destroy(foundPost.imageId);
      } catch (err) {
        console.error("Cloudinary deletion failed:", err);
      }
      foundPost.image = image;
      foundPost.imageId = imageId;
    }

    if (text) foundPost.text = text;

    await foundPost.save();

    sendResponse(res, "Post updated successfully", 200, { post: foundPost });
  } catch (error) {
    sendResponse(res, error.message, 404);
  }
};

export const deletePost = async (req, res) => {
  try {
    const { id: postId } = req.params;

    const foundPost = await Post.findById(postId);
    if (!foundPost) {
      return sendResponse(res, "Post not found", 400);
    }

    if (foundPost.user.toString() !== req.user.id) {
      return sendResponse(res, "User not authorized to delete post", 400);
    }

    if (foundPost.imageId) {
      try {
        await cloudinary.v2.uploader.destroy(foundPost.imageId);
      } catch (err) {
        console.error("Cloudinary deletion failed:", err);
      }
    }

    await foundPost.deleteOne();

    sendResponse(res, "Post deleted successfully", 200, { post: foundPost });
  } catch (error) {
    sendResponse(res, error.message, 404);
  }
};

export const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return sendResponse(res, "Post id is required", 400);
    }
    const foundPost = await Post.findById(id);
    if (!foundPost) {
      return sendResponse(res, "No Post found", 400);
    }
    sendResponse(res, "User Posts Fetched Successfully!", 200, {
      post: foundPost,
    });
  } catch (error) {
    sendResponse(res, error.message, 404);
  }
};

export const getLoggedInUserPosts = async (req, res) => {
  try {
    const foundPosts = await Post.find({
      user: req.user.id,
      isScheduled: false,
    });
    sendResponse(res, "All Posts Fetched Successfully!", 200, {
      posts: foundPosts || [],
    });
  } catch (error) {
    sendResponse(res, error.message, 404);
  }
};
export const getAllPosts = async (req, res) => {
  try {
    const foundPosts = await Post.find({ isScheduled: false });
    if (!foundPosts || foundPosts.length == 0) {
      return sendResponse(res, "No Post found", 400);
    }
    sendResponse(res, "Post Fetched Successfully!", 200, { posts: foundPosts });
  } catch (error) {
    sendResponse(res, error.message, 404);
  }
};

export const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    if (!post) {
      return sendResponse(res, "No Post found", 400);
    }
    if (post.likes.includes(req.user.id)) {
      return sendResponse(res, "User already liked the Post", 200);
    }
    post.likes.push(req.user.id);
    post.likesCount = post.likes.length;
    const likedPost = post.save();
    sendResponse(res, "Post liked Successfully!", 200, { posts: likePost });
  } catch (error) {
    sendResponse(res, error.message, 404);
  }
};

export const dislikePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    if (!post) {
      return sendResponse(res, "No Post found", 400);
    }
    if (!post.likes.includes(req.user.id)) {
      return sendResponse(res, "User not liked the Post", 200);
    }
    post.likes = post.likes.filter((like) => like.toString() != req.user.id);
    post.likesCount = post.likes.length;
    const likedPost = post.save();
    sendResponse(res, "Post Disliked Successfully!", 200, { posts: likePost });
  } catch (error) {
    sendResponse(res, error.message, 404);
  }
};

export const postStatsById = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    if (!post) {
      return sendResponse(res, "No Post found", 400);
    }
    const stats = {
      likes: post.likesCount,
      isLikedByMe: post.likes.includes(req.user.id),
      comments: post.comments.length,
    };

    sendResponse(res, "Stats Fetched Successfully!", 200, { stats });
  } catch (error) {
    sendResponse(res, error.message, 404);
  }
};

export const getFeeds = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "name")
      .populate({ path: "likes", select: "name" })
      .populate({
        path: "comments",
        select: "_id text user",
        populate: {
          path: "user",
          select: "name",
        },
      });
    if (!posts) {
      return sendResponse(res, "No Posts found", 400);
    }

    sendResponse(res, "Feeds Fetched Successfully!", 200, { posts });
  } catch (error) {
    sendResponse(res, error.message, 404);
  }
};
