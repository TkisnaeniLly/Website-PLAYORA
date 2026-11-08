import axios from "axios";
import { Link, useParams } from "react-router-dom";
import { FavoriteButton } from "@/components/ui/PersonalButtons";
import { useGameDetail } from "@/hooks/useGames";
import { extractApiError } from "@/lib/api";
import { LABEL_KATEGORI, articlePath } from "@/lib/articles";

function formatTanggal(nilai: string | null): string {
  if (!nilai) return "";
  return new Date(nilai).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function GameDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const detail = useGameDetail(slug);

  const tidakDitemukan =
    axios.isAxiosError(detail.error) && detail.error.response?.status === 404;

  if (detail.isPending) {
    return (
      <section className="playora-container py-10" data-testid="loading-state">
        <div className="h-6 w-40 animate-pulse rounded bg-navy-100" />
        <div className="mt-4 h-64 animate-pulse rounded-[var(--radius-card)] bg-navy-100" />
      </section>
    );
  }

  if (tidakDitemukan) {
    return (
      <section className="playora-container py-20 text-center">
        <h1 className="text-2xl font-bold text-navy-800">Game tidak ditemukan</h1>
        <p className="mt-2 text-sm text-muted">
          Game yang Anda cari tidak tersedia atau belum dipublikasikan.
        </p>
        <Link
          to="/games"
          className="mt-6 inline-block rounded-[var(--radius-control)] bg-[#7138F5] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#4B1DB8]"
        >
          Kembali ke katalog
        </Link>
      </section>
    );
  }

  if (detail.isError || !detail.data) {
    return (
      <section className="playora-container py-20 text-center">
        <h1 className="text-xl font-bold text-danger">Gagal memuat detail game</h1>
        <p className="mt-2 text-sm text-muted">
          {detail.error ? extractApiError(detail.error).message : "Terjadi kesalahan."}
        </p>
        <button
          type="button"
          onClick={() => void detail.refetch()}
          className="mt-6 rounded-[var(--radius-control)] border border-navy-700 px-5 py-2.5 text-sm font-semibold text-navy-800"
        >
          Coba lagi
        </button>
      </section>
    );
  }

  const game = detail.data;

  return (
    <article data-testid="game-detail">
      <header
        className="relative overflow-hidden border-b border-line text-white"
        style={{
          backgroundImage: game.coverImageUrl
            ? `linear-gradient(90deg, rgba(11,11,24,.97), rgba(11,11,24,.82) 45%, rgba(11,11,24,.55)), url(${game.coverImageUrl})`
            : "linear-gradient(90deg, #171344, #2b1a5e 55%, #0b0b18)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="playora-container grid gap-8 py-8 sm:py-10 md:grid-cols-[220px_1fr]">
          <div className="aspect-[3/4] w-full max-w-[220px] overflow-hidden rounded-[var(--radius-card)] border border-line bg-[#1d1b36] shadow-2xl">
            {game.coverImageUrl ? (
              <img
                src={game.coverImageUrl}
                alt={`Sampul ${game.title}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div
                aria-hidden="true"
                className="flex h-full w-full items-center justify-center text-4xl font-black text-navy-200"
              >
                {game.title
                  .split(/\s+/)
                  .slice(0, 2)
                  .map((k) => k.charAt(0).toUpperCase())
                  .join("")}
              </div>
            )}
          </div>

          <div>
            <Link to="/games" className="text-xs font-semibold uppercase tracking-widest text-accent-pink">
              ← Kembali ke katalog
            </Link>

            <span className="pl-eyebrow mt-3 block w-fit">Detail game</span>

            <h1 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">
              {game.title}
            </h1>

            <p className="mt-2 text-sm text-navy-300">
              {game.genre}
              {game.releaseDate ? ` · ${new Date(game.releaseDate).getFullYear()}` : ""}
            </p>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {game.platforms.map(({ platform }) => (
                <span key={platform.id} className="pl-chip">
                  {platform.name}
                </span>
              ))}
            </div>

            <div className="mt-5">
              <FavoriteButton gameId={game.id} />
            </div>

            <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-wide text-navy-300">Developer</dt>
                <dd className="mt-0.5 font-medium">{game.developer ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-navy-300">Publisher</dt>
                <dd className="mt-0.5 font-medium">{game.publisher ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-navy-300">Tanggal rilis</dt>
                <dd className="mt-0.5 font-medium">{formatTanggal(game.releaseDate) || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-navy-300">Platform</dt>
                <dd className="mt-0.5 flex flex-wrap gap-1">
                  {game.platforms.length === 0 ? (
                    <span>—</span>
                  ) : (
                    game.platforms.map(({ platform }) => (
                      <span
                        key={platform.id}
                        className="rounded-full bg-[#7138F5] px-2 py-0.5 text-[11px] font-medium text-navy-100"
                      >
                        {platform.name}
                      </span>
                    ))
                  )}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </header>

      <div className="playora-container grid gap-8 py-10 lg:grid-cols-[1fr_320px]">
        <section>
          <h2 className="text-lg font-bold text-navy-800">Tentang game</h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink">
            {game.description}
          </p>
        </section>

        <aside className="space-y-8">
          <section>
            <h2 className="text-lg font-bold text-navy-800">Berita & panduan</h2>
            {game.articles.length === 0 ? (
              <p className="mt-3 text-sm text-muted">
                Belum ada artikel yang membahas game ini.
              </p>
            ) : (
              <ul className="mt-3 space-y-3">
                {game.articles.map((artikel) => (
                  <li key={artikel.id}>
                    <Link
                      to={articlePath(artikel.category, artikel.slug)}
                      className="block rounded-[var(--radius-card)] border border-line bg-white p-4 transition-colors hover:border-navy-300 hover:bg-navy-50"
                    >
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-accent-pink">
                        {LABEL_KATEGORI[artikel.category] ?? artikel.category}
                      </span>
                      <p className="mt-1 text-sm font-semibold text-navy-800">{artikel.title}</p>
                      <p className="mt-1 text-xs text-muted">{formatTanggal(artikel.publishedAt)}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="text-lg font-bold text-navy-800">Turnamen terkait</h2>
            {game.tournaments.length === 0 ? (
              <p className="mt-3 text-sm text-muted">Belum ada turnamen terpublikasi.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {game.tournaments.map((turnamen) => (
                  <li
                    key={turnamen.id}
                    className="rounded-[var(--radius-card)] border border-line bg-white p-4"
                  >
                    <p className="text-sm font-semibold text-navy-800">{turnamen.title}</p>
                    <p className="mt-1 text-xs text-muted">
                      {turnamen.organizerName} · {formatTanggal(turnamen.startDate)}
                    </p>
                    {turnamen.prizePool ? (
                      <p className="mt-1 text-xs font-medium text-navy-600">
                        Hadiah: {turnamen.prizePool}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </article>
  );
}
