import express from "express";
import dotenv from "dotenv";
import connectToDB from "./config/db.js";
import router from "./routes/auth.routes.js";

dotenv.config();

connectToDB();
const port = process.env.PORT;

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Auth service is working");
});
app.use("/", router);

app.listen(port, () => {
  console.log(`Auth Service is listening on port ${port}`);
});
