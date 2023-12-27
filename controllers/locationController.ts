import { Request, Response } from "express";

import LocationService from "../services/locationService";

class LocationController {
  public locationService: LocationService;

  constructor() {
    this.locationService = new LocationService();
  }

  getAroundLocation = async (req: Request, res: Response) => {
    const location = {
      lat: parseFloat(req.query.lat as string),
      lng: parseFloat(req.query.lng as string),
    };

    const calculatedLocation = await this.locationService.getAroundLocation(
      location
    );

    return res.status(200).json({ markers: calculatedLocation });
  };
}

export default LocationController;
