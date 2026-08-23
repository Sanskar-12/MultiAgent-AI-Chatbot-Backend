import fs from "fs/promises";
import { PDFParse } from "pdf-parse";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import vectorStore from "../config/vectorDb.js";
import { getModel } from "../config/models.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { deductCredits } from "../utils/deductCredits.js";

export const pdfRag = async (state) => {
  try {
    const buffer = await fs.readFile(state.file.path);

    // convert buffer into pdf
    const pdf = new PDFParse({
      data: buffer,
    });

    const result = await pdf.getText();
    const text = result.text;

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const docs = await splitter.createDocuments([text]);

    const collectionName = `pdf-${Date.now()}`;

    const store = await vectorStore(docs, collectionName);

    const relevantDocs = await store.similaritySearch(state.prompt, 5);

    const context = relevantDocs.map((d) => d.pageContent).join("\n\n");

    const llm = await getModel("pdfrag");

    const messages = [
      new SystemMessage(
        `
    You are CortexAI PDF Assistant.

    Rules:

    - Answer ONLY from the uploaded PDF.
    - Never make up information.
    - If the answer is not present in the PDF, reply: "I couldn't find the information in the uploaded PDF."
    - Use Markdown formatting.
    `,
      ),
      new HumanMessage(
        `
        Context: ${context}
        Question: ${state.prompt}
        `,
      ),
    ];

    const response = await llm.invoke(messages);

    await deductCredits(state.userId, "pdf");

    return {
      ...state,
      aiResponse: response.content,
      agent: "pdfrag",
    };
  } catch (error) {
    console.log(error);
    return { ...state, aiResponse: "Something went wrong processing the PDF." };
  } finally {
    await fs
      .unlink(state.file.path)
      .catch((err) => console.error("Failed to delete temp file:", err));
  }
};
