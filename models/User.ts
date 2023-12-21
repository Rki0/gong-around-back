// reference
// https://mongoosejs.com/docs/typescript.html

import mongoose, { Schema, Types } from "mongoose";

interface User {
  nickname: string;
  email: string;
  password: string;
  writedFeeds: Types.ObjectId[];
  writedComments: Types.ObjectId[];
  writedSubComments: Types.ObjectId[];
  likedFeeds: Types.ObjectId[];
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
    writedFeeds: [
      {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Feed",
      },
    ],
    writedComments: [
      {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Comment",
      },
    ],
    writedSubComments: [
      {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "SubComment",
      },
    ],
    likedFeeds: [
      {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Feed",
      },
    ],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
