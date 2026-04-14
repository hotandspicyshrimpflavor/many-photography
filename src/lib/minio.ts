import * as Minio from 'minio';

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || '',
  secretKey: process.env.MINIO_SECRET_KEY || '',
});

const BUCKET = process.env.MINIO_BUCKET || 'many-photography';

export async function ensureBucket() {
  const exists = await minioClient.bucketExists(BUCKET);
  if (!exists) {
    await minioClient.makeBucket(BUCKET);
  }
  return BUCKET;
}

export async function uploadFile(
  fileName: string,
  fileBuffer: Buffer,
  mimeType: string
): Promise<string> {
  await ensureBucket();

  const path = `uploads/${Date.now()}-${fileName}`;
  await minioClient.putObject(BUCKET, path, fileBuffer, {
    'Content-Type': mimeType,
  });

  return path;
}

export async function getSignedUrl(
  path: string,
  expirySeconds: number = 3600
): Promise<string> {
  return await minioClient.presignedGetObject(BUCKET, path, expirySeconds);
}

export async function getUploadUrl(
  path: string,
  expirySeconds: number = 3600
): Promise<string> {
  await ensureBucket();
  return await minioClient.presignedPutObject(BUCKET, path, expirySeconds);
}

export async function deleteFile(path: string): Promise<void> {
  await minioClient.removeObject(BUCKET, path);
}

export { minioClient, BUCKET };
