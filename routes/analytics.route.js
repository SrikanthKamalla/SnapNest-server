import express from "express";
import { getPostsByDate } from "../controllers/analytics.controller.js";
import isLoggedIn from "../middlewares/isLoggedIn.middleware.js";

const router = express.Router();

router.get("/getPostsByDate", isLoggedIn, getPostsByDate);

export default router;
