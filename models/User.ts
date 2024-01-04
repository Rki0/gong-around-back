// reference
// https://mongoosejs.com/docs/typescript.html

import mongoose, { Schema, Types } from "mongoose";

interface User {
  nickname: string;
  email: string;
  password: string;
  likedFeeds: Types.ObjectId[];
  likedComments: Types.ObjectId[];
}

const userSchema = new Schema<User>(
  {
    nickname: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    likedFeeds: [
      {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Feed",
      },
    ],
    likedComments: [
      {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Comment",
      },
    ],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
