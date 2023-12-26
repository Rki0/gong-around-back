export interface Location {
  lat: number;
  lng: number;
}

export interface FeedLocation extends Location {
  address: string;
}
