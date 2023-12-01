import mongoose, { ObjectId, Schema } from "mongoose";

interface Comment {
  writer: ObjectId;
  feed: ObjectId;
  content: string;
  like: number;
  subComments: ObjectId[];
}

const commentSchema = new Schema<Comment>(
  {
    writer: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "User",
    },
    feed: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "Feed",
    },
    content: {
      type: String,
      required: true,
    },
    like: {
      type: Number,
      default: 0,
    },
    subComments: [
      {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "SubCommment",
      },
    ],
  },
  { timestamps: true }
);

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
