import { useState } from "react";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { Pagination } from "@/components/ui/Pagination";
import { DiscordLogo } from "@/components/discord/DiscordLogo";
import { useAdminDiscordRooms, useReviewDiscordRoom } from "@/hooks/useDiscordRooms";
import { extractApiError } from "@/lib/api";
import {
  BATAS_RUANG_DISCORD,
  DAFTAR_STATUS_RUANG,
  LABEL_STATUS_RUANG,
  WARNA_STATUS_RUANG,
  formatAnggota,
} from "@/lib/discord";
import type { DiscordRoomAdmin, DiscordRoomStatus } from "@/types/discord";

export function AdminDiscordRoomsPage({ tanpaHeader = false }: { tanpaHeader?: boolean } = {}) {
  const [status, setStatus] = useState<DiscordRoomStatus | "">("PENDING");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [catatan, setCatatan] = useState<Record<string, string>>({});

  const daftar = useAdminDiscordRooms({ status, q, page, limit: BATAS_RUANG_DISCORD });
  const putuskan = useReviewDiscordRoom();

  const items = daftar.data?.items ?? [];
  const totalHalaman = Math.max(
    1,
    Math.ceil((daftar.data?.total ?? 0) / BATAS_RUANG_DISCORD),
  );
  const galat = putuskan.error ? extractApiError(putuskan.error) : null;

  function putuskanItem(room: DiscordRoomAdmin, decision: "APPROVED" | "REJECTED") {
    const note = catatan[room.id]?.trim() ?? "";

    if (decision === "REJECTED" && note.length === 0) {
      window.alert("Catatan wajib diisi saat menolak ruang Discord.");
      return;
    }

    if (decision === "APPROVED") {
      const ya = window.confirm(
        `Setujui ruang "${room.name}"? Ruang langsung tampil di rekomendasi komunitas.`,
      );
      if (!ya) return;
    }

    putuskan.mutate({ id: room.id, decision, note: note || undefined });
  }

  return (
    <section className="space-y-5" data-testid="halaman-admin-ruang-discord">
      {tanpaHeader ? null : (
        <header>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-white">
            Validasi ruang Discord
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-navy-400">
            Tinjau ruang Discord yang diajukan pengguna. Hanya ruang yang disetujui yang tampil
            di rekomendasi halaman komunitas.
          </p>
        </header>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {([...DAFTAR_STATUS_RUANG, ""] as const).map((nilai) => (
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
            {nilai ? LABEL_STATUS_RUANG[nilai] : "Semua"}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <input
          value={q}
          onChange={(event) => {
            setQ(event.target.value);
            setPage(1);
          }}
          placeholder="Cari nama ruang atau pengaju\u2026"
          aria-label="Cari ruang Discord"
          data-testid="cari-ruang-admin"
          className="pl-input max-w-sm"
        />
        <p className="text-sm text-navy-400">
          {daftar.data ? `${daftar.data.total} pengajuan` : "Memuat\u2026"}
        </p>
      </div>

      {galat ? (
        <p role="alert" className="mt-4 text-sm font-medium text-danger">
          {galat.message}
        </p>
      ) : null}

      <div className="mt-4 space-y-3">
        {daftar.isPending ? (
          <div data-testid="loading-state" className="space-y-3">
            <div className="h-36 animate-pulse rounded-[var(--radius-card)] bg-[#1d1b36]" />
          </div>
        ) : daftar.isError ? (
          <ErrorState
            pesan={daftar.error ? extractApiError(daftar.error).message : "Terjadi kesalahan."}
            onRetry={() => void daftar.refetch()}
          />
        ) : items.length === 0 ? (
          <EmptyState
            judul="Tidak ada pengajuan"
            deskripsi="Belum ada pengajuan ruang Discord pada filter ini."
          />
        ) : (
          items.map((room) => (
            <article
              key={room.id}
              data-testid="kartu-ruang-admin"
              className="rounded-[var(--radius-card)] border border-[#26264F] bg-gradient-to-br from-[#171a34] to-[#111528] p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#5865F2] text-white">
                    <DiscordLogo className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white">{room.name}</p>
                    <p className="mt-0.5 text-[11px] text-navy-400">
                      Diajukan {room.submitter.name} (@{room.submitter.username}) \u00b7{" "}
                      {new Date(room.createdAt).toLocaleString("id-ID")}
                    </p>
                    <p className="mt-1 text-[11px] text-navy-400">
                      {room.game ? room.game.title : "Komunitas umum"}
                      {formatAnggota(room.memberCount)
                        ? ` \u00b7 ${formatAnggota(room.memberCount)}`
                        : ""}
                    </p>
                  </div>
                </div>

                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${WARNA_STATUS_RUANG[room.status]}`}
                >
                  {LABEL_STATUS_RUANG[room.status]}
                </span>
              </div>

              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-navy-300">
                {room.description}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                <a
                  href={room.inviteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pl-link break-all"
                >
                  {room.inviteUrl}
                </a>
                {room.reviewer ? (
                  <span className="text-navy-400">
                    Ditinjau {room.reviewer.name}
                    {room.reviewedAt
                      ? ` \u00b7 ${new Date(room.reviewedAt).toLocaleString("id-ID")}`
                      : ""}
                  </span>
                ) : null}
              </div>

              {room.adminNote ? (
                <p className="mt-2 rounded-lg bg-[#1d1b36] px-3 py-2 text-xs text-navy-300">
                  Catatan admin: {room.adminNote}
                </p>
              ) : null}

              {room.status === "PENDING" ? (
                <div className="mt-4 grid gap-2">
                  <textarea
                    value={catatan[room.id] ?? ""}
                    onChange={(event) =>
                      setCatatan((sebelumnya) => ({
                        ...sebelumnya,
                        [room.id]: event.target.value,
                      }))
                    }
                    placeholder="Catatan untuk pengaju (wajib saat menolak)\u2026"
                    aria-label={`Catatan untuk ${room.name}`}
                    rows={2}
                    maxLength={1000}
                    className="pl-input"
                  />

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      data-testid={`setujui-ruang-${room.id}`}
                      disabled={putuskan.isPending}
                      onClick={() => putuskanItem(room, "APPROVED")}
                      className="pl-btn text-xs"
                    >
                      Setujui & tampilkan
                    </button>
                    <button
                      type="button"
                      data-testid={`tolak-ruang-${room.id}`}
                      disabled={putuskan.isPending}
                      onClick={() => putuskanItem(room, "REJECTED")}
                      className="pl-btn-ghost text-xs"
                    >
                      Tolak
                    </button>
                  </div>
                </div>
              ) : null}
            </article>
          ))
        )}
      </div>

      <Pagination page={page} totalPages={totalHalaman} onChange={setPage} />
    </section>
  );
}
