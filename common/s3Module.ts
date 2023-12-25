import { S3Client } from "@aws-sdk/client-s3";

// TODO: dotenv 필요할지도..?

class S3Module {
  static openClient = () => {
    const s3 = new S3Client({
      region: process.env.AWS_REGION,
    });

    return s3;
  };
}

export default S3Module;
