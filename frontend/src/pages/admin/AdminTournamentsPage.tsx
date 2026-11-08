import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { Pagination } from "@/components/ui/Pagination";
import {
  useAdminTournaments,
  useReviewResults,
  useSetPublished,
} from "@/hooks/useManagement";
import { extractApiError } from "@/lib/api";
import { formatRentangTanggal } from "@/lib/tournaments";
import { AdminSubmissionsPage } from "./AdminSubmissionsPage";
import { AdminChangeRequestsPage } from "./AdminChangeRequestsPage";

const OPSI_FILTER = [
  { value: "", label: "Semua turnamen" },
  { value: "published", label: "Terpublikasi" },
  { value: "unpublished", label: "Belum terpublikasi" },
  { value: "awaiting_results", label: "Menunggu tinjauan hasil" },
] as const;

function PanelTinjau({ id, onSelesai }: { id: string; onSelesai: () => void }) {
  const tinjau = useReviewResults();
  const [catatan, setCatatan] = useState("");
  const [galatLokal, setGalatLokal] = useState<string | null>(null);
  const galat = tinjau.error ? extractApiError(tinjau.error) : null;

  function kirim(decision: "APPROVED" | "REJECTED") {
    if (decision === "REJECTED" && catatan.trim().length === 0) {
      setGalatLokal("Catatan wajib diisi saat menolak hasil.");
      return;
    }

    setGalatLokal(null);
    tinjau.mutate(
      { id, decision, note: catatan.trim() || undefined },
      { onSuccess: onSelesai },
    );
  }

  return (
    <div className="mt-3 space-y-2 border-t border-[#26264F] pt-3" data-testid="panel-tinjau">
      <label htmlFor={`catatan-hasil-${id}`} className="block text-xs font-medium text-white">
        Catatan peninjauan
      </label>
      <textarea
        id={`catatan-hasil-${id}`}
        data-testid="catatan-hasil-input"
        rows={2}
        value={catatan}
        onChange={(e) => setCatatan(e.target.value)}
        className="w-full rounded-[var(--radius-control)] border border-[#26264F] bg-[#161839] px-3 py-2 text-sm"
        placeholder="Catatan untuk penyelenggara (wajib bila menolak)"
      />

      {galatLokal || galat ? (
        <p className="text-xs font-medium text-danger" role="alert">
          {galatLokal ?? galat?.message}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={tinjau.isPending}
          onClick={() => kirim("APPROVED")}
          className="rounded-[var(--radius-control)] bg-success px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
        >
          Setujui hasil
        </button>
        <button
          type="button"
          disabled={tinjau.isPending}
          onClick={() => kirim("REJECTED")}
          className="rounded-[var(--radius-control)] bg-danger px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
        >
          Tolak hasil
        </button>
      </div>
    </div>
  );
}

const TAB = [
  { kunci: "turnamen", label: "Turnamen" },
  { kunci: "pengajuan", label: "Pengajuan" },
  { kunci: "perubahan", label: "Perubahan" },
] as const;

type TabPengelolaan = (typeof TAB)[number]["kunci"];

export function AdminTournamentsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tinjauId, setTinjauId] = useState<string | null>(null);

  const tabMentah = searchParams.get("tab") ?? "turnamen";
  const tab: TabPengelolaan = TAB.some((item) => item.kunci === tabMentah)
    ? (tabMentah as TabPengelolaan)
    : "turnamen";

  function ubahTab(nilai: TabPengelolaan) {
    setSearchParams(
      (sebelumnya) => {
        const berikut = new URLSearchParams(sebelumnya);
        if (nilai === "turnamen") berikut.delete("tab");
        else berikut.set("tab", nilai);
        berikut.delete("page");
        return berikut;
      },
      { replace: true },
    );
  }

  const statusMentah = searchParams.get("status") ?? "";
  const status = (OPSI_FILTER as readonly { value: string }[]).some((o) => o.value === statusMentah)
    ? statusMentah
    : "";

  const pageMentah = Number.parseInt(searchParams.get("page") ?? "1", 10);
  const page = Number.isFinite(pageMentah) && pageMentah > 0 ? pageMentah : 1;

  const daftar = useAdminTournaments({
    status: status as "" | "published" | "unpublished" | "awaiting_results",
    page,
    limit: 12,
  });
  const publikasi = useSetPublished();

  function ubahFilter(nilai: string) {
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

  const galatPublikasi = publikasi.error ? extractApiError(publikasi.error) : null;

  return (
    <section className="space-y-5" data-testid="halaman-admin-turnamen">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight text-white">
          Kelola turnamen
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[#9d9ac2]">
          Kelola turnamen, periksa pengajuan pengguna, dan setujui pembaruan informasi
          yang diajukan penyelenggara.
        </p>
      </header>

      <div
        role="tablist"
        aria-label="Tab pengelolaan turnamen"
        className="flex flex-wrap gap-2 border-b border-[#26264F] pb-3"
      >
        {TAB.map((item) => {
          const aktif = tab === item.kunci;
          return (
            <button
              key={item.kunci}
              type="button"
              role="tab"
              aria-selected={aktif}
              data-testid={`tab-${item.kunci}`}
              onClick={() => ubahTab(item.kunci)}
              className={[
                "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
                aktif
                  ? "bg-gradient-to-r from-[#7135f5] to-[#8b35f4] text-white"
                  : "border border-[#26264F] bg-[#1d1b36] text-navy-300 hover:text-white",
              ].join(" ")}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {tab === "pengajuan" ? (
        <AdminSubmissionsPage tanpaHeader />
      ) : tab === "perubahan" ? (
        <AdminChangeRequestsPage tanpaHeader />
      ) : (
        <>
      <div className="max-w-xs">
        <label htmlFor="filter-admin-turnamen" className="mb-1.5 block text-sm font-medium text-white">
          Filter
        </label>
        <select
          id="filter-admin-turnamen"
          data-testid="filter-admin-turnamen"
          value={status}
          onChange={(e) => ubahFilter(e.target.value)}
          className="w-full rounded-[var(--radius-control)] border border-[#26264F] bg-[#161839] px-3 py-2.5 text-sm"
        >
          {OPSI_FILTER.map((opsi) => (
            <option key={opsi.value} value={opsi.value}>
              {opsi.label}
            </option>
          ))}
        </select>
      </div>

      {galatPublikasi ? (
        <p role="alert" className="mt-4 rounded-[var(--radius-control)] border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger">
          {galatPublikasi.message}
        </p>
      ) : null}

      <p className="mt-4 text-sm text-[#9d9ac2]" data-testid="jumlah-turnamen">
        {daftar.data ? `${daftar.data.total} turnamen` : "Memuat…"}
      </p>

      <div className="mt-4">
        {daftar.isPending ? (
          <div data-testid="loading-state" className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-[var(--radius-card)] bg-[#1d1b36]" />
            ))}
          </div>
        ) : daftar.isError ? (
          <ErrorState
            pesan={extractApiError(daftar.error).message}
            onRetry={() => void daftar.refetch()}
          />
        ) : (daftar.data?.items.length ?? 0) === 0 ? (
          <EmptyState
            judul="Tidak ada turnamen"
            deskripsi="Belum ada turnamen yang cocok dengan filter ini."
            aksi={{ label: "Hapus filter", onClick: () => ubahFilter("") }}
          />
        ) : (
          <ul data-testid="admin-tournaments-list" className="space-y-3">
            {(daftar.data?.items ?? []).map((item) => (
              <li key={item.id} className="rounded-[var(--radius-card)] border border-[#26264F] bg-[#161839] p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span
                    data-testid="status-publikasi"
                    className={[
                      "rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide",
                      item.isPublished
                        ? "bg-success/15 text-success"
                        : "bg-[#1d1b36] text-[#cbc5e6]",
                    ].join(" ")}
                  >
                    {item.isPublished ? "Terpublikasi" : "Belum terbit"}
                  </span>

                  <span className="text-xs text-[#9d9ac2]">{item.game.title}</span>
                </div>

                <h2 className="mt-2 text-base font-semibold text-white">{item.title}</h2>
                <p className="mt-1 text-xs text-[#9d9ac2]">
                  {item.organizerName} · {formatRentangTanggal(item.startDate, item.endDate)}
                </p>
                <p className="mt-1 text-xs text-[#9d9ac2]">
                  Penyelenggara akun: {item.manager?.name ?? "—"}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                  <span data-testid="ringkasan-hasil" className="rounded-full bg-navy-50 px-2.5 py-1 font-medium text-[#cbc5e6]">
                    {item.totalResults} hasil · {item.pendingResults} menunggu ·{" "}
                    {item.approvedResults} disetujui
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    to={`/admin/tournaments/${item.id}/results`}
                    data-testid="kelola-hasil"
                    className="rounded-[var(--radius-control)] border border-[#26264F] px-3 py-2 text-xs font-medium text-white"
                  >
                    Kelola hasil
                  </Link>

                  <button
                    type="button"
                    data-testid="tombol-publikasi"
                    disabled={publikasi.isPending}
                    onClick={() => publikasi.mutate({ id: item.id, isPublished: !item.isPublished })}
                    className={[
                      "rounded-[var(--radius-control)] px-3 py-2 text-xs font-semibold text-white disabled:opacity-60",
                      item.isPublished ? "bg-navy-600" : "bg-[#7138F5]",
                    ].join(" ")}
                  >
                    {item.isPublished ? "Batalkan publikasi" : "Publikasikan"}
                  </button>

                  {item.pendingResults > 0 ? (
                    <button
                      type="button"
                      data-testid="buka-tinjau"
                      onClick={() => setTinjauId(tinjauId === item.id ? null : item.id)}
                      className="rounded-[var(--radius-control)] bg-warning px-3 py-2 text-xs font-semibold text-white"
                    >
                      {tinjauId === item.id ? "Tutup" : "Tinjau hasil"}
                    </button>
                  ) : null}
                </div>

                {tinjauId === item.id && item.pendingResults > 0 ? (
                  <PanelTinjau
                    id={item.id}
                    onSelesai={() => {
                      setTinjauId(null);
                      void daftar.refetch();
                    }}
                  />
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>

      <Pagination page={page} totalPages={totalHalaman} onChange={ubahHalaman} />
        </>
      )}
    </section>
  );
}
