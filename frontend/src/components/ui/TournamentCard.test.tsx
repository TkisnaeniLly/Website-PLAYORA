import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { TournamentCard } from "./TournamentCard";
import type { TournamentListItem } from "@/types/tournaments";

function turnamenContoh(ubah: Partial<TournamentListItem> = {}): TournamentListItem {
  return {
    id: "t1",
    title: "Playora Community Cup Valorant",
    slug: "playora-community-cup",
    organizerName: "Komunitas Valorant Indonesia",
    startDate: "2026-12-05",
    endDate: "2026-12-07",
    registrationDeadline: "2026-11-28",
    format: "5v5, single elimination",
    prizePool: "Rp10.000.000",
    status: "upcoming",
    game: { id: "g1", title: "Valorant", slug: "valorant", genre: "FPS" },
    ...ubah,
  };
}

function renderKartu(turnamen: TournamentListItem) {
  return render(
    <MemoryRouter>
      <TournamentCard tournament={turnamen} />
    </MemoryRouter>,
  );
}

describe("TournamentCard", () => {
  it("menampilkan judul, penyelenggara, dan game", () => {
    renderKartu(turnamenContoh());

    expect(screen.getByText("Playora Community Cup Valorant")).toBeInTheDocument();
    expect(screen.getByText("Komunitas Valorant Indonesia")).toBeInTheDocument();
    expect(screen.getByText("Valorant")).toBeInTheDocument();
  });

  it("menampilkan status Mendatang", () => {
    renderKartu(turnamenContoh({ status: "upcoming" }));
    expect(screen.getByTestId("status-turnamen")).toHaveTextContent("Mendatang");
  });

  it("menampilkan status Berlangsung", () => {
    renderKartu(turnamenContoh({ status: "ongoing" }));
    expect(screen.getByTestId("status-turnamen")).toHaveTextContent("Berlangsung");
  });

  it("menampilkan status Selesai", () => {
    renderKartu(turnamenContoh({ status: "finished" }));
    expect(screen.getByTestId("status-turnamen")).toHaveTextContent("Selesai");
  });

  it("menautkan ke halaman detail turnamen", () => {
    renderKartu(turnamenContoh());

    const tautan = screen.getAllByRole("link");
    expect(tautan.length).toBeGreaterThan(0);
    for (const item of tautan) {
      expect(item).toHaveAttribute("href", "/tournaments/playora-community-cup");
    }
  });

  it("menampilkan hadiah bila tersedia", () => {
    renderKartu(turnamenContoh());
    expect(screen.getByText("Rp10.000.000")).toBeInTheDocument();
  });

  it("menyembunyikan baris hadiah bila kosong", () => {
    renderKartu(turnamenContoh({ prizePool: null }));
    expect(screen.queryByText("Rp10.000.000")).not.toBeInTheDocument();
    expect(screen.queryByText("Hadiah:")).not.toBeInTheDocument();
  });
});
