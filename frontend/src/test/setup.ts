import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Tanpa `globals: true`, Testing Library tidak mendaftarkan pembersihan otomatis.
afterEach(() => {
  cleanup();
});
