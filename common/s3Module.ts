import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

// TODO: dotenv 필요할지도..?

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
    try {
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
    } catch (err) {
      console.log("S3 이미지 삭제 실패:", err);
      throw new Error("S3 이미지 삭제 실패");
    }
  };
}

export default S3Module;
