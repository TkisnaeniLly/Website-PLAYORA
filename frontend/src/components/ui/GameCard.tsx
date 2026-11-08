import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites, useToggleFavorite } from "@/hooks/usePersonal";
import { isFavorited } from "@/lib/personal";
import type { GameListItem } from "@/types/games";

function Inisial({ judul }: { judul: string }) {
  const huruf = judul
    .split(/\s+/)
    .slice(0, 2)
    .map((kata) => kata.charAt(0).toUpperCase())
    .join("");

  return (
    <div
      aria-hidden="true"
      className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#2a2450] to-[#15152a] text-3xl font-black text-navy-200"
    >
      {huruf || "?"}
    </div>
  );
}

function TombolFavorit({ gameId }: { gameId: string }) {
  const { data: pengguna } = useAuth();
  const { data: favorit } = useFavorites(Boolean(pengguna));
  const toggle = useToggleFavorite();

  if (!pengguna) return null;

  const aktif = isFavorited(favorit?.items ?? [], gameId);

  return (
    <button
      type="button"
      aria-label={aktif ? "Hapus dari favorit" : "Tambah ke favorit"}
      aria-pressed={aktif}
      disabled={toggle.isPending}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggle.mutate({ gameId, aktif });
      }}
      className={[
        "ml-auto flex h-6 w-6 items-center justify-center rounded-full text-sm leading-none transition-colors",
        aktif ? "bg-[#6933e6] text-white" : "bg-[#34365c] text-navy-200 hover:bg-[#4a3a86]",
      ].join(" ")}
    >
      {aktif ? "✓" : "+"}
    </button>
  );
}

export function GameCard({ game }: { game: GameListItem }) {
  const tahun = game.releaseDate ? new Date(game.releaseDate).getFullYear() : null;

  return (
    <article
      data-testid="kartu-game"
      className="group relative min-w-0 overflow-hidden rounded-[var(--radius-card)] border border-line bg-gradient-to-br from-[#1c203e] to-[#111528] transition-all hover:-translate-y-1 hover:border-[#7845e9]"
    >
      <Link to={`/games/${game.slug}`} className="block focus:outline-none">
        <div className="relative h-[150px] overflow-hidden bg-[#1a1d38]">
          {game.coverImageUrl ? (
            <img
              src={game.coverImageUrl}
              alt={`Sampul ${game.title}`}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <Inisial judul={game.title} />
          )}

          {game.isPopular ? (
            <span className="absolute left-2 top-2 rounded-md bg-[#7135f5] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              Populer
            </span>
          ) : null}
        </div>

        <div className="p-2.5">
          <h3 className="truncate text-[13px] font-semibold text-white group-hover:text-[#c9b8ff]">
            {game.title}
          </h3>

          <p className="mt-1 text-[11px] text-navy-400">
            {game.genre}
            {tahun ? ` · ${tahun}` : ""}
          </p>

          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            {game.platforms.map(({ platform }) => (
              <span key={platform.id} className="pl-chip">
                {platform.name}
              </span>
            ))}
          </div>
        </div>
      </Link>

      <div className="absolute right-2 top-2">
        <TombolFavorit gameId={game.id} />
      </div>
    </article>
  );
}
