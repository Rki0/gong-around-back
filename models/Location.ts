import mongoose, { Schema, Types } from "mongoose";

interface Location {
  feed: Types.ObjectId;
  writer: Types.ObjectId;
  address: string;
  lat: number;
  lng: number;
}

const locationSchema = new Schema<Location>(
  {
    feed: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Feed",
    },
    writer: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    address: {
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
