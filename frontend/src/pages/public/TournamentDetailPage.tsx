import axios from "axios";
import { Link, useParams } from "react-router-dom";
import { useTournamentDetail } from "@/hooks/useTournaments";
import { extractApiError } from "@/lib/api";
import {
  LABEL_STATUS,
  WARNA_STATUS,
  formatRentangTanggal,
  formatTanggal,
  labelPeringkat,
} from "@/lib/tournaments";

export function TournamentDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const detail = useTournamentDetail(slug);

  const tidakDitemukan =
    axios.isAxiosError(detail.error) && detail.error.response?.status === 404;

  if (detail.isPending) {
    return (
      <section className="playora-container py-10" data-testid="loading-state">
        <div className="h-3 w-24 animate-pulse rounded bg-navy-100" />
        <div className="mt-3 h-8 w-2/3 animate-pulse rounded bg-navy-100" />
        <div className="mt-6 h-48 w-full animate-pulse rounded-[var(--radius-card)] bg-navy-100" />
      </section>
    );
  }

  if (tidakDitemukan) {
    return (
      <section className="playora-container py-20 text-center">
        <h1 className="text-2xl font-bold text-navy-800">Turnamen tidak ditemukan</h1>
        <p className="mt-2 text-sm text-muted">
          Turnamen yang Anda cari tidak tersedia atau belum dipublikasikan.
        </p>
        <Link
          to="/tournaments"
          className="mt-6 inline-block rounded-[var(--radius-control)] bg-[#7138F5] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#4B1DB8]"
        >
          Kembali ke daftar turnamen
        </Link>
      </section>
    );
  }

  if (detail.isError || !detail.data) {
    return (
      <section className="playora-container py-20 text-center">
        <h1 className="text-xl font-bold text-danger">Gagal memuat turnamen</h1>
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

  const turnamen = detail.data;

  return (
    <article data-testid="tournament-detail">
      <header
        className="border-b border-line text-white"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 20% -40%, #2b1a5e 0, #131430 45%, #0b0b18 100%)",
        }}
      >
        <div className="playora-container py-8 sm:py-10">
          <Link
            to="/tournaments"
            className="text-xs font-semibold uppercase tracking-widest text-accent-pink"
          >
            ← Turnamen
          </Link>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span
              data-testid="status-turnamen"
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${WARNA_STATUS[turnamen.status]}`}
            >
              {LABEL_STATUS[turnamen.status]}
            </span>
            <Link
              to={`/games/${turnamen.game.slug}`}
              className="text-xs font-medium text-navy-200 hover:text-white"
            >
              {turnamen.game.title}
            </Link>
          </div>

          <h1 className="mt-3 max-w-3xl text-2xl font-extrabold leading-tight sm:text-4xl">
            {turnamen.title}
          </h1>

          <p className="mt-3 text-sm text-navy-200">
            Diselenggarakan oleh{" "}
            <span className="font-semibold text-white">{turnamen.organizerName}</span>
          </p>
        </div>
      </header>

      <div className="playora-container grid gap-8 py-10 lg:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          <section>
            <h2 className="text-lg font-bold text-navy-800">Tentang turnamen</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink">
              {turnamen.description}
            </p>
          </section>

          {turnamen.requirements ? (
            <section>
              <h2 className="text-lg font-bold text-navy-800">Persyaratan</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink">
                {turnamen.requirements}
              </p>
            </section>
          ) : null}

          <section data-testid="hasil-turnamen">
            <h2 className="text-lg font-bold text-navy-800">Hasil turnamen</h2>

            {turnamen.results.length === 0 ? (
              <p className="mt-3 text-sm text-muted">
                Hasil pertandingan belum tersedia.
              </p>
            ) : (
              <ol className="mt-3 space-y-2">
                {turnamen.results.map((hasil) => (
                  <li
                    key={hasil.id}
                    className="flex items-start justify-between gap-3 rounded-[var(--radius-card)] border border-line bg-white px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-navy-800">
                        {hasil.teamOrPlayer}
                      </p>
                      {hasil.note ? (
                        <p className="mt-0.5 text-xs text-muted">{hasil.note}</p>
                      ) : null}
                    </div>
                    <span className="shrink-0 rounded-full bg-navy-50 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-navy-700">
                      {labelPeringkat(hasil.position)}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          <div className="rounded-[var(--radius-card)] border border-line bg-white p-5">
            <h2 className="text-sm font-bold uppercase tracking-wide text-muted">
              Informasi
            </h2>

            <dl className="mt-3 space-y-3 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted">Jadwal</dt>
                <dd className="mt-0.5 font-medium text-ink">
                  {formatRentangTanggal(turnamen.startDate, turnamen.endDate)}
                </dd>
              </div>

              {turnamen.registrationDeadline ? (
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted">
                    Batas pendaftaran
                  </dt>
                  <dd className="mt-0.5 font-medium text-ink">
                    {formatTanggal(turnamen.registrationDeadline)}
                  </dd>
                </div>
              ) : null}

              {turnamen.format ? (
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted">Format</dt>
                  <dd className="mt-0.5 font-medium text-ink">{turnamen.format}</dd>
                </div>
              ) : null}

              {turnamen.prizePool ? (
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted">Hadiah</dt>
                  <dd className="mt-0.5 font-medium text-ink">{turnamen.prizePool}</dd>
                </div>
              ) : null}

              <div>
                <dt className="text-xs uppercase tracking-wide text-muted">Game</dt>
                <dd className="mt-0.5">
                  <Link
                    to={`/games/${turnamen.game.slug}`}
                    className="font-medium text-navy-700 hover:underline"
                  >
                    {turnamen.game.title}
                  </Link>
                </dd>
              </div>
            </dl>

            {turnamen.registrationUrl ? (
              <a
                href={turnamen.registrationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 block rounded-[var(--radius-control)] bg-[#7138F5] px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-[#4B1DB8]"
              >
                Buka tautan pendaftaran
              </a>
            ) : null}

            {turnamen.canManage ? (
              <div className="mt-4 grid gap-2">
                <Link to={`/tournaments/${turnamen.id}/results/manage`} className="pl-btn text-center">
                  Kelola hasil turnamen
                </Link>
                <Link to={`/tournaments/${turnamen.id}/change-requests`} className="pl-btn-outline text-center">
                  Ajukan perubahan informasi
                </Link>
              </div>
            ) : null}

            {turnamen.contact ? (
              <p className="mt-3 break-words text-xs text-muted">
                Kontak: {turnamen.contact}
              </p>
            ) : null}
          </div>

          <p className="rounded-[var(--radius-card)] bg-navy-50 p-4 text-xs leading-relaxed text-navy-700">
            PLAYORA hanya menampilkan direktori informasi. Pendaftaran peserta dan
            pembayaran dikelola langsung oleh penyelenggara.
          </p>
        </aside>
      </div>
    </article>
  );
}
