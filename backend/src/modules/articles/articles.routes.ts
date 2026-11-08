import { Router } from "express";
import { validateQuery } from "../../middlewares/validate";
import { articleDetailQuerySchema, listArticlesQuerySchema } from "./articles.schema";
import { getArticleDetail, getArticleFilters, getArticles } from "./articles.controller";

export const articleRoutes = Router();

// Didaftarkan sebelum "/:slug" agar tidak tertangkap sebagai slug.
articleRoutes.get("/meta/filters", getArticleFilters);
articleRoutes.get("/", validateQuery(listArticlesQuerySchema), getArticles);
articleRoutes.get("/:slug", validateQuery(articleDetailQuerySchema), getArticleDetail);
