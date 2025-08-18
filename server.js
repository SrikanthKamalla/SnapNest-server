import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import session from "express-session";
import passport from "passport";
import connectDB from "./config/mongoose.js";
import routes from "./routes/index.js";
import cron from "node-cron";
import Post from "./models/post.model.js";

const app = express();

const PORT = process.env.PORT || 8000;

if (process.env.NODE_ENV === "production") {
  console.log = () => {};
}

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // true in prod
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(passport.initialize());
app.use(express.urlencoded({ extended: true }));

connectDB().then(() => {
  console.log("✅ MongoDB Connected Successfully");
});

if (process.env.NODE_ENV !== "production") {
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();
      await Post.updateMany(
        { isScheduled: true, scheduledTime: { $lte: now } },
        { $set: { isScheduled: false, createdAt: now } }
      );
    } catch (error) {
      console.error("Error in scheduled post cron:", error);
    }
  });
}

app.use("/api", routes);

app.get("/", (req, res) => {
  res.send("API is working!");
});
app.listen(PORT, () => {
  console.log("appp is running");
});
export default app;
