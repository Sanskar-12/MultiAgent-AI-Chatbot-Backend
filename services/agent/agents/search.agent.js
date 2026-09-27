import { searchTool } from "../config/tavily.js";
import { checkAgentLimit } from "../utils/agentLimit.js";
import { deductCredits } from "../utils/deductCredits.js";

export const searchAgent = async (state) => {
  try {
    await checkAgentLimit(state.userId, "search");

    const results = await searchTool.invoke({
      query: state.prompt,
    });

    await deductCredits(state.userId, "search");

    return {
      ...state,
      searchResults: results,
      images: results.images,
      agent: "search",
    };
  } catch (error) {
    if (error.status === 429) {
      return {
        ...state,
        searchResults: [],
        images: [],
        aiResponse: error.data.message,
      };
    }

    return {
      ...state,
      searchResults: [],
      images: [],
    };
  }
};
