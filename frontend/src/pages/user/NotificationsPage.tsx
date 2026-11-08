import { Link, useSearchParams } from "react-router-dom";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { Pagination } from "@/components/ui/Pagination";
import { useMarkAllRead, useMarkRead, useNotifications } from "@/hooks/useAccount";
import { extractApiError } from "@/lib/api";
import {
  BATAS_NOTIFIKASI,
  KELOMPOK_NOTIFIKASI,
  WARNA_NOTIFIKASI,
  notificationLink,
} from "@/lib/account";

function formatTanggal(nilai: string): string {
  return new Date(nilai).toLocaleString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function NotificationsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const hanyaBelumDibaca = searchParams.get("unread") === "true";

  const pageMentah = Number.parseInt(searchParams.get("page") ?? "1", 10);
  const page = Number.isFinite(pageMentah) && pageMentah > 0 ? pageMentah : 1;

  const daftar = useNotifications({ unreadOnly: hanyaBelumDibaca, page, limit: BATAS_NOTIFIKASI });
  const tandai = useMarkRead();
  const tandaiSemua = useMarkAllRead();

  function ubahFilter(unread: boolean) {
    setSearchParams(
      (sebelumnya) => {
        const berikut = new URLSearchParams(sebelumnya);
        if (unread) berikut.set("unread", "true");
        else berikut.delete("unread");
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
    Math.ceil((daftar.data?.total ?? 0) / Math.max(1, daftar.data?.limit ?? BATAS_NOTIFIKASI)),
  );

  const belumDibaca = daftar.data?.unreadCount ?? 0;

  return (
    <section className="playora-container py-6 sm:py-8" data-testid="halaman-notifikasi">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="pl-title">Notifikasi</h1>
          <p className="mt-2 text-sm text-muted">
            Perubahan status pengajuan dan hasil turnamen Anda.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            data-testid="jumlah-belum-dibaca"
            className="rounded-full bg-navy-100 px-3 py-1 text-xs font-semibold text-navy-700"
          >
            {belumDibaca} belum dibaca
          </span>

          <button
            type="button"
            data-testid="tandai-semua"
            disabled={belumDibaca === 0 || tandaiSemua.isPending}
            onClick={() => tandaiSemua.mutate()}
            className="rounded-[var(--radius-control)] border border-line bg-white px-3 py-2 text-xs font-semibold text-navy-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {tandaiSemua.isPending ? "Memproses…" : "Tandai semua dibaca"}
          </button>

          <Link
            to="/profile/settings"
            data-testid="tautan-pengaturan-notifikasi"
            className="rounded-[var(--radius-control)] border border-line bg-white px-3 py-2 text-xs font-semibold text-navy-800 sm:hidden"
          >
            Pengaturan akun
          </Link>
        </div>
      </header>

      <div className="mt-5 flex gap-2">
        <button
          type="button"
          data-testid="tab-semua"
          onClick={() => ubahFilter(false)}
          className={[
            "rounded-[var(--radius-control)] px-3 py-2 text-sm font-medium",
            !hanyaBelumDibaca ? "bg-[#7138F5] text-white" : "border border-line bg-white text-navy-800",
          ].join(" ")}
        >
          Semua
        </button>
        <button
          type="button"
          data-testid="tab-belum-dibaca"
          onClick={() => ubahFilter(true)}
          className={[
            "rounded-[var(--radius-control)] px-3 py-2 text-sm font-medium",
            hanyaBelumDibaca ? "bg-[#7138F5] text-white" : "border border-line bg-white text-navy-800",
          ].join(" ")}
        >
          Belum dibaca
        </button>
      </div>

      {tandaiSemua.error ? (
        <p role="alert" className="mt-4 rounded-[var(--radius-control)] border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger">
          {extractApiError(tandaiSemua.error).message}
        </p>
      ) : null}

      <div className="mt-5">
        {daftar.isPending ? (
          <div data-testid="loading-state" className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-[var(--radius-card)] bg-navy-100" />
            ))}
          </div>
        ) : daftar.isError ? (
          <ErrorState
            pesan={extractApiError(daftar.error).message}
            onRetry={() => void daftar.refetch()}
          />
        ) : (daftar.data?.items.length ?? 0) === 0 ? (
          <EmptyState
            judul="Tidak ada notifikasi"
            deskripsi={
              hanyaBelumDibaca
                ? "Semua notifikasi sudah dibaca."
                : "Notifikasi akan muncul saat status pengajuan atau hasil turnamen berubah."
            }
            aksi={
              hanyaBelumDibaca
                ? { label: "Lihat semua", onClick: () => ubahFilter(false) }
                : undefined
            }
          />
        ) : (
          <ul data-testid="daftar-notifikasi" className="space-y-2">
            {(daftar.data?.items ?? []).map((notif) => {
              const tujuan = notificationLink(notif.type, notif.referenceId);

              return (
                <li
                  key={notif.id}
                  data-testid="item-notifikasi"
                  data-dibaca={notif.isRead ? "true" : "false"}
                  className={[
                    "rounded-[var(--radius-card)] border p-4",
                    notif.isRead
                      ? "border-line bg-white"
                      : "border-navy-200 bg-navy-50",
                  ].join(" ")}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${WARNA_NOTIFIKASI[notif.type]}`}
                    >
                      {KELOMPOK_NOTIFIKASI[notif.type]}
                    </span>
                    <span className="text-xs text-muted">{formatTanggal(notif.createdAt)}</span>
                  </div>

                  <p
                    className={[
                      "mt-2 text-sm",
                      notif.isRead ? "font-medium text-navy-800" : "font-bold text-navy-900",
                    ].join(" ")}
                  >
                    {notif.title}
                  </p>
                  <p className="mt-1 text-sm text-muted">{notif.message}</p>

                  <div className="mt-3 flex flex-wrap gap-3 text-xs">
                    {tujuan ? (
                      <Link
                        to={tujuan}
                        className="font-semibold text-navy-700 hover:underline"
                      >
                        Buka detail →
                      </Link>
                    ) : null}

                    {!notif.isRead ? (
                      <button
                        type="button"
                        data-testid="tandai-dibaca"
                        disabled={tandai.isPending}
                        onClick={() => tandai.mutate(notif.id)}
                        className="font-semibold text-navy-600 hover:underline disabled:opacity-50"
                      >
                        Tandai dibaca
                      </button>
                    ) : (
                      <span className="text-muted">Sudah dibaca</span>
                    )}
                  </div>
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
