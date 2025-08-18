import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import sendResponse from "../utils/response.util.js";
import { CustomError } from "../utils/customError.util.js";

const isLoggedIn = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(500).json({
      data: null,
      message: "User not authorised",
      success: false,
    });
  }
  const token = authHeader.split(" ")[1];
  const secret = process.env.SECRET_KEY;
  const decodedUser = jwt.verify(token, secret);
  const user = await User.findOne({ _id: decodedUser?.id });
  if (!user) {
    return sendResponse(res, "USER not found!", 404);
  }

  req.user = {
    id: decodedUser?.id,
    email: decodedUser?.email,
    role: user?.role ?? "personal",
  };
  next();
};
export default isLoggedIn;
