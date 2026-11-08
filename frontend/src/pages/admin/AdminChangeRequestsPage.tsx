import { useState } from "react";
import { Link } from "react-router-dom";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { Pagination } from "@/components/ui/Pagination";
import { useAdminChangeRequests, useDecideChangeRequest } from "@/hooks/useChangeRequests";
import { extractApiError } from "@/lib/api";
import {
  BATAS_PERUBAHAN,
  LABEL_STATUS_PERUBAHAN,
  WARNA_STATUS_PERUBAHAN,
  ringkasPerubahan,
} from "@/lib/change";
import type { ChangeRequestItem, ChangeStatus } from "@/types/change";

export function AdminChangeRequestsPage({ tanpaHeader = false }: { tanpaHeader?: boolean } = {}) {
  const [status, setStatus] = useState<ChangeStatus | "">("PENDING");
  const [page, setPage] = useState(1);
  const [catatan, setCatatan] = useState<Record<string, string>>({});

  const daftar = useAdminChangeRequests({ status, page, limit: BATAS_PERUBAHAN });
  const putuskan = useDecideChangeRequest();

  const items = daftar.data?.items ?? [];
  const totalHalaman = Math.max(1, Math.ceil((daftar.data?.total ?? 0) / BATAS_PERUBAHAN));
  const galat = putuskan.error ? extractApiError(putuskan.error) : null;

  function putuskanItem(item: ChangeRequestItem, decision: "APPROVED" | "REJECTED") {
    const note = catatan[item.id]?.trim() ?? "";

    if (decision === "REJECTED" && note.length === 0) {
      window.alert("Catatan wajib diisi saat menolak permintaan.");
      return;
    }

    if (decision === "APPROVED") {
      const ya = window.confirm(
        `Setujui perubahan untuk "${item.tournament?.title ?? "turnamen ini"}"? Perubahan langsung diterapkan.`,
      );
      if (!ya) return;
    }

    putuskan.mutate({ id: item.id, decision, note: note || undefined });
  }

  return (
    <section className="space-y-5" data-testid="halaman-admin-perubahan">
      {tanpaHeader ? null : (
        <header>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-white">Permintaan perubahan turnamen</h1>
          <p className="mt-2 text-sm text-navy-400">
            Tinjau permintaan perubahan informasi dari pengelola turnamen. Perubahan baru berlaku
            setelah disetujui.
          </p>
        </header>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {(["PENDING", "APPROVED", "REJECTED", ""] as const).map((nilai) => (
          <button
            key={nilai || "semua"}
            type="button"
            onClick={() => {
              setStatus(nilai);
              setPage(1);
            }}
            className={[
              "rounded-full px-3 py-1.5 text-xs font-semibold",
              status === nilai
                ? "bg-gradient-to-r from-[#7135f5] to-[#8b35f4] text-white"
                : "border border-[#26264F] bg-[#1d1b36] text-navy-300 hover:text-white",
            ].join(" ")}
          >
            {nilai ? LABEL_STATUS_PERUBAHAN[nilai] : "Semua"}
          </button>
        ))}
      </div>

      {galat ? (
        <p role="alert" className="mt-4 text-sm font-medium text-danger">
          {galat.message}
        </p>
      ) : null}

      <div className="mt-4 space-y-3">
        {daftar.isPending ? (
          <div data-testid="loading-state" className="space-y-3">
            <div className="h-32 animate-pulse rounded-[var(--radius-card)] bg-[#1d1b36]" />
          </div>
        ) : daftar.isError ? (
          <ErrorState
            pesan={daftar.error ? extractApiError(daftar.error).message : "Terjadi kesalahan."}
            onRetry={() => void daftar.refetch()}
          />
        ) : items.length === 0 ? (
          <EmptyState judul="Tidak ada permintaan" deskripsi="Belum ada permintaan pada filter ini." />
        ) : (
          items.map((item) => (
            <article
              key={item.id}
              data-testid="kartu-perubahan"
              className="rounded-[var(--radius-card)] border border-[#26264F] bg-gradient-to-br from-[#171a34] to-[#111528] p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <Link
                    to="/admin/tournaments"
                    className="text-sm font-bold text-white hover:text-[#c9b8ff]"
                  >
                    {item.tournament?.title ?? "Turnamen"}
                  </Link>
                  <p className="mt-1 text-[11px] text-navy-400">
                    Diminta oleh {item.requester?.name ?? "—"} ·{" "}
                    {new Date(item.createdAt).toLocaleString("id-ID")}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${WARNA_STATUS_PERUBAHAN[item.status]}`}
                >
                  {LABEL_STATUS_PERUBAHAN[item.status]}
                </span>
              </div>

              <p className="mt-3 rounded-xl border border-[#26264F] bg-[#0f1225] p-3 text-xs text-navy-200">
                {item.message}
              </p>

              <ul className="mt-3 space-y-1 text-xs text-navy-300">
                {ringkasPerubahan(item.payload as Record<string, unknown>).map((baris) => (
                  <li key={baris} className="flex gap-1.5">
                    <span className="text-accent-pink">•</span>
                    {baris}
                  </li>
                ))}
              </ul>

              {item.status === "PENDING" ? (
                <div className="mt-3 space-y-2">
                  <input
                    value={catatan[item.id] ?? ""}
                    onChange={(e) => setCatatan((s) => ({ ...s, [item.id]: e.target.value }))}
                    placeholder="Catatan admin (wajib bila menolak)"
                    aria-label="Catatan admin"
                    className="pl-input"
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      data-testid="setujui-perubahan"
                      disabled={putuskan.isPending}
                      onClick={() => putuskanItem(item, "APPROVED")}
                      className="pl-btn"
                    >
                      Setujui & terapkan
                    </button>
                    <button
                      type="button"
                      data-testid="tolak-perubahan"
                      disabled={putuskan.isPending}
                      onClick={() => putuskanItem(item, "REJECTED")}
                      className="rounded-[var(--radius-control)] border border-[#26264F] bg-[#1d1b36] px-4 py-2.5 text-sm font-semibold text-danger"
                    >
                      Tolak
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-xs text-navy-400">
                  Diputuskan {item.reviewedAt ? new Date(item.reviewedAt).toLocaleString("id-ID") : "—"}
                  {item.adminNote ? ` · Catatan: ${item.adminNote}` : ""}
                </p>
              )}
            </article>
          ))
        )}
      </div>

      <Pagination page={page} totalPages={totalHalaman} onChange={setPage} />
    </section>
  );
}
