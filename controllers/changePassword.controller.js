import sendResponse from "../utils/response.util.js";
import { resetPasswordService } from "../services/reset-password.service.js";
import ResetPassword from "../models/resetPassword.model.js";
import User from "../models/user.model.js";

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const { message, resetLink, token } = await resetPasswordService(
      res,
      email
    );
    sendResponse(res, message, 200, { resetLink, token });
  } catch (error) {
    sendResponse(res, error.message, 404);
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const resetToken = await ResetPassword.findOne({ token });

    if (!resetToken || resetToken.isUsed || resetToken.expiresAt < new Date()) {
      return sendResponse(res, "Invalid or expired token", 404);
    }

    const user = await User.findById(resetToken.userId);
    user.password = newPassword;
    await user.save();

    resetToken.used = true;
    await resetToken.save();

    sendResponse(res, "password updated successfully", 200);
  } catch (error) {
    sendResponse(res, error.message, 404);
  }
};
