import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { Pagination } from "@/components/ui/Pagination";
import {
  useAdminSubmissions,
  useDecideSubmission,
  useSubmissionDetail,
} from "@/hooks/useSubmissions";
import { extractApiError } from "@/lib/api";
import {
  LABEL_STATUS_PENGAJUAN,
  URUTAN_STATUS_PENGAJUAN,
  WARNA_STATUS_PENGAJUAN,
} from "@/lib/submissions";
import { formatRentangTanggal } from "@/lib/tournaments";
import type { SubmissionStatus } from "@/types/submissions";

function DetailPengajuan({ id }: { id: string }) {
  const detail = useSubmissionDetail(id);

  if (detail.isPending) {
    return (
      <div
        data-testid="detail-pengajuan"
        className="mt-3 rounded-[var(--radius-control)] border border-[#26264F] bg-[#11132B] p-3 text-xs text-[#9d9ac2]"
      >
        Memuat detail pengajuan\u2026
      </div>
    );
  }

  if (detail.isError || !detail.data) {
    return (
      <p
        data-testid="detail-pengajuan"
        className="mt-3 rounded-[var(--radius-control)] border border-[#ff647c]/30 bg-[#ff647c]/5 p-3 text-xs text-[#ff647c]"
      >
        Detail pengajuan tidak dapat dimuat.
      </p>
    );
  }

  const data = detail.data;
  const baris = [
    { label: "Penyelenggara", nilai: data.organizerName },
    { label: "Format", nilai: data.format ?? "\u2014" },
    { label: "Jumlah tim", nilai: data.teamCount !== null ? `${data.teamCount} tim` : "\u2014" },
    { label: "Hadiah", nilai: data.prizePool ?? "\u2014" },
    { label: "Metode pendaftaran", nilai: data.registrationMethod ?? "\u2014" },
    {
      label: "Batas pendaftaran",
      nilai: data.registrationDeadline
        ? formatRentangTanggal(data.registrationDeadline, data.registrationDeadline)
        : "\u2014",
    },
    { label: "Tautan pendaftaran", nilai: data.registrationUrl ?? "\u2014" },
    { label: "Kontak", nilai: data.contact ?? "\u2014" },
  ];

  return (
    <div
      data-testid="detail-pengajuan"
      className="mt-3 space-y-3 rounded-[var(--radius-control)] border border-[#26264F] bg-[#11132B] p-3"
    >
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wide text-[#8f88b8]">Deskripsi</p>
        <p className="mt-1 whitespace-pre-line text-xs leading-relaxed text-[#cbc5e6]">
          {data.description}
        </p>
      </div>

      <dl className="grid gap-2 sm:grid-cols-2">
        {baris.map((item) => (
          <div key={item.label}>
            <dt className="text-[10px] uppercase tracking-wide text-[#8f88b8]">{item.label}</dt>
            <dd className="mt-0.5 break-words text-xs text-white">{item.nilai}</dd>
          </div>
        ))}
      </dl>

      {data.requirements ? (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-[#8f88b8]">
            Persyaratan
          </p>
          <p className="mt-1 whitespace-pre-line text-xs leading-relaxed text-[#cbc5e6]">
            {data.requirements}
          </p>
        </div>
      ) : null}
    </div>
  );
}

function PanelKeputusan({ id, onSelesai }: { id: string; onSelesai: () => void }) {
  const putuskan = useDecideSubmission();
  const [catatan, setCatatan] = useState("");
  const [galatLokal, setGalatLokal] = useState<string | null>(null);

  const galat = putuskan.error ? extractApiError(putuskan.error) : null;

  function kirim(decision: "APPROVED" | "REJECTED" | "NEEDS_REVISION") {
    if (decision !== "APPROVED" && catatan.trim().length === 0) {
      setGalatLokal("Catatan wajib diisi untuk penolakan atau permintaan revisi.");
      return;
    }

    setGalatLokal(null);
    putuskan.mutate(
      { id, decision, note: catatan.trim() || undefined },
      { onSuccess: onSelesai },
    );
  }

  return (
    <div className="mt-3 space-y-2 border-t border-[#26264F] pt-3" data-testid="panel-keputusan">
      <label htmlFor={`catatan-${id}`} className="block text-xs font-medium text-white">
        Catatan admin (wajib untuk tolak/revisi)
      </label>
      <textarea
        id={`catatan-${id}`}
        data-testid="catatan-admin-input"
        rows={2}
        value={catatan}
        onChange={(e) => setCatatan(e.target.value)}
        className="w-full rounded-[var(--radius-control)] border border-[#26264F] bg-[#161839] px-3 py-2 text-sm"
        placeholder="Alasan keputusan atau bagian yang perlu diperbaiki"
      />

      {galatLokal || galat ? (
        <p className="text-xs font-medium text-danger" role="alert" data-testid="galat-keputusan">
          {galatLokal ?? galat?.message}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={putuskan.isPending}
          onClick={() => kirim("APPROVED")}
          className="rounded-[var(--radius-control)] bg-success px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
        >
          Setujui
        </button>
        <button
          type="button"
          disabled={putuskan.isPending}
          onClick={() => kirim("NEEDS_REVISION")}
          className="rounded-[var(--radius-control)] bg-warning px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
        >
          Minta revisi
        </button>
        <button
          type="button"
          disabled={putuskan.isPending}
          onClick={() => kirim("REJECTED")}
          className="rounded-[var(--radius-control)] bg-danger px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
        >
          Tolak
        </button>
      </div>
    </div>
  );
}

export function AdminSubmissionsPage({ tanpaHeader = false }: { tanpaHeader?: boolean } = {}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [terbuka, setTerbuka] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);

  const statusMentah = searchParams.get("status") ?? "";
  const status = (URUTAN_STATUS_PENGAJUAN as readonly string[]).includes(statusMentah)
    ? (statusMentah as SubmissionStatus)
    : undefined;

  const pageMentah = Number.parseInt(searchParams.get("page") ?? "1", 10);
  const page = Number.isFinite(pageMentah) && pageMentah > 0 ? pageMentah : 1;

  const daftar = useAdminSubmissions({ status, page, limit: 12 });

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

  const totalHalaman = Math.max(
    1,
    Math.ceil((daftar.data?.total ?? 0) / Math.max(1, daftar.data?.limit ?? 12)),
  );

  return (
    <section className="space-y-5" data-testid="panel-pengajuan-turnamen">
      {tanpaHeader ? null : (
        <header>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            Pemeriksaan pengajuan
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[#9d9ac2]">
            Tinjau pengajuan turnamen, lalu setujui, minta revisi, atau tolak disertai
            catatan.
          </p>
        </header>
      )}

      <div className="mt-6 max-w-xs">
        <label htmlFor="filter-status-admin" className="mb-1.5 block text-sm font-medium text-white">
          Status
        </label>
        <select
          id="filter-status-admin"
          data-testid="filter-status-admin"
          value={status ?? ""}
          onChange={(e) => ubahStatus(e.target.value)}
          className="w-full rounded-[var(--radius-control)] border border-[#26264F] bg-[#161839] px-3 py-2.5 text-sm"
        >
          <option value="">Semua status</option>
          {URUTAN_STATUS_PENGAJUAN.map((nilai) => (
            <option key={nilai} value={nilai}>
              {LABEL_STATUS_PENGAJUAN[nilai]}
            </option>
          ))}
        </select>
      </div>

      <p className="mt-4 text-sm text-[#9d9ac2]" data-testid="jumlah-pengajuan">
        {daftar.data ? `${daftar.data.total} pengajuan` : "Memuat…"}
      </p>

      <div className="mt-4">
        {daftar.isPending ? (
          <div data-testid="loading-state" className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-[var(--radius-card)] bg-[#1d1b36]" />
            ))}
          </div>
        ) : daftar.isError ? (
          <ErrorState
            pesan={extractApiError(daftar.error).message}
            onRetry={() => void daftar.refetch()}
          />
        ) : (daftar.data?.items.length ?? 0) === 0 ? (
          <EmptyState
            judul="Tidak ada pengajuan"
            deskripsi={status ? "Tidak ada pengajuan dengan status ini." : "Belum ada pengajuan masuk."}
            aksi={status ? { label: "Hapus filter", onClick: () => ubahStatus("") } : undefined}
          />
        ) : (
          <ul data-testid="admin-submissions-list" className="space-y-3">
            {(daftar.data?.items ?? []).map((item) => {
              const bisaDiputuskan =
                item.status === "PENDING" || item.status === "NEEDS_REVISION";

              return (
                <li
                  key={item.id}
                  className="rounded-[var(--radius-card)] border border-[#26264F] bg-[#161839] p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span
                      data-testid="status-pengajuan"
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${WARNA_STATUS_PENGAJUAN[item.status]}`}
                    >
                      {LABEL_STATUS_PENGAJUAN[item.status]}
                    </span>
                    <span className="text-xs text-[#9d9ac2]">
                      {item.game.title} · {item.teamCount ?? "—"} tim
                    </span>
                  </div>

                  <h2 className="mt-2 text-base font-semibold text-white">{item.title}</h2>

                  <p className="mt-1 text-xs text-[#9d9ac2]">
                    {item.organizerName} · {formatRentangTanggal(item.startDate, item.endDate)}
                  </p>
                  <p className="mt-1 text-xs text-[#9d9ac2]">
                    Pengaju: {item.submitter.name} ({item.submitter.email})
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      data-testid="lihat-detail-pengajuan"
                      onClick={() => setDetailId(detailId === item.id ? null : item.id)}
                      className="rounded-[var(--radius-control)] border border-[#26264F] px-3 py-2 text-xs font-medium text-white"
                    >
                      {detailId === item.id ? "Tutup detail" : "Lihat detail"}
                    </button>

                    {bisaDiputuskan ? (
                      <button
                        type="button"
                        data-testid="buka-keputusan"
                        onClick={() => setTerbuka(terbuka === item.id ? null : item.id)}
                        className="rounded-[var(--radius-control)] bg-[#7138F5] px-3 py-2 text-xs font-semibold text-white"
                      >
                        {terbuka === item.id ? "Tutup" : "Beri keputusan"}
                      </button>
                    ) : null}
                  </div>

                  {detailId === item.id ? <DetailPengajuan id={item.id} /> : null}

                  {terbuka === item.id && bisaDiputuskan ? (
                    <PanelKeputusan
                      id={item.id}
                      onSelesai={() => {
                        setTerbuka(null);
                        void daftar.refetch();
                      }}
                    />
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <Pagination page={page} totalPages={totalHalaman} onChange={ubahHalaman} />
    </section>
  );
}
