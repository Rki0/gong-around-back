import mongoose, { Schema, Types } from "mongoose";

interface Comment {
  writer: Types.ObjectId;
  feed: Types.ObjectId;
  description: string;
  like: number;
  subComments: Types.ObjectId[];
}

const commentSchema = new Schema<Comment>(
  {
    writer: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    feed: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Feed",
    },
    description: {
      type: String,
      required: true,
    },
    like: {
      type: Number,
      default: 0,
    },
    subComments: [
      {
        type: Schema.Types.ObjectId,
        ref: "SubComment",
      },
    ],
  },
  { timestamps: true }
);

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
