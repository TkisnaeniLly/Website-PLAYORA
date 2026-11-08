import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ArticleCard } from "./ArticleCard";
import type { ArticleListItem } from "@/types/articles";

function artikelContoh(ubah: Partial<ArticleListItem> = {}): ArticleListItem {
  return {
    id: "a1",
    title: "Lima Tips Meningkatkan Akurasi Aim",
    slug: "lima-tips-akurasi-aim",
    excerpt: "Latihan rutin memberi dampak paling besar.",
    category: "TIPS",
    thumbnailUrl: null,
    publishedAt: "2026-03-10T00:00:00.000Z",
    author: { name: "Redaksi PLAYORA", username: "redaksi" },
    game: { id: "g1", title: "Valorant", slug: "valorant" },
    ...ubah,
  };
}

function renderKartu(article: ArticleListItem) {
  return render(
    <MemoryRouter>
      <ArticleCard article={article} />
    </MemoryRouter>,
  );
}

describe("ArticleCard", () => {
  it("menampilkan judul, kategori, penulis, dan tanggal", () => {
    renderKartu(artikelContoh());

    expect(
      screen.getByText("Lima Tips Meningkatkan Akurasi Aim"),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Tips").length).toBeGreaterThan(0);
    expect(screen.getByText(/Redaksi PLAYORA/)).toBeInTheDocument();
    expect(screen.getByText(/2026/)).toBeInTheDocument();
  });

  it("menampilkan ringkasan artikel", () => {
    renderKartu(artikelContoh());
    expect(
      screen.getByText("Latihan rutin memberi dampak paling besar."),
    ).toBeInTheDocument();
  });

  it("menautkan artikel panduan ke /guides/:slug", () => {
    renderKartu(artikelContoh({ category: "TUTORIAL", slug: "panduan-memulai" }));

    expect(screen.getByRole("link")).toHaveAttribute("href", "/guides/panduan-memulai");
  });

  it("menautkan artikel berita ke /news/:slug", () => {
    renderKartu(artikelContoh({ category: "NEWS", slug: "kabar-terbaru" }));

    expect(screen.getByRole("link")).toHaveAttribute("href", "/news/kabar-terbaru");
  });

  it("menautkan artikel esports ke /news/:slug", () => {
    renderKartu(artikelContoh({ category: "ESPORTS", slug: "liputan-esports" }));

    expect(screen.getByRole("link")).toHaveAttribute("href", "/news/liputan-esports");
  });

  it("memakai gambar ketika thumbnail tersedia", () => {
    renderKartu(artikelContoh({ thumbnailUrl: "https://contoh.id/gambar.jpg" }));

    const gambar = screen.getByRole("img");
    expect(gambar).toHaveAttribute("src", "https://contoh.id/gambar.jpg");
    expect(gambar).toHaveAttribute("alt", "Ilustrasi Lima Tips Meningkatkan Akurasi Aim");
  });

  it("menampilkan label kategori sebagai pengganti saat tanpa thumbnail", () => {
    renderKartu(artikelContoh({ thumbnailUrl: null, category: "ESPORTS" }));

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getAllByText("Esports").length).toBeGreaterThan(0);
  });

  it("tetap tampil rapi saat ringkasan tidak ada", () => {
    renderKartu(artikelContoh({ excerpt: null }));

    expect(
      screen.getByText("Lima Tips Meningkatkan Akurasi Aim"),
    ).toBeInTheDocument();
  });
});
