import { getModel } from "../config/models.js";
import { generatePdf } from "../utils/generatePdf.js";
import { getFromS3 } from "../utils/getFromS3.js";
import { uploadToS3 } from "../utils/uploadToS3.js";

export const pdfAgent = async (state) => {
  try {
    const llm = await getModel("pdf");

    const prompt = `
        You are an expert document writer

        Return only valid JSON

        DO not return markdown

        Do not return explanations

        Structure:

        {
        "title":"",
        "subtitle":"",
        "sections":[
        {
        "heading":"",
        "points":[]
        }
        ]
        }

        Generate 4-8 sections.

        Each section should have 3-6 concise bullet points.

        Topic: ${state.prompt}
        
        `;

    const res = await llm.invoke(prompt);

    const data = JSON.parse(res.content);

    const pdfBuffer = await generatePdf(data);

    const filename = `pdf-${Date.now()}.pdf`;
    await uploadToS3(filename, pdfBuffer, "application/pdf");

    const downloadPDFUrl = await getFromS3(filename, 24 * 60 * 60);

    return {
      ...state,
      aiResponse: [
        "# PDF Generated",
        "",
        `**${data.title}**`,
        "",
        `[Download PDF](${downloadPDFUrl})`,
        "",
        "Link expires in 1 Day",
      ].join("\n"),
    };
  } catch (error) {
    console.log(error);
    return {
      ...state,
      aiResponse: "Failed to generate PDF",
    };
  }
};
