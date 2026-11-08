import { Link } from "react-router-dom";
import { ArticleCard } from "@/components/ui/ArticleCard";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { useBookmarks } from "@/hooks/usePersonal";
import { extractApiError } from "@/lib/api";

export function BookmarksPage() {
  const { data, isPending, isError, error, refetch } = useBookmarks(true);
  const items = data?.items ?? [];

  return (
    <section className="playora-container py-6 sm:py-8" data-testid="halaman-simpanan">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="pl-title">Tersimpan</h1>
          <p className="mt-2 text-sm text-muted">Artikel berita dan panduan yang Anda simpan.</p>
        </div>

        <Link
          to="/news"
          className="rounded-[var(--radius-control)] border border-line bg-white px-3 py-2 text-xs font-semibold text-navy-800"
        >
          Baca berita
        </Link>
      </header>

      <div className="mt-6">
        {isPending ? (
          <div data-testid="loading-state" className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-[var(--radius-card)] bg-navy-100" />
            ))}
          </div>
        ) : isError ? (
          <ErrorState
            pesan={error ? extractApiError(error).message : "Terjadi kesalahan."}
            onRetry={() => void refetch()}
          />
        ) : items.length === 0 ? (
          <EmptyState
            judul="Belum ada artikel tersimpan"
            deskripsi="Buka artikel lalu tekan “Simpan artikel” untuk membacanya nanti di sini."
            aksi={{ label: "Baca berita", onClick: () => window.location.assign("/news") }}
          />
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <ArticleCard key={item.id} article={item.article} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
