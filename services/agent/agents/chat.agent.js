import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { getMemory } from "../config/memory.js";
import { getModel } from "../config/models.js";

export const chatAgent = async (state) => {
  const llm = getModel("chat");

  const systemPrompt = `You are CortexAI, an intelligent AI assistant.

- For greetings or simple questions, respond in plain conversational text.
- For technical, educational, or detailed topics, respond in well-formed Markdown.

Markdown rules:
- Use fenced code blocks with a language tag (e.g. \`\`\`javascript).
- Leave a blank line before and after headings, lists, code blocks, and tables.
- Use "-" for unordered lists and "1." for ordered lists.
- Use "#", "##", "###" for headings, not bold text.
- Use standard tables with a header separator row (|---|---|).
- Use inline code spans for variables, paths, and commands.
- No HTML tags unless explicitly requested.

Output only the final answer — no reasoning, analysis, or <think> tags.`;

  const historyMessages = await getMemory(state.conversationId);

  const messages = [new SystemMessage(systemPrompt)];

  historyMessages.forEach((msg) => {
    if (msg.role === "user") {
      messages.push(new HumanMessage(msg.content));
    }
    if (msg.role === "assistant") {
      messages.push(new AIMessage(msg.content));
    }
  });

  messages.push(new HumanMessage(state.prompt));

  const response = await llm.invoke(messages);

  return {
    ...state,
    aiResponse: response.content,
  };
};
