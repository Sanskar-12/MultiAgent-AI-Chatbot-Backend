import { getModel } from "../config/models.js";
import { deductCredits } from "../utils/deductCredits.js";

export const codingAgent = async (state) => {
  try {
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
You are a code generation agent. Generate a complete, working web project.

OUTPUT FORMAT (CRITICAL):
Return ONLY valid JSON. Nothing else. No markdown. No explanation.

{
  "files": [
    { "name": "index.html", "content": "<!DOCTYPE html>\\n<html>\\n<head>\\n<title>App</title>\\n<link rel=\\"stylesheet\\" href=\\"style.css\\">\\n</head>\\n<body>\\n<h1>Hello</h1>\\n<script src=\\"script.js\\"></script>\\n</body>\\n</html>" },
    { "name": "style.css", "content": "* {\\n  margin: 0;\\n  padding: 0;\\n}\\n\\nbody {\\n  font-family: Arial;\\n  background: #f5f5f5;\\n}" },
    { "name": "script.js", "content": "console.log(\\"Hello World\\");\\n\\nfunction test() {\\n  return true;\\n}" }
  ]
}

ESCAPING RULES (MANDATORY):
- All newlines → \\n (not actual line breaks)
- All double quotes (") → \\" (backslash + quote)
- All backslashes (\\) → \\\\ (double backslash)
- No markdown code fences (\`\`\`)
- No text before or after JSON
- Result must be valid JSON parseable by JSON.parse()

EXAMPLE OF CORRECT ESCAPING:
BAD: "content": "function test() {
  return "hello";
}"

GOOD: "content": "function test() {\\n  return \\"hello\\";\\n}"

REQUIREMENTS:
- Generate index.html with <link rel="stylesheet" href="style.css"> and <script src="script.js"></script>
- Use real Unsplash images, not placeholders
- Responsive design (mobile, tablet, desktop)
- Modern, clean styling
- All code must be complete and working

USER REQUEST: ${state.prompt}
`;

      const codingRes = await codingLLM.invoke(prompt);

      let cleanedContent = codingRes.content
        .trim()
        .replace(/^```json\n?/g, "")
        .replace(/^```\n?/g, "")
        .replace(/\n?```$/g, "");

      const data = JSON.parse(cleanedContent);

      return {
        ...state,
        aiResponse: "Code Generated Successfully",
        artifacts: [
          {
            id: Date.now(),
            type: "Project",
            title: state.prompt,
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

    await deductCredits(state.userId, "coding");

    return {
      ...state,
      aiResponse: data,
      artifacts: [],
      agent: "coding",
    };
  } catch (error) {
    console.error("JSON Parse Error:", error.message);
    return {
      ...state,
      aiResponse: "Failed to generate code. Please try again.",
      artifacts: [],
    };
  }
};
