import express from "express";
import dotenv from "dotenv";
import proxy from "express-http-proxy";
import cors from "cors";
import cookieParser from "cookie-parser";
import { protect } from "./middlewares/auth.middleware.js";
import { getCurrentUser } from "./controllers/user.controller.js";
import { proxyWithHeader } from "./utils/proxyWithHeader.js";

dotenv.config();

const port = process.env.PORT;

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);
app.use(cookieParser());

// AUTH SERVICE
app.use("/api/auth", proxy(process.env.AUTH_SERVICE));
// CHAT SERVICE
app.use("/api/chat", protect, proxyWithHeader(process.env.CHAT_SERVICE));

app.get("/", (req, res) => {
  res.send("Api Gateway is working");
});
app.get("/api/me", protect, getCurrentUser);

app.listen(port, () => {
  console.log(`Api Gateway listening on port ${port}`);
});
