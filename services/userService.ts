import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";

import Comment from "../models/Comment";
import SubComment from "../models/SubComment";
import Feed from "../models/Feed";
import User from "../models/User";
import UserDB from "../common/userDB";
import Location from "../models/Location";
import Image from "../models/Image";

class UserService {
  // 회원 탈퇴를 하더라도 그 유저가 만들어낸 좋아요 증가분은 유지하도록 한다.
  withdraw = async (userId: string, password: string) => {
    const existingUser = await UserDB.getById(userId);

    let isValidPassword = false;

    try {
      isValidPassword = await bcrypt.compare(password, existingUser.password);
    } catch (err) {
      throw new Error("비밀번호 비교가 실패했습니다.");
    }

    if (!isValidPassword) {
      throw new Error("비밀번호가 일치하지 않습니다.");
    }

    const session = await mongoose.startSession();

    try {
      const s3 = new S3Client({
        region: process.env.AWS_REGION,
      });

      const images = await Image.find({ writer: existingUser._id });

      await Promise.all(
        images.map(
          async (image) =>
            await s3.send(
              new DeleteObjectCommand({
                Bucket: process.env.AWS_S3_BUCKET_NAME!,
                Key: image.key,
              })
            )
        )
      );

      session.startTransaction();

      await SubComment.deleteMany({ writer: existingUser._id }).session(
        session
      );
      await Comment.deleteMany({ writer: existingUser._id }).session(session);
      await Location.deleteMany({ writer: existingUser._id }).session(session);
      await Image.deleteMany({ writer: existingUser._id }).session(session);
      await Feed.deleteMany({ writer: existingUser._id }).session(session);
      await User.findByIdAndDelete(userId).session(session);

      await session.commitTransaction();
    } catch (err) {
      console.log(err);
      await session.abortTransaction();
      await session.endSession();
      throw new Error("회원 탈퇴 세션 실패");
    }

    await session.endSession();
  };
}

export default UserService;
