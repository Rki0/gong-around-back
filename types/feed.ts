import { FeedLocation as Location } from "./location";

// reference
// https://stackoverflow.com/questions/57631753/how-to-properly-handle-req-files-in-node-post-request-using-multer-and-typescrip
// https://devdojo.com/noah071610/typescript-multer-error-property-location-does-not-exist-on-type-file
export interface Feed {
  title: string;
  date: string;
  location: Location;
  description: string;
  images: Express.MulterS3.File[];
}
