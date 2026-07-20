import { errorResponse } from "../../../shared/errorResponse.js";
import { Conversation } from "../models/conversation.model.js";
import { Message } from "../models/message.model.js";

export const createConversation = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    console.log(userId);

    const conversation = await Conversation.create({
      userId,
    });

    return res.status(200).json({
      success: true,
      conversation,
    });
  } catch (error) {
    return errorResponse(
      res,
      500,
      false,
      `Internal Server Error ${error}  - (Chat Service createConversation)`,
    );
  }
};

export const getConversations = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];

    const conversations = await Conversation.find({
      userId,
    }).sort({
      updatedAt: -1,
    });

    return res.status(200).json({
      success: true,
      conversations,
    });
  } catch (error) {
    return errorResponse(
      res,
      500,
      false,
      `Internal Server Error ${error}  - (Chat Service getConversation)`,
    );
  }
};

export const updateConversation = async (req, res) => {
  try {
    const { conversationId, title } = req.body;

    const conversation = await Conversation.findById(conversationId);

    if (title) {
      conversation.title = title;
    }

    await conversation.save();

    return res.status(200).json({
      success: true,
      conversation,
    });
  } catch (error) {
    return errorResponse(
      res,
      500,
      false,
      `Internal Server Error ${error}  - (Chat Service updateConversation)`,
    );
  }
};

export const saveMessage = async (req, res) => {
  try {
    const { conversationId, role, content } = req.body;

    const message = await Message.create({
      conversationId,
      role,
      content,
    });

    return res.status(200).json({
      success: true,
      message,
    });
  } catch (error) {
    return errorResponse(
      res,
      500,
      false,
      `Internal Server Error ${error}  - (Chat Service saveMessage)`,
    );
  }
};

export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const messages = await Message.find({
      conversationId,
    });

    return res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    return errorResponse(
      res,
      500,
      false,
      `Internal Server Error ${error}  - (Chat Service getMessages)`,
    );
  }
};
