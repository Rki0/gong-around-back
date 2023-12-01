import mongoose, { ObjectId, Schema } from "mongoose";

interface Location {
  feed: ObjectId;
  name: string;
  lat: number;
  lng: number;
}

const locationSchema = new Schema<Location>(
  {
    feed: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "Feed",
    },
    name: {
      type: String,
      required: true,
    },
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const Location = mongoose.model("Location", locationSchema);

export default Location;
