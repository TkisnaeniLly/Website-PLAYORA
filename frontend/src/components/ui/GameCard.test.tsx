import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GameCard } from "./GameCard";
import type { GameListItem } from "@/types/games";

function gameContoh(ubah: Partial<GameListItem> = {}): GameListItem {
  return {
    id: "g1",
    title: "Valorant",
    slug: "valorant",
    genre: "FPS",
    coverImageUrl: null,
    isPopular: true,
    releaseDate: "2020-06-02T00:00:00.000Z",
    platforms: [
      { platform: { id: "p1", name: "PC" } },
      { platform: { id: "p2", name: "PlayStation 5" } },
    ],
    ...ubah,
  };
}

function renderKartu(game: GameListItem) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <GameCard game={game} />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("GameCard", () => {
  it("menampilkan judul, genre, dan tahun rilis", () => {
    renderKartu(gameContoh());

    expect(screen.getByText("Valorant")).toBeInTheDocument();
    expect(screen.getByText(/FPS/)).toBeInTheDocument();
    expect(screen.getByText(/2020/)).toBeInTheDocument();
  });

  it("menautkan kartu ke halaman detail", () => {
    renderKartu(gameContoh());

    const tautan = screen.getByRole("link");
    expect(tautan).toHaveAttribute("href", "/games/valorant");
  });

  it("menampilkan seluruh platform", () => {
    renderKartu(gameContoh());

    expect(screen.getByText("PC")).toBeInTheDocument();
    expect(screen.getByText("PlayStation 5")).toBeInTheDocument();
  });

  it("menampilkan label Populer hanya untuk game populer", () => {
    const { rerender } = renderKartu(gameContoh());
    expect(screen.getByText("Populer")).toBeInTheDocument();

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });

    rerender(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <GameCard game={gameContoh({ isPopular: false })} />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    expect(screen.queryByText("Populer")).not.toBeInTheDocument();
  });

  it("menampilkan inisial saat game tidak punya sampul", () => {
    renderKartu(gameContoh({ coverImageUrl: null }));

    expect(screen.getByText("V")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("memakai elemen gambar ketika sampul tersedia", () => {
    renderKartu(gameContoh({ coverImageUrl: "https://contoh.id/valorant.jpg" }));

    const gambar = screen.getByRole("img");
    expect(gambar).toHaveAttribute("src", "https://contoh.id/valorant.jpg");
    expect(gambar).toHaveAttribute("alt", "Sampul Valorant");
  });
});
