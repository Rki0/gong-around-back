import mongoose, { ObjectId, Schema } from "mongoose";

interface SubComment {
  writer: ObjectId;
  feed: ObjectId;
  content: string;
  like: number;
  referenceComment: ObjectId;
}

const subCommentSchema = new Schema<SubComment>(
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
    referenceComment: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "Commment",
    },
  },
  { timestamps: true }
);

const SubComment = mongoose.model("SubComment", subCommentSchema);

export default SubComment;
