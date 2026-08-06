import { PutObjectCommand } from "@aws-sdk/client-s3";
import { client } from "../config/s3.js";

// Uploads the image buffer object into S3 bucket
export const uploadToS3 = async (filename, buffer, contentType) => {
  await client.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: filename,
      Body: buffer,
      ContentType: contentType,
    }),
  );

  return filename;
};
