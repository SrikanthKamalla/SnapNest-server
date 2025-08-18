import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import "../config/passport.js";

import isLoggedIn from "../middlewares/isLoggedIn.middleware.js";
import {
  signup,
  login,
  loggedInUserInfo,
  updateUserInfo,
  followUser,
  unFollowUser,
  deactivateUser,
  getFollowers,
  getFollowings,
} from "../controllers/user.controller.js";
import authorize from "../middlewares/authorize.js";
import {
  forgotPassword,
  updatePassword,
} from "../controllers/changePassword.controller.js";
import sendResponse from "../utils/response.util.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", updatePassword);

router.delete("/logout", isLoggedIn, (req, res) => {
  return sendResponse(res, "Logout successfull", 200);
});

router.get("/loginUserInfo", isLoggedIn, loggedInUserInfo);
router.put("/updateUserInfo", isLoggedIn, updateUserInfo);

//google oauth2.0 routes
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const token = jwt.sign(
      {
        email: req.user.email,
        name: req.user.name,
        id: req.user._id,
        role: req.user.role,
      },
      process.env.SECRET_KEY,
      { expiresIn: "7d" }
    );

    res.send({
      data: {
        token,
        user: req.user,
      },
      success: true,
      message: "USER logged in with google successfully !!",
      redirectUrl: `http://localhost:5173/`,
    });
  }
);

//follower and following
router.put("/user/follow/:id", isLoggedIn, followUser);
router.put("/user/unfollow/:id", isLoggedIn, unFollowUser);
router.get("/user/followers", isLoggedIn, getFollowers);
router.get("/user/following", isLoggedIn, getFollowings);

router.put("/user/deactivateUser", isLoggedIn, deactivateUser);

export default router;
