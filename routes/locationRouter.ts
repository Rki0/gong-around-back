import { Router } from "express";

import LocationController from "../controllers/locationController";

const router = Router();
const locationController = new LocationController();

router.get("/", locationController.getAroundLocation);

export default router;
