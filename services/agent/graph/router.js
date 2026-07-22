import { getModel } from "../config/models.js";

export const routerAgent = async (state) => {
  const llm = getModel("router");
  const prompt = `
  You are a Router Agent.

Your only responsibility is to determine which specialized agent should handle the user's latest query.

Do NOT answer the user's question.
Do NOT explain your reasoning.
Return ONLY one of the following agent names:

- chat
- search
- coding
- pdf
- ppt
- imageGen

Routing Rules:

1. chat
- General conversation
- Greetings
- Explanations
- Writing, summarization, translation
- Advice
- General knowledge that does not require the internet

2. search
- Queries requiring the internet or latest/current information
- Search websites, Google, GitHub, Reddit, YouTube
- News, weather, sports, stock prices, recent releases

3. coding
- Generate, explain, debug, optimize, or review code
- Programming, DSA, SQL, APIs, Spring Boot, React, Node.js, Python, Java, Docker, Kubernetes, Git, etc.

4. pdf
- Create, generate, or export PDF documents.

5. ppt
- Create or generate PowerPoint presentations or slides.

6. imageGen
- Generate, create, draw, design, edit, or transform images, logos, posters, diagrams, or illustrations.

Priority:
- If fresh internet information is required → search.
- If the request is about programming → coding.
- If the primary output is a PDF → pdf.
- If the primary output is a presentation → ppt.
- If the primary output is an image → imageGen.
- Otherwise → chat.

Return exactly one agent name and nothing else.

User query: ${state.prompt}
  `;

  const response = await llm.invoke(prompt);

  return {
    ...state,
    agent: response.content.trim().toLowerCase(),
  };
};
