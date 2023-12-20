import mongoose, { Schema, Types } from "mongoose";

interface Image {
  writer: Types.ObjectId;
  feed: Types.ObjectId;
  path: string;
  name: string;
  key: string;
}

const imageSchema = new Schema<Image>(
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
    path: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    key: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Image = mongoose.model("Image", imageSchema);

export default Image;
