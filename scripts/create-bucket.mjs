import { config } from 'dotenv';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { S3Client, CreateBucketCommand, HeadBucketCommand } from '@aws-sdk/client-s3';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../.env') });

const s3 = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION ?? 'us-east-1',
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
});

const bucket = process.env.S3_BUCKET;

try {
  await s3.send(new HeadBucketCommand({ Bucket: bucket }));
  console.log(`Bucket "${bucket}" already exists.`);
} catch {
  await s3.send(new CreateBucketCommand({ Bucket: bucket }));
  console.log(`Created bucket "${bucket}".`);
}
