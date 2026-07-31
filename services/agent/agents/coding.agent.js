import { getModel } from "../config/models.js";

export const codingAgent = async (state) => {
  const intentLLM = await getModel("intent");
  const codingLLM = await getModel("coding");

  const intentRes = await intentLLM.invoke(
    `
    You are an intent classifier.

    Return ONLY one of these values.

    CODE_GENERATION
    CODE_REVIEW
    CODE_EXPLANATION
    DEBUGGING
    OPTIMIZATION
    CONVERSION
    DOCUMENTATION

    User request: ${state.prompt}
    `,
  );

  const intentText = intentRes.content;

  // for code generation
  if (intentText === "CODE_GENERATION") {
    const prompt = `
You are a code generation agent. Based on the user's request, generate a complete, working web project (HTML, CSS, and JavaScript).

STRICT OUTPUT RULES:
1. Respond with ONLY a valid JSON object — your entire response must start with { and end with }.
2. Do NOT wrap the JSON in \`\`\`json, \`\`\`, or any other markdown code fence.
3. Do NOT include any text, explanation, or commentary before or after the JSON.
4. The JSON must have this exact structure:

{
  "files": [
    { "name": "index.html", "content": "<!-- full HTML code here -->" },
    { "name": "style.css", "content": "/* full CSS code here */" },
    { "name": "script.js", "content": "// full JS code here" }
  ]
}

5. "content" values must be complete, valid, working code as plain strings (properly escaped for JSON — e.g. escape newlines as \\n and double quotes as \\").
6. index.html must link style.css and script.js correctly (e.g. <link rel="stylesheet" href="style.css"> and <script src="script.js"></script>).
7. You may include inline code comments inside the file contents to explain logic, but do NOT add any explanation, summary, or commentary outside the JSON.
8. Ensure the JSON is syntactically valid and parseable (no trailing commas, properly escaped characters).
9. If the request only needs one or two files, still return all three file array objects, but leave unused ones with minimal/empty content.
10. Styling must be minimal and attractive, fully responsive (mobile, tablet, desktop), and visually modern — clean typography, adequate spacing, cohesive color palette, subtle shadows/rounded corners, flexbox/grid layouts.

REMEMBER: Output raw JSON only. No \`\`\`json. No \`\`\`. Nothing else.

USER REQUEST: ${state.prompt}
`;

    const codingRes = await codingLLM.invoke(prompt);
    const data = JSON.parse(codingRes.content);

    return {
      ...state,
      aiResponse: "Code Generated Successfully",
      artifacts: [
        {
          id: Date.now(),
          type: "Project",
          files: data.files || [],
        },
      ],
    };
  }

  // for other fields
  const res = await codingLLM.invoke(
    `
    The user's request is:
  ${intentText}

  Return Markdown only.

  Never generate project files.

  Use headings like:

  # Overview
  ## Explanation
  ## Problems
  ## Improvements
  ## Best Practices
  ## Optimised Code (if needed)

  User request: ${state.prompt}
    `,
  );

  const data = res.content;

  return {
    ...state,
    aiResponse: data,
    artifacts: [],
  };
};
