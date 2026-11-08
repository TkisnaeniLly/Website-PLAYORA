import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { AppLayout } from "./AppLayout";

function buatRouter(awal: string) {
  return createMemoryRouter(
    [
      {
        path: "/",
        element: <AppLayout />,
        children: [
          { index: true, element: <p>Beranda</p> },
          {
            path: "community",
            element: (
              <section>
                <div style={{ height: 2000 }} />
                <div id="discord" data-testid="target-discord">
                  Seksi Discord
                </div>
              </section>
            ),
          },
        ],
      },
    ],
    { initialEntries: [awal] },
  );
}

function renderRute(awal: string) {
  const Router = buatRouter(awal);
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={Router} />
    </QueryClientProvider>,
  );
}

describe("AppLayout", () => {
  beforeEach(() => {
    window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
  });

  it("menggulir ke elemen yang dituju saat URL memuat hash", async () => {
    const gulir = vi.fn();
    Element.prototype.scrollIntoView = gulir;

    renderRute("/community#discord");

    await screen.findByTestId("target-discord");
    await new Promise((selesai) => requestAnimationFrame(() => selesai(null)));

    expect(gulir).toHaveBeenCalled();
  });

  it("tidak menggulir ke seksi bila URL tanpa hash", async () => {
    const gulir = vi.fn();
    Element.prototype.scrollIntoView = gulir;

    renderRute("/community");

    await screen.findByText("Seksi Discord");
    await new Promise((selesai) => requestAnimationFrame(() => selesai(null)));

    expect(gulir).not.toHaveBeenCalled();
  });

  it("menautkan ajakan Discord pada sidebar ke seksi rekomendasi", () => {
    renderRute("/community");

    const tautan = screen.getByTestId("tombol-gabung-discord");
    expect(tautan.getAttribute("href")).toBe("/community#discord");
    expect(screen.queryByTestId("tombol-keluar")).toBeNull();
  });

  it("tidak mengulang tombol masuk dan daftar di bawah ajakan Discord pada sidebar", () => {
    renderRute("/community");

    const sidebar = screen.getByTestId("sidebar");

    expect(within(sidebar).queryByRole("link", { name: "Masuk" })).toBeNull();
    expect(within(sidebar).queryByRole("link", { name: "Daftar akun" })).toBeNull();
    expect(within(sidebar).queryByRole("link", { name: "Daftar" })).toBeNull();
    expect(within(sidebar).getByTestId("ajakan-discord")).toBeTruthy();
  });
});
