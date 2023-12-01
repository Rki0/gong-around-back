import mongoose, { Schema, ObjectId } from "mongoose";

interface User {
  nickname: string;
  email: string;
  password: string;
  writedFeeds: ObjectId[];
  writedComments: ObjectId[];
  writedSubComments: ObjectId[];
  likedFeeds: ObjectId[];
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
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "Feed",
      },
    ],
    writedComments: [
      {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "Comment",
      },
    ],
    writedSubComments: [
      {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "SubComment",
      },
    ],
    likedFeeds: [
      {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "Feed",
      },
    ],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
