import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/authenticate";
import { validate, validateQuery } from "../../middlewares/validate";
import {
  adminTournamentsQuerySchema,
  publishSchema,
  reviewResultsSchema,
  reviewSingleResultSchema,
  submitResultsSchema,
} from "./management.schema";
import {
  getAdminTournaments,
  getManagedResults,
  patchPublish,
  patchReviewResults,
  patchReviewSingleResult,
  putResults,
} from "./management.controller";

export const adminTournamentRoutes = Router();

adminTournamentRoutes.use(authenticate);
adminTournamentRoutes.use(authorize("ADMIN"));

adminTournamentRoutes.get(
  "/",
  validateQuery(adminTournamentsQuerySchema),
  getAdminTournaments,
);

adminTournamentRoutes.patch("/:id/publish", validate(publishSchema), patchPublish);

adminTournamentRoutes.patch(
  "/:id/results/review",
  validate(reviewResultsSchema),
  patchReviewResults,
);

adminTournamentRoutes.patch(
  "/:id/results/:resultId/review",
  validate(reviewSingleResultSchema),
  patchReviewSingleResult,
);

adminTournamentRoutes.get("/:id/results", getManagedResults);

// Rute manajemen hasil untuk penyelenggara maupun admin.
// `authenticate` dipasang per-route, bukan `router.use`, agar tidak menangkap
// request publik ke `/tournaments/*` yang hanya kebetulan berbagi prefix.
export const managedTournamentRoutes = Router();

managedTournamentRoutes.get("/:id/results/manage", authenticate, getManagedResults);
managedTournamentRoutes.put(
  "/:id/results",
  authenticate,
  validate(submitResultsSchema),
  putResults,
);
