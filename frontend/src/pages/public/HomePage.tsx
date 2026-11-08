import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getHealth } from "@/lib/api";
import { useGames } from "@/hooks/useGames";
import { useArticles } from "@/hooks/useArticles";
import { useUpcomingTournaments } from "@/hooks/useTournaments";
import { GameCard } from "@/components/ui/GameCard";
import { GameSkeletonGrid } from "@/components/ui/States";
import { articlePath, LABEL_KATEGORI } from "@/lib/articles";
import { formatRentangTanggal } from "@/lib/tournaments";
import type { GameListItem } from "@/types/games";

function formatTanggalSingkat(nilai: string | null): string {
  if (!nilai) return "—";
  return new Date(nilai).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function Hero({ game, indeks, total, onPindah }: {
  game: GameListItem | undefined;
  indeks: number;
  total: number;
  onPindah: (baru: number) => void;
}) {
  if (!game) {
    return (
      <div className="relative flex h-[340px] items-center overflow-hidden rounded-[22px] border border-line bg-gradient-to-r from-[#171344] via-[#46218a] to-[#171344] px-8">
        <div className="max-w-md">
          <span className="pl-eyebrow">Selamat datang</span>
          <h1 className="mt-3 text-3xl font-extrabold leading-tight text-white sm:text-4xl">
            Dunia game dalam satu tempat.
          </h1>
          <p className="mt-3 text-sm text-navy-300">
            Katalog game, berita &amp; panduan, serta direktori turnamen.
          </p>
          <Link to="/games" className="pl-btn mt-5">
            Jelajahi game →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid="hero"
      className="relative h-[340px] overflow-hidden rounded-[22px] border border-line"
      style={
        game.coverImageUrl
          ? {
              backgroundImage: `linear-gradient(90deg, rgba(13,15,43,.95), rgba(13,15,43,.68) 45%, rgba(13,15,43,.12)), url(${game.coverImageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : {
              backgroundImage:
                "linear-gradient(90deg, #171344, #46218a 55%, #171344)",
            }
      }
    >
      <div className="absolute left-[6%] top-[15%] z-10 max-w-[430px]">
        <span className="pl-eyebrow">Game populer</span>
        <h1 className="mt-3 text-[30px] font-extrabold leading-[1.15] tracking-tight text-white sm:text-[35px]">
          {game.title}
        </h1>
        <p className="mt-2 max-w-[330px] text-sm leading-relaxed text-navy-200 sm:text-base">
          {game.genre}
          {game.platforms.length > 0 ? ` · ${game.platforms.map((p) => p.platform.name).join(", ")}` : ""}
          {" — "}
          temukan detail, berita, dan turnamen terkait.
        </p>
        <Link to={`/games/${game.slug}`} className="pl-btn mt-4">
          Lihat detail →
        </Link>
      </div>

      {total > 1 ? (
        <>
          <button
            type="button"
            aria-label="Slide sebelumnya"
            onClick={() => onPindah((indeks - 1 + total) % total)}
            className="absolute left-3 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-[#12152bbd] text-xl text-white sm:flex"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Slide berikutnya"
            onClick={() => onPindah((indeks + 1) % total)}
            className="absolute right-3 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-[#12152bbd] text-xl text-white sm:flex"
          >
            ›
          </button>

          <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-2">
            {Array.from({ length: total }).map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Slide ${i + 1}`}
                onClick={() => onPindah(i)}
                className={[
                  "h-2 rounded-full transition-all",
                  i === indeks ? "w-6 bg-[#843cff]" : "w-2 bg-[#aaa8ce]",
                ].join(" ")}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

function StatusSistem() {
  const { data, isError } = useQuery({
    queryKey: ["health"],
    queryFn: getHealth,
    retry: 1,
    refetchInterval: 60_000,
  });

  const sehat = !isError && data?.status === "ok";

  return (
    <div
      data-testid="status-sistem"
      data-status={isError ? "error" : (data?.status ?? "memuat")}
      className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-2xl border border-line bg-[#111528] px-4 py-3 text-xs text-navy-400"
    >
      <span className="flex items-center gap-2 font-semibold text-navy-200">
        <span
          aria-hidden="true"
          className={["inline-block h-2 w-2 rounded-full", sehat ? "bg-success" : "bg-warning"].join(" ")}
        />
        Status layanan
      </span>
      <span>API: {isError ? "terputus" : "terhubung"}</span>
      <span data-testid="status-database">
        Database: {isError ? "tidak diketahui" : data?.database === "connected" ? "terhubung" : "terputus"}
      </span>
      <span>Latensi: {data?.databaseLatencyMs == null ? "—" : `${data.databaseLatencyMs} ms`}</span>
      <span>Lingkungan: {data?.environment ?? "—"}</span>
    </div>
  );
}

export function HomePage() {
  const { data: gameData, isPending: gamePending } = useGames({ limit: 5 });
  const { data: artikelData } = useArticles({ limit: 3 });
  const { data: turnamenData } = useUpcomingTournaments(2);

  const games = gameData?.items ?? [];
  const artikel = artikelData?.items ?? [];
  const turnamen = turnamenData?.items ?? [];

  const [slide, setSlide] = useState(0);

  useEffect(() => {
    if (games.length > 0 && slide >= games.length) setSlide(0);
  }, [games.length, slide]);

  const heroGame = games[slide] ?? games[0];

  return (
    <div className="playora-container py-5 sm:py-6">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,2.2fr)_minmax(300px,0.95fr)]">
        <div className="min-w-0">
          <Hero game={heroGame} indeks={slide} total={Math.min(games.length, 5)} onPindah={setSlide} />

          <div className="mb-4 mt-7 flex items-center justify-between px-1">
            <h2 className="pl-section-title">🎮 Game populer</h2>
            <Link to="/games" className="pl-link">
              Lihat semua →
            </Link>
          </div>

          {gamePending ? (
            <GameSkeletonGrid jumlah={5} />
          ) : games.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-line bg-[#111528] px-5 py-10 text-center text-sm text-navy-400">
              Belum ada game yang dipublikasikan.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5" data-testid="grid-game-populer">
              {games.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          )}

          <section className="mt-6 rounded-[var(--radius-card)] border border-line bg-gradient-to-br from-[#171a34] to-[#111528] p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="pl-section-title">📰 Berita terbaru</h2>
              <Link to="/news" className="pl-link">
                Lihat semua →
              </Link>
            </div>

            <ul className="mt-4 grid gap-3 sm:grid-cols-3">
              {artikel.map((item) => (
                <li key={item.id}>
                  <Link
                    to={articlePath(item.category, item.slug)}
                    className="flex h-full gap-3 rounded-xl border border-line bg-[#1a1d38] p-2.5 transition-colors hover:border-[#7845e9]"
                  >
                    <span className="flex h-16 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#262246] text-[10px] font-bold uppercase text-navy-300">
                      {item.thumbnailUrl ? (
                        <img src={item.thumbnailUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
                      ) : (
                        LABEL_KATEGORI[item.category] ?? item.category
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="line-clamp-2 text-[13px] font-semibold leading-snug text-white">
                        {item.title}
                      </span>
                      <span className="mt-1 block text-[11px] text-navy-400">
                        {formatTanggalSingkat(item.publishedAt)}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
              {artikel.length === 0 ? (
                <li className="text-sm text-navy-400">Belum ada berita.</li>
              ) : null}
            </ul>
          </section>
        </div>

        <aside className="flex min-w-0 flex-col gap-4">
          <section className="rounded-[var(--radius-card)] border border-line bg-gradient-to-br from-[#171a34] to-[#111528] p-4" data-testid="turnamen-mendatang">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-base font-bold text-white">🏆 Turnamen mendatang</h2>
              <Link to="/tournaments" className="pl-link">
                Lihat semua →
              </Link>
            </div>

            {turnamen.length === 0 ? (
              <p className="rounded-xl border border-dashed border-line px-3 py-6 text-center text-xs text-navy-400">
                Belum ada turnamen mendatang.
              </p>
            ) : (
              <ul className="space-y-2.5">
                {turnamen.map((item) => (
                  <li
                    key={item.id}
                    className="grid grid-cols-[92px_1fr] items-center gap-3 rounded-xl bg-[#1a1d38] p-2.5"
                  >
                    <span className="flex h-20 w-full items-center justify-center overflow-hidden rounded-lg bg-[#262246] text-[10px] font-bold uppercase text-navy-300">
                      {item.game.title}
                    </span>

                    <div className="min-w-0">
                      <Link to={`/tournaments/${item.slug}`} className="line-clamp-2 text-sm font-semibold leading-snug text-white hover:text-[#c9b8ff]">
                        {item.title}
                      </Link>
                      <p className="mt-1 text-[11px] text-navy-400">
                        {formatRentangTanggal(item.startDate, item.endDate)}
                      </p>
                      {item.prizePool ? (
                        <p className="mt-0.5 text-sm font-extrabold text-gold">{item.prizePool}</p>
                      ) : null}
                      <Link to={`/tournaments/${item.slug}`} className="pl-btn mt-2 w-full !px-2 !py-1.5 !text-[11px]">
                        Lihat detail
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-[var(--radius-card)] border border-line bg-gradient-to-br from-[#171a34] to-[#111528] p-4">
            <h2 className="mb-3 text-base font-bold text-white">📖 Panduan pilihan</h2>
            <ul className="space-y-2">
              {artikel.slice(0, 3).map((item) => (
                <li key={item.id} className="border-b border-line/60 pb-2 last:border-0 last:pb-0">
                  <Link to={articlePath(item.category, item.slug)} className="text-[13px] font-medium text-navy-200 hover:text-white">
                    {item.title}
                  </Link>
                  <p className="text-[11px] text-navy-400">{formatTanggalSingkat(item.publishedAt)}</p>
                </li>
              ))}
              {artikel.length === 0 ? <li className="text-xs text-navy-400">Belum ada panduan.</li> : null}
            </ul>
          </section>

          <section
            className="relative overflow-hidden rounded-[var(--radius-card)] border border-[#4e2bb0] p-5"
            style={{
              backgroundImage:
                "linear-gradient(90deg, rgba(43,20,122,.92), rgba(82,31,175,.62)), radial-gradient(circle at 80% 20%, #7c3aed55, transparent 60%)",
            }}
          >
            <p className="text-3xl">🚀</p>
            <h2 className="mt-2 text-base font-bold text-white">Siap untuk petualangan berikutnya?</h2>
            <p className="mt-1 text-[11px] leading-relaxed text-[#ded9ff]">
              Bergabunglah dengan PLAYORA dan simpan favorit, ikuti turnamen, serta kelola pengajuan.
            </p>
            <Link to="/register" className="pl-btn mt-3 !px-3 !py-2 !text-xs">
              Daftar sekarang →
            </Link>
          </section>
        </aside>
      </div>

      <StatusSistem />
    </div>
  );
}
