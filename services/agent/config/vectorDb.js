import embeddings from "./embeddings.js";
import dotenv from "dotenv";
import { QdrantVectorStore } from "@langchain/qdrant";

dotenv.config();

const vectorStore = async (docs, collectionName) => {
  return await QdrantVectorStore.fromDocuments(docs, embeddings, {
    url: process.env.QDRANT_URL,
    collectionName,
  });
};

export default vectorStore;
