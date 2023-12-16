import mongoose, { Schema, Types } from "mongoose";

interface SubComment {
  writer: Types.ObjectId;
  feed: Types.ObjectId;
  description: string;
  like: number;
  parentComment: Types.ObjectId;
}

const subCommentSchema = new Schema<SubComment>(
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
    parentComment: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Commment",
    },
  },
  { timestamps: true }
);

const SubComment = mongoose.model("SubComment", subCommentSchema);

export default SubComment;
