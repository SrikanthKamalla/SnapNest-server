import mongoose, { Schema } from "mongoose";

const commentSchema = Schema(
  {
    text: {
      type: String,
      required: [true, "Caption should be a required field"],
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User should be a required field"],
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: [true, "Post should be a required field"],
    },
  },
  { timestamps: true }
);

const Comment = mongoose.model("Comment", commentSchema);
export default Comment;
