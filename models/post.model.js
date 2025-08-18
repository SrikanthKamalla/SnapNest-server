import mongoose, { Schema } from "mongoose";

const postSchema = Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User should be a required field"],
    },
    text: {
      type: String,
      required: [true, "Caption should be a required field"],
    },
    image: String,
    imageId: String,
    likes: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User",
      },
    ],
    likesCount: {
      type: Number,
      default: 0,
    },

    comments: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Comment",
      },
    ],
    isScheduled: {
      type: Boolean,
      default: false,
    },
    scheduledTime: { type: Date },
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);
export default Post;
