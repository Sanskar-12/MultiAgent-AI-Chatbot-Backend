import express from "express";
import dotenv from "dotenv";
import connectToDB from "./config/db.js";
import router from "./routes/auth.routes.js";
import dns from "dns";
import cookieParser from "cookie-parser";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

dotenv.config();

connectToDB();
const port = process.env.PORT;

const app = express();
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Auth service is working");
});
app.use("/", router);

app.listen(port, () => {
  console.log(`Auth Service is listening on port ${port}`);
});
