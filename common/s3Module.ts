import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

interface File {
  path: string;
  name: string;
  key: string;
}

class S3Module {
  static openClient = () => {
    const s3 = new S3Client({
      region: process.env.AWS_REGION,
    });

    return s3;
  };

  static deleteMany = async (
    s3: S3Client,
    files: Express.MulterS3.File[] | File[]
  ) => {
    await Promise.all(
      files.map(
        async (file) =>
          await s3.send(
            new DeleteObjectCommand({
              Bucket: process.env.AWS_S3_BUCKET_NAME!,
              Key: file.key,
            })
          )
      )
    );
  };
}

export default S3Module;
