import express from "express";
import dotenv from "dotenv";
import connectToDB from "./config/db.js";
import router from "./routes/billing.route.js";
import dns from "dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

dotenv.config();

connectToDB();
const port = process.env.PORT;

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Billing service is working");
});
app.use("/", router);

app.listen(port, () => {
  console.log(`Billing Service is listening on port ${port}`);
});
