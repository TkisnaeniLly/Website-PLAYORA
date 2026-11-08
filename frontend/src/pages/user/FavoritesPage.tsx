import { Link } from "react-router-dom";
import { GameCard } from "@/components/ui/GameCard";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { useFavorites } from "@/hooks/usePersonal";
import { extractApiError } from "@/lib/api";

export function FavoritesPage() {
  const { data, isPending, isError, error, refetch } = useFavorites(true);
  const items = data?.items ?? [];

  return (
    <section className="playora-container py-6 sm:py-8" data-testid="halaman-favorit">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="pl-title">Favorit saya</h1>
          <p className="mt-2 text-sm text-muted">Game yang Anda simpan untuk dimainkan nanti.</p>
        </div>

        <Link
          to="/games"
          className="rounded-[var(--radius-control)] border border-line bg-white px-3 py-2 text-xs font-semibold text-navy-800"
        >
          Jelajahi game
        </Link>
      </header>

      <div className="mt-6">
        {isPending ? (
          <div data-testid="loading-state" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-[var(--radius-card)] bg-navy-100" />
            ))}
          </div>
        ) : isError ? (
          <ErrorState
            pesan={error ? extractApiError(error).message : "Terjadi kesalahan."}
            onRetry={() => void refetch()}
          />
        ) : items.length === 0 ? (
          <EmptyState
            judul="Belum ada game favorit"
            deskripsi="Buka halaman game lalu tekan “Simpan sebagai favorit” untuk menambahkannya di sini."
            aksi={{ label: "Jelajahi game", onClick: () => window.location.assign("/games") }}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => (
              <GameCard key={item.id} game={item.game} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
