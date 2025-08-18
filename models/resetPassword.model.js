import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";

const resetPasswordSchema = new Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "userId is required field"],
    },
    token: String,
    isUsed: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

const ResetPassword = mongoose.model("ResetPassword", resetPasswordSchema);
export default ResetPassword;
