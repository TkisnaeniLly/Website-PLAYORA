import { Link, useSearchParams } from "react-router-dom";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { useMySubmissions } from "@/hooks/useSubmissions";
import { extractApiError } from "@/lib/api";
import {
  LABEL_STATUS_PENGAJUAN,
  URUTAN_STATUS_PENGAJUAN,
  WARNA_STATUS_PENGAJUAN,
  dapatDiajukanUlang,
} from "@/lib/submissions";
import { formatRentangTanggal } from "@/lib/tournaments";
import type { SubmissionStatus } from "@/types/submissions";

function totalHalaman(total: number, limit: number): number {
  return Math.max(1, Math.ceil(total / Math.max(1, limit)));
}

export function MySubmissionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const statusMentah = searchParams.get("status") ?? "";
  const status = (URUTAN_STATUS_PENGAJUAN as readonly string[]).includes(statusMentah)
    ? (statusMentah as SubmissionStatus)
    : undefined;

  const pageMentah = Number.parseInt(searchParams.get("page") ?? "1", 10);
  const page = Number.isFinite(pageMentah) && pageMentah > 0 ? pageMentah : 1;

  const daftar = useMySubmissions({ status, page, limit: 12 });

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

  return (
    <section className="playora-container py-6 sm:py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="pl-title">
            Pengajuan saya
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Pantau status pengajuan turnamen Anda dan perbaiki bila diminta revisi.
          </p>
        </div>

        <Link
          to="/tournaments/submit"
          className="rounded-[var(--radius-control)] bg-[#7138F5] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#4B1DB8]"
        >
          Ajukan turnamen
        </Link>
      </div>

      <div className="mt-6 max-w-xs">
        <label htmlFor="filter-status-pengajuan" className="mb-1.5 block text-sm font-medium text-navy-800">
          Status
        </label>
        <select
          id="filter-status-pengajuan"
          data-testid="filter-status-pengajuan"
          value={status ?? ""}
          onChange={(e) => ubahStatus(e.target.value)}
          className="w-full rounded-[var(--radius-control)] border border-line bg-white px-3 py-2.5 text-sm"
        >
          <option value="">Semua status</option>
          {URUTAN_STATUS_PENGAJUAN.map((nilai) => (
            <option key={nilai} value={nilai}>
              {LABEL_STATUS_PENGAJUAN[nilai]}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6">
        {daftar.isPending ? (
          <div data-testid="loading-state" className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-[var(--radius-card)] bg-navy-100" />
            ))}
          </div>
        ) : daftar.isError ? (
          <ErrorState
            pesan={extractApiError(daftar.error).message}
            onRetry={() => void daftar.refetch()}
          />
        ) : (daftar.data?.items.length ?? 0) === 0 ? (
          <EmptyState
            judul="Belum ada pengajuan"
            deskripsi="Ajukan turnamen pertama Anda untuk mulai tampil di direktori."
            aksi={undefined}
          />
        ) : (
          <ul data-testid="submissions-list" className="space-y-3">
            {(daftar.data?.items ?? []).map((item) => (
              <li key={item.id}>
                <Link
                  to={`/tournaments/submissions/${item.id}`}
                  className="block rounded-[var(--radius-card)] border border-line bg-white p-5 transition-shadow hover:shadow-md"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span
                      data-testid="status-pengajuan"
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${WARNA_STATUS_PENGAJUAN[item.status]}`}
                    >
                      {LABEL_STATUS_PENGAJUAN[item.status]}
                    </span>
                    <span className="text-xs text-muted">{item.game.title}</span>
                  </div>

                  <h2 className="mt-2 text-base font-semibold text-navy-800">{item.title}</h2>

                  <p className="mt-1 text-xs text-muted">
                    {formatRentangTanggal(item.startDate, item.endDate)}
                    {item.teamCount ? ` · ${item.teamCount} tim` : ""}
                  </p>

                  {item.status === "NEEDS_REVISION" && item.adminNote ? (
                    <p className="mt-2 rounded-[var(--radius-control)] bg-warning/10 px-3 py-2 text-xs text-navy-800">
                      Catatan admin: {item.adminNote}
                    </p>
                  ) : null}

                  {dapatDiajukanUlang(item.status) ? (
                    <p className="mt-2 text-xs font-semibold text-navy-700">
                      Perlu tindakan: buka detail untuk memperbaiki.
                    </p>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Pagination
        page={page}
        totalPages={totalHalaman(daftar.data?.total ?? 0, daftar.data?.limit ?? 12)}
        onChange={ubahHalaman}
      />
    </section>
  );
}
