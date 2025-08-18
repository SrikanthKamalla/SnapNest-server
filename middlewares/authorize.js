import sendResponse from "../utils/response.util.js";

const authorize = (roles) => async (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return sendResponse(res, "Access Denied", 403);
  }
  next();
};

export default authorize;
