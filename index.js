import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import BlogRouter from "./controllers/BlogController.js";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import AuthRouter from "./controllers/AuthController.js";
import { expressjwt } from "express-jwt";
import cookieParser from "cookie-parser";
const app = express();

app.use(bodyParser.json({ limit: "100mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(
  cors({
    origin: [process.env.FRONTEND_URL, "http://localhost:3000"],
    credentials: true,
  })
);

app.use((req, res, next) => {
  const accessToken = req.cookies.access_token;

  if (accessToken) {
    req.headers.authorization = `Bearer ${accessToken}`;
  }
  next();
});

app.use(
  expressjwt({
    secret: process.env.JWT_SECRET_KEY,
    algorithms: ["HS256"],
  }).unless({
    path: [
      /^\/auth/,
      /^\/blog\/find\/[a-fA-F0-9]+$/,
      /^\/blog\/search\/.+$/,
      /^\/blog\/hashtag\/.+$/,
      /^\/blog\/all$/,
    ],
  })
);

app.use("/blog", BlogRouter);
app.use("/auth", AuthRouter);
app.get("/", (req, res) => {
  return res.json({ message: "Server is up and running" });
});

app.listen(process.env.PORT, () => {
  mongoose
    .connect(process.env.DBSTRING)
    .then(() => {
      console.log("server is running on port " + process.env.PORT);
    })
    .catch((error) => {
      console.log(" error has occured while connecting to the database ");
    });
});
