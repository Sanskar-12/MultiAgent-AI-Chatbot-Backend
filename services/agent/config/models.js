import { ChatGroq } from "@langchain/groq";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOpenRouter } from "@langchain/openrouter";
import dotenv from "dotenv";

dotenv.config();

const groq = new ChatGroq({
  model: "openai/gpt-oss-20b",
  apiKey: process.env.GROQ_API_KEY,
  reasoningFormat: "hidden",
});

const gemini = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  apiKey: process.env.GOOGLE_API_KEY,
});

const deepseek = new ChatOpenRouter({
  model: "deepseek/deepseek-chat",
  temperature: 0, // model is predictable
  maxTokens: 2500,
  apiKey: process.env.OPENROUTER_API_KEY,
});

export const getModel = (agent) => {
  switch (agent) {
    case "chat":
      return groq;
    case "search":
      return groq;
    case "coding":
      return deepseek;
    case "imageanalyzer":
      return gemini;
    default:
      return groq;
  }
};
