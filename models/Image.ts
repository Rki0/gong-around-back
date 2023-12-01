import mongoose, { ObjectId, Schema } from "mongoose";

interface Image {
  writer: ObjectId;
  feed: ObjectId;
  src: string;
  path: string;
  name: string;
  ext: string;
}

const imageSchema = new Schema<Image>(
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
    src: {
      type: String,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    ext: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Image = mongoose.model("Image", imageSchema);

export default Image;
