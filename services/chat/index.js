import express from "express";
import dotenv from "dotenv";
import connectToDB from "./config/db.js";
import router from "./routes/chat.routes.js";

dotenv.config();

connectToDB();
const port = process.env.PORT;

const app = express();
app.use(express.json());
app.use("/", router);

app.get("/", (req, res) => {
  res.send("Chat service is working");
});

app.listen(port, () => {
  console.log(`Chat Service is listening on port ${port}`);
});
