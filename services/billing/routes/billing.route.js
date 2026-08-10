import express from "express";
import { createOrder, verifyPayment } from "../controllers/billing.controller";

const router = express.Router();

router.post("/create", createOrder);
router.post("/verify", verifyPayment);

export default router;
