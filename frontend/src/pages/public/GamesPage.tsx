import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { GameCard } from "@/components/ui/GameCard";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState, ErrorState, GameSkeletonGrid } from "@/components/ui/States";
import { useGameFilters, useGames } from "@/hooks/useGames";
import { extractApiError } from "@/lib/api";
import { BATAS_DEFAULT, hitungTotalHalaman } from "@/lib/games";

export function GamesPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const q = searchParams.get("q") ?? "";
  const platform = searchParams.get("platform") ?? "";
  const genre = searchParams.get("genre") ?? "";
  const pageMentah = Number.parseInt(searchParams.get("page") ?? "1", 10);
  const page = Number.isFinite(pageMentah) && pageMentah > 0 ? pageMentah : 1;

  const [kataKunci, setKataKunci] = useState(q);

  useEffect(() => {
    setKataKunci(q);
  }, [q]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const nilai = kataKunci.trim();
      if (nilai === q) return;

      setSearchParams(
        (sebelumnya) => {
          const berikut = new URLSearchParams(sebelumnya);
          if (nilai) berikut.set("q", nilai);
          else berikut.delete("q");
          berikut.delete("page");
          return berikut;
        },
        { replace: true },
      );
    }, 350);

    return () => clearTimeout(timer);
  }, [kataKunci, q, setSearchParams]);

  const daftar = useGames({ q, platform, genre, page, limit: BATAS_DEFAULT });
  const filter = useGameFilters();

  function ubahFilter(kunci: "platform" | "genre", nilai: string) {
    setSearchParams(
      (sebelumnya) => {
        const berikut = new URLSearchParams(sebelumnya);
        if (nilai) berikut.set(kunci, nilai);
        else berikut.delete(kunci);
        berikut.delete("page");
        return berikut;
      },
      { replace: true },
    );
  }

  function ubahHalaman(baru: number) {
    setSearchParams(
      (sebelumnya) => {
        const berikut = new URLSearchParams(sebelumnya);
        if (baru <= 1) berikut.delete("page");
        else berikut.set("page", String(baru));
        return berikut;
      },
      { replace: true },
    );
  }

  function bersihkanFilter() {
    setSearchParams(new URLSearchParams(), { replace: true });
    setKataKunci("");
  }

  const adaFilter = Boolean(q || platform || genre);
  const totalHalaman = daftar.data
    ? hitungTotalHalaman(daftar.data.total, daftar.data.limit)
    : 1;

  return (
    <section className="playora-container py-6 sm:py-8">
      <header>
        <span className="pl-eyebrow">Katalog</span>
        <h1 className="pl-title mt-3">Jelajahi Game</h1>
        <p className="mt-2 max-w-2xl text-sm text-navy-400">
          Katalog game lintas platform. Cari berdasarkan nama, atau saring menurut
          platform dan genre.
        </p>
      </header>

      <div className="mt-6 grid gap-3 rounded-[var(--radius-card)] border border-line bg-gradient-to-br from-[#171a34] to-[#111528] p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2">
          <label htmlFor="cari-game" className="mb-1.5 block text-sm font-medium text-navy-200">
            Cari game
          </label>
          <input
            id="cari-game"
            data-testid="search-input"
            type="search"
            value={kataKunci}
            onChange={(e) => setKataKunci(e.target.value)}
            placeholder="Contoh: Valorant"
            className="pl-input"
          />
        </div>

        <div>
          <label htmlFor="filter-platform" className="mb-1.5 block text-sm font-medium text-navy-200">
            Platform
          </label>
          <select
            id="filter-platform"
            data-testid="filter-platform"
            value={platform}
            onChange={(e) => ubahFilter("platform", e.target.value)}
            className="pl-input"
          >
            <option value="">Semua platform</option>
            {(filter.data?.platforms ?? []).map((p) => (
              <option key={p.id} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filter-genre" className="mb-1.5 block text-sm font-medium text-navy-200">
            Genre
          </label>
          <select
            id="filter-genre"
            data-testid="filter-genre"
            value={genre}
            onChange={(e) => ubahFilter("genre", e.target.value)}
            className="pl-input"
          >
            <option value="">Semua genre</option>
            {(filter.data?.genres ?? []).map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-navy-400" data-testid="jumlah-hasil">
          {daftar.data ? `${daftar.data.total} game ditemukan` : "Memuat katalog…"}
        </p>

        {adaFilter ? (
          <button type="button" onClick={bersihkanFilter} className="pl-link">
            Hapus filter
          </button>
        ) : null}
      </div>

      <div className="mt-5">
        {daftar.isPending ? (
          <GameSkeletonGrid jumlah={10} />
        ) : daftar.isError ? (
          <ErrorState
            pesan={extractApiError(daftar.error).message}
            onRetry={() => void daftar.refetch()}
          />
        ) : daftar.data && daftar.data.items.length === 0 ? (
          <EmptyState
            judul="Tidak ada game yang cocok"
            deskripsi={
              adaFilter
                ? "Coba ubah kata kunci atau saringan yang digunakan."
                : "Katalog masih kosong."
            }
            aksi={adaFilter ? { label: "Hapus filter", onClick: bersihkanFilter } : undefined}
          />
        ) : (
          <ul
            data-testid="games-grid"
            className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
          >
            {(daftar.data?.items ?? []).map((game) => (
              <li key={game.id}>
                <GameCard game={game} />
              </li>
            ))}
          </ul>
        )}
      </div>

      <Pagination page={page} totalPages={totalHalaman} onChange={ubahHalaman} />
    </section>
  );
}
