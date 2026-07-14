import express from "express";
import dotenv from "dotenv";
import connectToDB from "./config/db.js";
import router from "./routes/agent.route.js";

dotenv.config();

connectToDB();
const port = process.env.PORT;

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Agent service is working");
});

app.use("/", router);

app.listen(port, () => {
  console.log(`Agent Service is listening on port ${port}`);
});
