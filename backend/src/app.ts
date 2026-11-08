import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { corsOrigins } from "./config/env";
import { apiRouter } from "./routes";
import { csrfProtection } from "./middlewares/csrfProtection";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler";

export const app = express();

// Header identitas framework tidak perlu dibocorkan.
app.disable("x-powered-by");

// Header keamanan dasar (CSP dimatikan agar API tidak mengganggu SPA saat dev).
app.use(helmet());

// CORS hanya untuk origin frontend yang terdaftar.
app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  }),
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

// Dijalankan sebelum router agar seluruh endpoint baru otomatis terlindungi.
app.use("/api/v1", csrfProtection);
app.use("/api/v1", apiRouter);

// Urutan penting: 404 dulu, baru penanganan error.
app.use(notFoundHandler);
app.use(errorHandler);
