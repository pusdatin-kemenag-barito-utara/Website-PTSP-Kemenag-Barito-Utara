import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID || "",
    secretAccessKey: R2_SECRET_ACCESS_KEY || "",
  },
});

export async function uploadToR2(file: File, path: string) {
  if (!R2_BUCKET_NAME) throw new Error("R2_BUCKET_NAME is not defined");

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: path,
    Body: buffer,
    ContentType: file.type,
  });

  await s3Client.send(command);
  return { path: `r2:${path}` };
}

export async function deleteFromR2(path: string) {
  if (!R2_BUCKET_NAME) throw new Error("R2_BUCKET_NAME is not defined");

  const key = path.replace("r2:", "");
  const command = new DeleteObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);
  return true;
}

export async function getR2SignedUrl(path: string, expiresIn: number = 3600) {
  if (!R2_BUCKET_NAME) throw new Error("R2_BUCKET_NAME is not defined");

  const key = path.replace("r2:", "");
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  });

  return await getSignedUrl(s3Client, command, { expiresIn });
}

export function isR2Path(path: string) {
  return path.startsWith("r2:");
}
