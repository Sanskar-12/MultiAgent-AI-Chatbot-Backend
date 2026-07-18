import { ChatGroq } from "@langchain/groq";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import dotenv from "dotenv";

dotenv.config();

const groq = new ChatGroq({
  model: "llama-3.1-8b-instant",
  apiKey: process.env.GROQ_API_KEY,
  reasoningFormat: "hidden",
});

const gemini = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  apiKey: process.env.GOOGLE_API_KEY,
});

export const getModel = (agent) => {
  switch (agent) {
    case "chat":
      return groq;
    case "search":
      return groq;
    case "coding":
      return gemini;
    default:
      return groq;
  }
};
