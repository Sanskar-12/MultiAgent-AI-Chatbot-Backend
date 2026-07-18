import { getModel } from "../config/models.js";

export const chatAgent = async (state) => {
  const llm = getModel("chat");

  const systemPrompt = `
        You are CortexAI, an intelligent AI assistant.

Respond with only your final answer. Do not include any reasoning, 
thinking process, analysis, or <think> tags in your output — output 
the answer directly and nothing else.
`;

  const response = await llm.invoke([
    {
      role: "system",
      content: systemPrompt,
    },
    {
      role: "human",
      content: state.prompt,
    },
  ]);

  return {
    ...state,
    aiResponse: response.content,
  };
};
