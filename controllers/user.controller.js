import express from "express";
import jwt from "jsonwebtoken";
const router = express.Router();
import User from "../models/user.model.js";
import sendResponse from "../utils/response.util.js";

export const signup = async (req, res) => {
  const { name, email, password, role } = req.body;
  const isExists = await User.findOne({ email, isInActive: false });
  if (isExists) {
    res.status(201).json({
      data: null,
      message: "User already exists",
      success: false,
    });
  }
  try {
    const newUser = await User.insertOne({ name, email, password, role });

    await newUser.save();

    const token = jwt.sign(
      {
        id: newUser._id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      },
      process.env.SECRET_KEY,
      { expiresIn: "7d" }
    );
    sendResponse(res, "User Registration Successfull", 200, {
      user: newUser,
      token,
    });
  } catch (error) {
    res.status(400).json({
      data: null,
      message: error.message,
      success: false,
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email, isInActive: false });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        data: null,
        message: "Invalid credentials",
        success: false,
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        name: user.name,
      },
      process.env.SECRET_KEY,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      data: {
        user,
        token,
      },
      message: "User logged in Successfully",
      success: true,
    });
  } catch (error) {
    res.status(400).json({
      data: null,
      message: error.message,
      success: false,
    });
  }
};

export const loggedInUserInfo = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req?.user?.id, isInActive: false });
    res.status(200).json({
      data: {
        user,
      },
      message: "User logged in Successfully",
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserInfo = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name } = req.body;

    const user = await User.findOne({ _id: userId, isInActive: false }).select(
      "-password"
    );
    if (!user) {
      return sendResponse(res, "User not found", 404);
    }
    user.name = name;
    const updatedUser = await user.save();
    sendResponse(res, "User credentials updated successfully", 200, {
      user: updatedUser,
    });
  } catch (error) {
    sendResponse(res, error.message, 400);
  }
};

export const getAllUser = async (req, res) => {
  try {
    const users = await User.findOne({ isInActive: false }).select("-password");

    sendResponse(res, "USER fetched successfully !!", 200, { users });
  } catch (error) {
    res.send({
      data: error.message,
    });
  }
};

export const followUser = async (req, res) => {
  const { id } = req.params;
  try {
    if (id == req.user.id) {
      return sendResponse(res, "USER not found!", 404);
    }
    const user = await User.findOne({ _id: id, isInActive: false });
    if (!user) {
      return sendResponse(res, "USER not found!", 404);
    }

    await User.findByIdAndUpdate(req.user.id, {
      $addToSet: { followings: id },
    });
    await User.findByIdAndUpdate(id, {
      $addToSet: { followers: req.user.id },
    });

    sendResponse(res, "USER followed successfully !!", 200);
  } catch (error) {
    res.send({
      data: error.message,
    });
  }
};

export const unFollowUser = async (req, res) => {
  const { id } = req.params;
  try {
    if (id == req.user.id) {
      return;
    }
    const user = await User.findOne({ _id: id, isInActive: false });
    if (!user) {
      return sendResponse(res, "USER not found!", 404);
    }

    await User.findByIdAndUpdate(req.user.id, {
      $pull: { followings: id },
    });

    await User.findByIdAndUpdate(id, {
      $pull: { followers: req.user.id },
    });

    sendResponse(res, "USER unfollowed successfully !!", 200);
  } catch (error) {
    res.send({
      data: error.message,
    });
  }
};

export const getFollowers = async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.user.id,
      isInActive: false,
    }).populate("followers", "name email");
    if (!user) {
      return sendResponse(res, "USER not found!", 404);
    }
    sendResponse(res, "USER unfollowed successfully !!", 200, {
      followers: user,
    });
  } catch (error) {
    res.send({
      data: error.message,
    });
  }
};

export const getFollowings = async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.user.id,
      isInActive: false,
    }).populate("followings", "name email");
    if (!user) {
      sendResponse(res, "USER not found!", 404);
    }
    sendResponse(res, "USER unfollowed successfully !!", 200, {
      followers: user,
    });
  } catch (error) {
    res.send({
      data: error.message,
    });
  }
};

export const deactivateUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return sendResponse(res, "USER not found!", 404);
    }
    user.isInActive = true;
    await user.save();
    sendResponse(res, "USER deleted successfully !!", 200, {
      followers: user,
    });
  } catch (error) {
    res.send({
      data: error.message,
    });
  }
};
