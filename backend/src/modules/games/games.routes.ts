import { Router } from "express";
import { validateQuery } from "../../middlewares/validate";
import { listGamesQuerySchema } from "./games.schema";
import { getGameDetail, getGameFilters, getGames } from "./games.controller";

export const gameRoutes = Router();

// Didaftarkan sebelum "/:slug" agar tidak tertangkap sebagai slug.
gameRoutes.get("/meta/filters", getGameFilters);
gameRoutes.get("/", validateQuery(listGamesQuerySchema), getGames);
gameRoutes.get("/:slug", getGameDetail);
