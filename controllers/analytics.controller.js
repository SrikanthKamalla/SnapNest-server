import sendResponse from "../utils/response.util.js";
import Comment from "../models/comment.model.js";
import Post from "../models/post.model.js";

export const getPostsByDate = async (req, res) => {
  try {
    const postStats = await Post.aggregate([
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    sendResponse(res, "Post stats fetched successfully", 200, postStats);
  } catch (error) {
    sendResponse(res, error.message, 500);
  }
};
