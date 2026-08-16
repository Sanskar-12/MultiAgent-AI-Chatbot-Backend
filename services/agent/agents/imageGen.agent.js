import { getModel } from "../config/models.js";
import axios from "axios";
import { uploadToS3 } from "../utils/uploadToS3.js";
import { getFromS3 } from "../utils/getFromS3.js";
import { deductCredits } from "../utils/deductCredits.js";

export const imageGenAgent = async (state) => {
  try {
    const llm = await getModel("image");

    const prompt = `
    You are an elite AI image prompt engineer.

    Convert the user request into a highly detailed image generation prompt.

    Requirements:

    - Cinematic lighting
    - Professional composition
    - Ultra realistic
    - High detail
    - Beautiful color palette
    - Sharp focus
    - 8K Quality
    - Photorealistic
    - Depth of field
    - Professional photography
    - Stunning visuals

    Return only the image prompt

    User Request : ${state.prompt}

    `;

    const res = await llm.invoke(prompt);

    const llmPrompt = res.content.trim();

    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(llmPrompt)}`;

    const imageRes = await axios.get(imageUrl, {
      responseType: "arraybuffer",
    });

    const buffer = Buffer.from(imageRes.data);

    const filename = `image-${Date.now()}.png`;

    await uploadToS3(filename, buffer, "image/png");

    const downloadImageUrl = await getFromS3(filename, 24 * 60 * 60);

    await deductCredits(state.userId, "imageGen");

    return {
      ...state,
      aiResponse: [
        "# Image Generated Successfully",
        "",
        `![Generated Image](${downloadImageUrl})`,
        "",
        `[Download Image](${downloadImageUrl})`,
        "",
        "Link expires in 1 day",
      ].join("\n"),
    };
  } catch (error) {
    console.log(error);
    return {
      ...state,
      aiResponse: "Failed to Generate image",
    };
  }
};
