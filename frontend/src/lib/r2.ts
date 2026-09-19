import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
export { resolveFileViewerUrl, getR2PublicUrl, isR2Path } from "./r2-utils";
import { getR2PublicUrl } from "./r2-utils";

function getS3Client() {
  const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
  const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
  const R2_ENDPOINT_URL = process.env.R2_ENDPOINT_URL;

  return new S3Client({
    region: "auto",
    endpoint: R2_ENDPOINT_URL || "",
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID || "",
      secretAccessKey: R2_SECRET_ACCESS_KEY || "",
    },
  });
}

function getBucketName() {
  return process.env.R2_BUCKET_PTSP;
}

export async function uploadToR2(file: File, path: string) {
  const bucket = getBucketName();
  if (!bucket) throw new Error("R2_BUCKET_PTSP is not defined");

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: path,
    Body: buffer,
    ContentType: file.type,
  });

  await getS3Client().send(command);
  return { path: `r2:${path}` };
}

export async function deleteFromR2(path: string) {
  const bucket = getBucketName();
  if (!bucket) throw new Error("R2_BUCKET_PTSP is not defined");

  const key = path.replace("r2:", "");
  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  await getS3Client().send(command);
  return true;
}


export async function getR2SignedUrl(path: string, _expiresIn: number = 3600) {
  // Directly use official Cloudflare Worker endpoint on files.kemenag-baritoutara.com/ptsp/*
  // with Edge CDN, HTTP/3, and CORS enabled
  return getR2PublicUrl(path);
}

export async function getR2Object(key: string) {
  const bucket = getBucketName();
  if (!bucket) throw new Error("R2_BUCKET_PTSP is not defined");

  const cleanKey = key.replace("r2:", "");
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: cleanKey,
  });

  return await getS3Client().send(command);
}

export async function getR2Usage() {
  const bucket = getBucketName();
  if (!bucket) return { totalSize: 0, fileCount: 0 };
  
  const { ListObjectsV2Command } = await import("@aws-sdk/client-s3");
  const command = new ListObjectsV2Command({
    Bucket: bucket,
  });

  const response = await getS3Client().send(command);
  const totalSize = (response.Contents || []).reduce((acc, curr) => acc + (curr.Size || 0), 0);
  const fileCount = response.KeyCount || 0;

  return { totalSize, fileCount };
}
