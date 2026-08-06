import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { client } from "../config/s3.js";
import { GetObjectCommand } from "@aws-sdk/client-s3";

// returns the converted Image URL from S3
export const getFromS3 = async (filename, expiresIn = 600) => {
  return await getSignedUrl(
    client,
    new GetObjectCommand({
      Key: filename,
      Bucket: process.env.AWS_BUCKET_NAME,
    }),
    {
      expiresIn,
    },
  );
};
