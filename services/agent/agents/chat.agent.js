import { getModel } from "../config/models.js";

export const chatAgent = async (state) => {
  const llm = getModel("chat");

  const systemPrompt = `
        You are CortexAI, an intelligent AI assistant
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
