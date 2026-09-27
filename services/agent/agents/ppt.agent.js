import { getModel } from "../config/models.js";
import { checkAgentLimit } from "../utils/agentLimit.js";
import { deductCredits } from "../utils/deductCredits.js";
import { generatePpt } from "../utils/generatePpt.js";
import { getFromS3 } from "../utils/getFromS3.js";
import { uploadToS3 } from "../utils/uploadToS3.js";

export const pptAgent = async (state) => {
  try {
    await checkAgentLimit(state.userId, "ppt");

    const llm = await getModel("ppt");

    const prompt = `
    You are a professional presentation designer

    Return ONLY valid JSON.

    Format:

    {
    "title":"",
    "subtitle":"",
    "slides":[
    {
    "title":"",
    "points":[
    "",
    "",
    "",
    ""
    ]
    }
    ]
    }

    Rules:

    - Generate exactly 6 content slides
    - Each slide should have 4-6 concise bullet points
    - No markdown
    - No explanations
    - No code block
    - Return only JSON

    Topic:

    ${state.prompt}
    `;

    const res = await llm.invoke(prompt);

    const data = JSON.parse(res.content);

    const ppt = await generatePpt(JSON.parse(res.content));

    const buffer = await ppt.write({
      outputType: "nodebuffer",
    });

    const filename = `ppt-${Date.now()}.pptx`;

    await uploadToS3(
      filename,
      buffer,
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    );

    const downloadUrl = await getFromS3(filename, 24 * 60 * 60);

    await deductCredits(state.userId, "ppt");

    return {
      ...state,
      aiResponse: [
        "# PPT Generated",
        "",
        `**${data.title}**`,
        "",
        `[Download PPT](${downloadUrl})`,
        "",
        "Link expires in 1 Day",
      ].join("\n"),
      agent: "ppt",
    };
  } catch (error) {
    console.log(error);

    if (error.status === 429) {
      return {
        ...state,
        aiResponse: error.data.message,
      };
    }

    return {
      ...state,
      aiResponse: "Failed to generate PPT",
    };
  }
};
