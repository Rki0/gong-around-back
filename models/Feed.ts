import mongoose, { Schema, Types } from "mongoose";

interface Feed {
  title: string;
  travelDate: string;
  airportName: string;
  location: Types.ObjectId;
  writer: Types.ObjectId;
  description: string;
  like: number;
  view: number;
  comments: Types.ObjectId[];
  subComments: Types.ObjectId[];
  images: Types.ObjectId[];
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
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Location",
    },
    writer: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    description: {
      type: String,
      required: true,
    },
    like: {
      type: Number,
      default: 0,
      min: 0,
    },
    view: {
      type: Number,
      default: 0,
      min: 0,
    },
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    subComments: [
      {
        type: Schema.Types.ObjectId,
        ref: "SubComment",
      },
    ],
    images: [
      {
        type: Schema.Types.ObjectId,
        ref: "Image",
      },
    ],
  },
  { timestamps: true }
);

const Feed = mongoose.model("Feed", feedSchema);

export default Feed;
