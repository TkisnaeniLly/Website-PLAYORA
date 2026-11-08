import { Router } from "express";
import { optionalAuthenticate } from "../../middlewares/authenticate";
import { validateQuery } from "../../middlewares/validate";
import { listTournamentsQuerySchema } from "./tournaments.schema";
import { getTournamentDetail, getTournaments } from "./tournaments.controller";

export const tournamentRoutes = Router();

tournamentRoutes.get("/", validateQuery(listTournamentsQuerySchema), getTournaments);
tournamentRoutes.get("/:slug", optionalAuthenticate, getTournamentDetail);
