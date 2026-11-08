import { Link, useSearchParams } from "react-router-dom";
import { TournamentCard } from "@/components/ui/TournamentCard";
import { Pagination } from "@/components/ui/Pagination";
import { ArticleSkeletonList, EmptyState, ErrorState } from "@/components/ui/States";
import { useAuth } from "@/hooks/useAuth";
import { useTournaments } from "@/hooks/useTournaments";
import { extractApiError } from "@/lib/api";
import {
  BATAS_TURNAMEN,
  LABEL_STATUS,
  URUTAN_STATUS,
  hitungTotalHalaman,
} from "@/lib/tournaments";
import type { TournamentStatus } from "@/types/tournaments";

export function TournamentsPage() {
  const { data: pengguna } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const statusMentah = searchParams.get("status") ?? "";
  const status = (URUTAN_STATUS as readonly string[]).includes(statusMentah)
    ? (statusMentah as TournamentStatus)
    : undefined;

  const pageMentah = Number.parseInt(searchParams.get("page") ?? "1", 10);
  const page = Number.isFinite(pageMentah) && pageMentah > 0 ? pageMentah : 1;

  const daftar = useTournaments({
    status,
    page,
    limit: BATAS_TURNAMEN,
  });

  function ubahStatus(nilai: string) {
    setSearchParams(
      (sebelumnya) => {
        const berikut = new URLSearchParams(sebelumnya);
        if (nilai) berikut.set("status", nilai);
        else berikut.delete("status");
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

  const totalHalaman = daftar.data
    ? hitungTotalHalaman(daftar.data.total, daftar.data.limit)
    : 1;

  return (
    <section className="playora-container py-6 sm:py-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="pl-title">Turnamen</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Direktori turnamen game di Indonesia. Pendaftaran peserta dilakukan langsung
            melalui tautan atau kontak penyelenggara.
          </p>
        </div>

        {pengguna ? (
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/tournaments/submissions" data-testid="pengajuan-saya" className="pl-btn-outline text-xs">
              Pengajuan saya
            </Link>
            <Link to="/tournaments/submit" data-testid="ajukan-turnamen" className="pl-btn text-xs">
              + Ajukan turnamen
            </Link>
          </div>
        ) : null}
      </header>

      {pengguna ? null : (
        <div
          data-testid="panel-ajukan-turnamen"
          className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-card)] border border-dashed border-[#7135f5]/45 bg-[#15152a] px-4 py-3"
        >
          <div>
            <p className="text-sm font-semibold text-white">Punya turnamen sendiri?</p>
            <p className="mt-0.5 text-xs text-muted">
              Masuk untuk mengajukan turnamen. Pengajuan akan diperiksa administrator sebelum
              tampil di direktori.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login" data-testid="masuk-untuk-ajukan" className="pl-btn text-xs">
              Masuk
            </Link>
            <Link to="/register" className="pl-btn-outline text-xs">
              Daftar akun
            </Link>
          </div>
        </div>
      )}

      <div className="mt-6 max-w-xs">
        <label
          htmlFor="filter-status"
          className="mb-1.5 block text-sm font-medium text-navy-800"
        >
          Status
        </label>
        <select
          id="filter-status"
          data-testid="filter-status"
          value={status ?? ""}
          onChange={(e) => ubahStatus(e.target.value)}
          className="w-full rounded-[var(--radius-control)] border border-line bg-white px-3 py-2.5 text-sm"
        >
          <option value="">Semua status</option>
          {URUTAN_STATUS.map((nilai) => (
            <option key={nilai} value={nilai}>
              {LABEL_STATUS[nilai]}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted" data-testid="jumlah-hasil">
          {daftar.data
            ? `${daftar.data.total} turnamen ditemukan`
            : "Memuat turnamen…"}
        </p>

        {status ? (
          <button
            type="button"
            onClick={() => ubahStatus("")}
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
            judul="Tidak ada turnamen"
            deskripsi={
              status
                ? `Belum ada turnamen berstatus "${LABEL_STATUS[status]}".`
                : "Belum ada turnamen yang dipublikasikan."
            }
            aksi={
              status ? { label: "Hapus filter", onClick: () => ubahStatus("") } : undefined
            }
          />
        ) : (
          <ul
            data-testid="tournaments-grid"
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {(daftar.data?.items ?? []).map((turnamen) => (
              <li key={turnamen.id}>
                <TournamentCard tournament={turnamen} />
              </li>
            ))}
          </ul>
        )}
      </div>

      <Pagination page={page} totalPages={totalHalaman} onChange={ubahHalaman} />
    </section>
  );
}
