import express from "express";
import {
  createConversation,
  getConversation,
  getMessages,
  saveMessage,
  updateConversation,
} from "../controllers/chat.controller.js";

const router = express.Router();

router.get("/create/conversation", createConversation);
router.get("/get/conversation", getConversation);
router.put("/update/conversation", updateConversation);
router.post("/save/message", saveMessage);
router.get("/get/message/:conversationId", getMessages);

export default router;
