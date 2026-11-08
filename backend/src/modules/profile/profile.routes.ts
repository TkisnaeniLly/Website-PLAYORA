import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { validate } from "../../middlewares/validate";
import { changePasswordSchema, updateProfileSchema } from "./profile.schema";
import { getProfile, patchPassword, patchProfile } from "./profile.controller";

export const profileRoutes = Router();

profileRoutes.use(authenticate);

profileRoutes.get("/", getProfile);
profileRoutes.patch("/", validate(updateProfileSchema), patchProfile);
profileRoutes.patch("/password", validate(changePasswordSchema), patchPassword);
