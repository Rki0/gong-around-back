import mongoose, { Schema, Types } from "mongoose";

interface Location {
  feed: Types.ObjectId;
  writer: Types.ObjectId;
  address: string;
  location: {
    type: StringConstructor;
    coordinates: NumberConstructor[];
  };
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
    // reference : approach to calculate distance between two points using mongoDB
    // https://www.mongodb.com/docs/current/reference/geojson/#geojson-objects
    // https://mongoosejs.com/docs/geojson.html
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
  },
  { timestamps: true }
);

// reference : how to set index property '2dsphere'
// https://github.com/Automattic/mongoose/issues/8977
locationSchema.index({ location: "2dsphere" });

const Location = mongoose.model("Location", locationSchema);

export default Location;
