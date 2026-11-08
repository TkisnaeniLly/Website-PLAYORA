import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/authenticate";
import { validate, validateQuery } from "../../middlewares/validate";
import { sendSuccess } from "../../utils/response";
import { decisionSchema, listSubmissionsQuerySchema } from "../submissions/submissions.schema";
import {
  getAdminSubmissions,
  patchAdminDecision,
} from "../submissions/submissions.controller";

export const adminRoutes = Router();

adminRoutes.use(authenticate);
adminRoutes.use(authorize("ADMIN"));

adminRoutes.get("/ping", (req, res) => {
  sendSuccess(res, {
    message: "Akses admin terverifikasi.",
    userId: req.user?.id ?? null,
  });
});

adminRoutes.get(
  "/submissions",
  validateQuery(listSubmissionsQuerySchema),
  getAdminSubmissions,
);

adminRoutes.patch(
  "/submissions/:id/decision",
  validate(decisionSchema),
  patchAdminDecision,
);
