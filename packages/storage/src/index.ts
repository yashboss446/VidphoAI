import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export const s3 = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION ?? 'us-east-1',
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
  // The SDK's default flex checksums add an x-amz-checksum-* header that older
  // S3-compatible servers (e.g. LocalStack 3.0.x) reject on presigned PUT uploads.
  requestChecksumCalculation: 'WHEN_REQUIRED',
});

export const BUCKET = process.env.S3_BUCKET!;

export function objectKeyFor(projectId: string, filename: string) {
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `projects/${projectId}/${crypto.randomUUID()}-${safe}`;
}

export async function presignUpload(key: string, contentType: string) {
  const command = new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: contentType });
  return getSignedUrl(s3, command, { expiresIn: 900 });
}

export async function presignDownload(key: string) {
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  return getSignedUrl(s3, command, { expiresIn: 3600 });
}

export async function getObjectBytes(key: string): Promise<Uint8Array> {
  const object = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
  return object.Body!.transformToByteArray();
}

export async function putObjectBytes(key: string, body: Uint8Array, contentType: string) {
  await s3.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: body, ContentType: contentType }));
}

export function publicUrlFor(key: string) {
  const base = process.env.S3_PUBLIC_URL ?? `${process.env.S3_ENDPOINT}/${BUCKET}`;
  return `${base}/${key}`;
}
