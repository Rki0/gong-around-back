import multer from "multer";
import multerS3 from "multer-s3";
import dotenv from "dotenv";

import S3Module from "../common/s3Module";

dotenv.config();

interface AllowedMimeType {
  [key: string]: string;
}

const ALLOWED_MIME_TYPE: AllowedMimeType = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
  "application/pdf": "pdf",
};

// reference
// https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/loading-node-credentials-environment.html
// https://velog.io/@zero-black/AWS-aws-sdk%EB%A1%9C-S3-bucket-%EC%97%B0%EA%B2%B0%ED%95%98%EA%B8%B0
const s3 = S3Module.openClient();

const fileMiddleware = multer({
  fileFilter: (req, file, cb) => {
    // solve crash problem when using Korean. This is related with DB not S3.
    file.originalname = Buffer.from(file.originalname, "latin1").toString(
      "utf8"
    );

    if (ALLOWED_MIME_TYPE[file.mimetype]) {
      cb(null, true); // accept
    } else {
      cb(null, false); // not accept
    }
  },
  limits: {
    files: 5, // max number of files
    fileSize: 1000 * 1000 * 1000 * 5, // max size of each file(5 GB)
  },
  storage: multerS3({
    s3,
    bucket: process.env.AWS_S3_BUCKET_NAME!,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    // key is the name which will be saved in S3 bucket.
    key: function (req, file, cb) {
      // extract file extension from file.mimetype
      const ext = ALLOWED_MIME_TYPE[file.mimetype];

      // solve crash problem when using Korean. This is related with S3 not DB.
      cb(
        null,
        `${decodeURI(
          file.originalname.split(`.${ext}`)[0]
        )}_${Date.now().toString()}.${ext}`
      );
    },
  }),
});

export default fileMiddleware;
