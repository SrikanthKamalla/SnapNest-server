import User from "../models/user.model.js";
import crypto from "crypto";
import sendResponse from "../utils/response.util.js";
import ResetPassword from "../models/resetPassword.model.js";
import { sendMail } from "../utils/sendMail.js";

export const resetPasswordService = async (res, email) => {
  const user = await User.findOne({ email, isInActive: false });

  if (!user) {
    return sendResponse(res, "user not found", 404);
  }
  const token = crypto.randomBytes(32).toString("hex");

  const expiresAt = new Date(Date.now() + 1000 * 60 * 15);

  const resetToken = await ResetPassword.create({
    userId: user._id,
    token,
    expiresAt,
  });

  const resetLink = `${process.env.CLIENT_APP_URL}/reset-password?token=${token}`;
  await sendMail({
    to: user.email,
    subject: `Password Reset Link | ${user.name}`,
    html: `<div>
      <h3>Hello ${user.name}, </h3>
      <p>Here is your password reset link, <b>note that it will be expired in 15 minutes</b> </p>
      <a href=${resetLink} target="_blank"><button>Reset Password</button></a>
      </div>`,
  });

  return {
    message: "If the email is exists, a reset link has been sent!!",
    resetLink,
    token,
  };
};
