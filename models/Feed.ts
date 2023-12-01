import mongoose, { Schema, ObjectId } from "mongoose";

interface Feed {
  title: string;
  travelDate: string;
  airportName: string;
  location: ObjectId;
  writer: ObjectId;
  content: string;
  like: number;
  view: number;
  comments: ObjectId[];
  subComments: ObjectId[];
  images: ObjectId[];
}

const feedSchema = new Schema<Feed>(
  {
    title: {
      type: String,
      required: true,
    },
    travelDate: {
      type: String,
    },
    airportName: {
      type: String,
    },
    location: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "Location",
    },
    writer: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "User",
    },
    content: {
      type: String,
      required: true,
    },
    like: {
      type: Number,
      default: 0,
    },
    view: {
      type: Number,
      default: 0,
    },
    comments: [
      {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "Comment",
      },
    ],
    subComments: [
      {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "SubComment",
      },
    ],
    images: [
      {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "Image",
      },
    ],
  },
  { timestamps: true }
);

const Feed = mongoose.model("Feed", feedSchema);

export default Feed;
