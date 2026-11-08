import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { validate, validateQuery } from "../../middlewares/validate";
import {
  createSubmissionSchema,
  listSubmissionsQuerySchema,
  updateSubmissionSchema,
} from "./submissions.schema";
import {
  getMySubmissions,
  getSubmissionDetail,
  patchSubmission,
  postSubmission,
} from "./submissions.controller";

export const submissionRoutes = Router();

submissionRoutes.use(authenticate);

submissionRoutes.post("/", validate(createSubmissionSchema), postSubmission);

submissionRoutes.get(
  "/me",
  validateQuery(listSubmissionsQuerySchema),
  getMySubmissions,
);

submissionRoutes.get("/:id", getSubmissionDetail);

submissionRoutes.patch("/:id", validate(updateSubmissionSchema), patchSubmission);
