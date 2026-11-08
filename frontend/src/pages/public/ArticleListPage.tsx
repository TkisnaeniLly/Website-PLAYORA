import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ArticleCard } from "@/components/ui/ArticleCard";
import { Pagination } from "@/components/ui/Pagination";
import { ArticleSkeletonList, EmptyState, ErrorState } from "@/components/ui/States";
import { useArticleFilters, useArticles } from "@/hooks/useArticles";
import { extractApiError } from "@/lib/api";
import {
  BATAS_ARTIKEL,
  DESKRIPSI_TIPE,
  KATEGORI_PER_TIPE,
  LABEL_KATEGORI,
  LABEL_TIPE,
  hitungTotalHalamanArtikel,
} from "@/lib/articles";
import type { ArticleCategory, ArticleType } from "@/types/articles";

export function ArticleListPage({ tipe }: { tipe: ArticleType }) {
  const [searchParams, setSearchParams] = useSearchParams();

  const q = searchParams.get("q") ?? "";
  const kategori = searchParams.get("category") ?? "";
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

  const daftar = useArticles({
    type: tipe,
    q,
    category: kategori,
    page,
    limit: BATAS_ARTIKEL,
  });
  const filter = useArticleFilters();

  const kategoriTersedia: ArticleCategory[] = KATEGORI_PER_TIPE[tipe].filter((nilai) =>
    (filter.data?.categories ?? []).some((c) => c.value === nilai),
  );

  function ubahKategori(nilai: string) {
    setSearchParams(
      (sebelumnya) => {
        const berikut = new URLSearchParams(sebelumnya);
        if (nilai) berikut.set("category", nilai);
        else berikut.delete("category");
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

  const adaFilter = Boolean(q || kategori);
  const totalHalaman = daftar.data
    ? hitungTotalHalamanArtikel(daftar.data.total, daftar.data.limit)
    : 1;

  return (
    <section className="playora-container py-6 sm:py-8">
      <header>
        <h1 className="pl-title">
          {LABEL_TIPE[tipe]}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">{DESKRIPSI_TIPE[tipe]}</p>
      </header>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2">
          <label htmlFor={`cari-${tipe}`} className="mb-1.5 block text-sm font-medium text-navy-800">
            Cari {LABEL_TIPE[tipe].toLowerCase()}
          </label>
          <input
            id={`cari-${tipe}`}
            data-testid="search-input"
            type="search"
            value={kataKunci}
            onChange={(e) => setKataKunci(e.target.value)}
            placeholder="Cari berdasarkan judul"
            className="w-full rounded-[var(--radius-control)] border border-line bg-white px-3 py-2.5 text-sm"
          />
        </div>

        <div>
          <label
            htmlFor={`kategori-${tipe}`}
            className="mb-1.5 block text-sm font-medium text-navy-800"
          >
            Kategori
          </label>
          <select
            id={`kategori-${tipe}`}
            data-testid="filter-kategori"
            value={kategori}
            onChange={(e) => ubahKategori(e.target.value)}
            className="w-full rounded-[var(--radius-control)] border border-line bg-white px-3 py-2.5 text-sm"
          >
            <option value="">Semua kategori</option>
            {kategoriTersedia.map((nilai) => (
              <option key={nilai} value={nilai}>
                {LABEL_KATEGORI[nilai]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted" data-testid="jumlah-hasil">
          {daftar.data
            ? `${daftar.data.total} ${LABEL_TIPE[tipe].toLowerCase()} ditemukan`
            : "Memuat artikel…"}
        </p>

        {adaFilter ? (
          <button
            type="button"
            onClick={bersihkanFilter}
            className="text-sm font-semibold text-navy-700 hover:underline"
          >
            Hapus filter
          </button>
        ) : null}
      </div>

      <div className="mt-6">
        {daftar.isPending ? (
          <ArticleSkeletonList jumlah={6} />
        ) : daftar.isError ? (
          <ErrorState
            pesan={extractApiError(daftar.error).message}
            onRetry={() => void daftar.refetch()}
          />
        ) : daftar.data && daftar.data.items.length === 0 ? (
          <EmptyState
            judul={`Tidak ada ${LABEL_TIPE[tipe].toLowerCase()} yang cocok`}
            deskripsi={
              adaFilter
                ? "Coba ubah kata kunci atau kategori yang digunakan."
                : `Belum ada ${LABEL_TIPE[tipe].toLowerCase()} yang dipublikasikan.`
            }
            aksi={
              adaFilter ? { label: "Hapus filter", onClick: bersihkanFilter } : undefined
            }
          />
        ) : (
          <ul
            data-testid="articles-grid"
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {(daftar.data?.items ?? []).map((artikel) => (
              <li key={artikel.id}>
                <ArticleCard article={artikel} />
              </li>
            ))}
          </ul>
        )}
      </div>

      <Pagination page={page} totalPages={totalHalaman} onChange={ubahHalaman} />
    </section>
  );
}
