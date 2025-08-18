import express from "express";
import sendResponse from "../utils/response.util.js";
import Comment from "../models/comment.model.js";
import Post from "../models/post.model.js";

export const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const { postId } = req.params;
    const post = await Post.findById(postId);
    if (!post) {
      return sendResponse(res, "Post not found", 400);
    }

    const newComment = await new Comment({
      text,
      post: postId,
      user: req.user.id,
    });
    post.comments.push(newComment._id);
    await post.save();
    const savedComment = await newComment.save();
    const populatedComment = await savedComment.populate("user", "name");
    sendResponse(res, "Comment Added successfully", 200, {
      comment: populatedComment,
    });
  } catch (error) {
    sendResponse(res, error.message, 404);
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return sendResponse(res, "No comment founds", 404);
    }

    if (req.user.id !== comment.user.toString()) {
      return sendResponse(res, "Un Authorised", 400);
    }
    await Post.findByIdAndUpdate(comment.post, {
      $pull: { comments: commentId },
    });

    await Comment.deleteOne({ _id: commentId });

    sendResponse(res, "Comment Deleted Successfully!", 200);
  } catch (err) {
    sendResponse(res, err?.message, 404);
  }
};

export const getCommentsById = async (req, res) => {
  try {
    const { postId } = req.params;

    if (!postId) {
      return sendResponse(res, "Post Id is a required", 400);
    }

    const comments = await Comment.find({ post: postId }).populate("user");

    sendResponse(res, "Post Fetched Successfully!", 200, {
      comments: comments || [],
    });
  } catch (err) {
    sendResponse(res, err?.message, 400);
  }
};
