import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { Pagination } from "@/components/ui/Pagination";
import { Field } from "@/components/ui/Field";
import { TextArea } from "@/components/ui/TextArea";
import { useAuth } from "@/hooks/useAuth";
import { useGames } from "@/hooks/useGames";
import {
  useCreateDiscordRoom,
  useDiscordRooms,
  useMyDiscordRooms,
  useUpdateDiscordRoom,
} from "@/hooks/useDiscordRooms";
import { extractApiError } from "@/lib/api";
import {
  BATAS_RUANG_DISCORD,
  LABEL_STATUS_RUANG,
  WARNA_STATUS_RUANG,
} from "@/lib/discord";
import { DiscordLogo } from "./DiscordLogo";
import { DiscordRoomCard } from "./DiscordRoomCard";
import type { DiscordRoomFormValues, DiscordRoomMine } from "@/types/discord";

export function DiscordRoomSection() {
  const { data: pengguna } = useAuth();

  const [kataKunci, setKataKunci] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const daftar = useDiscordRooms(
    { q, page, limit: BATAS_RUANG_DISCORD },
    Boolean(pengguna),
  );
  const milik = useMyDiscordRooms(Boolean(pengguna));
  const { data: katalogGame } = useGames({ limit: 48 }, Boolean(pengguna));

  const buat = useCreateDiscordRoom();
  const ubah = useUpdateDiscordRoom();

  const [formTerbuka, setFormTerbuka] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [nama, setNama] = useState("");
  const [undangan, setUndangan] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [gameId, setGameId] = useState("");
  const [jumlahAnggota, setJumlahAnggota] = useState("");

  const items = daftar.data?.items ?? [];
  const totalHalaman = Math.max(
    1,
    Math.ceil((daftar.data?.total ?? 0) / BATAS_RUANG_DISCORD),
  );

  const galatMutasi = buat.error ?? ubah.error;
  const galat = galatMutasi ? extractApiError(galatMutasi) : null;

  function resetForm() {
    setEditId(null);
    setNama("");
    setUndangan("");
    setDeskripsi("");
    setGameId("");
    setJumlahAnggota("");
  }

  function mulaiUbah(room: DiscordRoomMine) {
    setEditId(room.id);
    setNama(room.name);
    setUndangan(room.inviteUrl);
    setDeskripsi(room.description);
    setGameId(room.game?.id ?? "");
    setJumlahAnggota(room.memberCount === null ? "" : String(room.memberCount));
    setFormTerbuka(true);
    requestAnimationFrame(() => {
      document.getElementById("form-ruang-discord")?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });
  }

  function kirim(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const values: DiscordRoomFormValues = {
      name: nama.trim(),
      inviteUrl: undangan.trim(),
      description: deskripsi.trim(),
    };

    if (gameId) values.gameId = gameId;

    const jumlah = Number.parseInt(jumlahAnggota, 10);
    if (Number.isFinite(jumlah) && jumlah >= 0) values.memberCount = jumlah;

    if (editId) {
      ubah.mutate({ id: editId, values }, { onSuccess: resetForm });
      return;
    }

    buat.mutate(values, { onSuccess: resetForm });
  }

  const sedangKirim = buat.isPending || ubah.isPending;

  return (
    <section
      id="discord"
      data-testid="seksi-ruang-discord"
      className="mt-6 scroll-mt-24 rounded-[var(--radius-card)] border border-[#5865F2]/35 bg-gradient-to-br from-[#1b1e44] via-[#151833] to-[#111528] p-4 sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#5865F2] text-white">
            <DiscordLogo className="h-6 w-6" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#a9b6ff]">
              Ruang Discord
            </p>
            <h2 className="mt-1 text-lg font-bold text-white sm:text-xl">
              Rekomendasi ruang Discord komunitas
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-navy-300">
              Temukan server Discord untuk mabar, berdiskusi, dan mengikuti turnamen. Semua
              ruang telah divalidasi admin PLAYORA.
            </p>
          </div>
        </div>

        <p className="text-xs text-navy-400" data-testid="jumlah-ruang-discord">
          {!pengguna
            ? "Khusus anggota"
            : daftar.data
              ? `${daftar.data.total} ruang tersedia`
              : "Memuat\u2026"}
        </p>
      </div>

      {!pengguna ? (
        <div
          data-testid="gerbang-ruang-discord"
          className="mt-4 rounded-[var(--radius-card)] border border-dashed border-[#5865F2]/60 bg-[#111528] px-5 py-10 text-center"
        >
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#5865F2] text-white">
            <DiscordLogo className="h-6 w-6" />
          </span>
          <p className="mt-3 text-base font-bold text-white">
            Masuk untuk melihat rekomendasi ruang Discord
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-navy-300">
            Daftar ruang Discord hanya tersedia untuk anggota PLAYORA. Masuk atau buat akun
            gratis untuk melihat server yang sudah divalidasi admin.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Link to="/login" data-testid="masuk-ruang-discord" className="pl-btn">
              Masuk
            </Link>
            <Link to="/register" data-testid="daftar-akun-ruang-discord" className="pl-btn-outline">
              Daftar akun
            </Link>
          </div>
        </div>
      ) : (
        <>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setQ(kataKunci.trim());
          setPage(1);
        }}
        className="mt-4 flex flex-wrap items-center gap-2"
      >
        <input
          value={kataKunci}
          onChange={(event) => setKataKunci(event.target.value)}
          placeholder="Cari nama atau deskripsi ruang\u2026"
          aria-label="Cari ruang Discord"
          data-testid="cari-ruang-discord"
          className="pl-input max-w-sm"
        />
        <button type="submit" className="pl-btn-ghost">
          Cari
        </button>
        {q ? (
          <button
            type="button"
            onClick={() => {
              setKataKunci("");
              setQ("");
              setPage(1);
            }}
            className="text-xs font-semibold text-[#a9b6ff] hover:underline"
          >
            Hapus pencarian
          </button>
        ) : null}
      </form>

      <div className="mt-4">
        {daftar.isPending ? (
          <div data-testid="loading-state" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, indeks) => (
              <div
                key={indeks}
                className="h-40 animate-pulse rounded-[var(--radius-card)] bg-[#1d1b36]"
              />
            ))}
          </div>
        ) : daftar.isError ? (
          <ErrorState
            pesan={daftar.error ? extractApiError(daftar.error).message : "Terjadi kesalahan."}
            onRetry={() => void daftar.refetch()}
          />
        ) : items.length === 0 ? (
          <EmptyState
            judul={q ? "Ruang tidak ditemukan" : "Belum ada ruang Discord"}
            deskripsi={
              q
                ? "Coba kata kunci lain atau hapus pencarian."
                : "Ruang yang disetujui admin akan tampil di rekomendasi ini."
            }
          />
        ) : (
          <ul data-testid="daftar-ruang-discord" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((room) => (
              <li key={room.id}>
                <DiscordRoomCard room={room} />
              </li>
            ))}
          </ul>
        )}
      </div>

      <Pagination page={page} totalPages={totalHalaman} onChange={setPage} />

      <div className="mt-6 border-t border-line pt-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white">Punya ruang Discord?</h3>
            <p className="mt-1 text-xs text-navy-400">
              Daftarkan server komunitasmu. Admin akan memvalidasi sebelum tampil di
              rekomendasi.
            </p>
          </div>

          {pengguna ? (
            <button
              type="button"
              data-testid="tombol-daftar-ruang"
              onClick={() => {
                if (formTerbuka) {
                  resetForm();
                  setFormTerbuka(false);
                } else {
                  setFormTerbuka(true);
                }
              }}
              className="pl-btn-outline text-xs"
            >
              {formTerbuka ? "Tutup formulir" : "Daftarkan ruang Discord"}
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="pl-btn text-xs">
                Masuk
              </Link>
              <Link to="/register" className="pl-btn-outline text-xs">
                Daftar
              </Link>
            </div>
          )}
        </div>

        {pengguna && formTerbuka ? (
          <form
            id="form-ruang-discord"
            onSubmit={kirim}
            data-testid="form-ruang-discord"
            className="mt-4 grid gap-3 rounded-[var(--radius-card)] border border-line bg-[#111528] p-4"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                label="Nama ruang"
                value={nama}
                onChange={(event) => setNama(event.target.value)}
                placeholder="Contoh: Valorant Indonesia"
                required
                minLength={3}
                maxLength={150}
              />
              <Field
                label="Tautan undangan Discord"
                petunjuk="Format: https://discord.gg/... atau https://discord.com/invite/..."
                value={undangan}
                onChange={(event) => setUndangan(event.target.value)}
                placeholder="https://discord.gg/..."
                required
                maxLength={500}
              />
            </div>

            <TextArea
              label="Deskripsi ruang"
              value={deskripsi}
              onChange={(event) => setDeskripsi(event.target.value)}
              placeholder="Jelaskan topik, jadwal aktivitas, dan aturan utama ruang."
              required
              minLength={10}
              maxLength={1000}
              rows={3}
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="game-ruang" className="block text-sm font-medium text-navy-200">
                  Game terkait (opsional)
                </label>
                <select
                  id="game-ruang"
                  value={gameId}
                  onChange={(event) => setGameId(event.target.value)}
                  className="pl-input"
                >
                  <option value="">Komunitas umum</option>
                  {(katalogGame?.items ?? []).map((game) => (
                    <option key={game.id} value={game.id}>
                      {game.title}
                    </option>
                  ))}
                </select>
              </div>

              <Field
                label="Jumlah anggota (opsional)"
                type="number"
                min={0}
                value={jumlahAnggota}
                onChange={(event) => setJumlahAnggota(event.target.value)}
                placeholder="Contoh: 1250"
              />
            </div>

            {galat ? (
              <p role="alert" className="text-xs font-medium text-danger">
                {galat.message}
                {galat.details.length > 0 ? ` \u2014 ${galat.details[0]?.message}` : ""}
              </p>
            ) : null}

            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[11px] text-navy-400">
                {editId
                  ? "Menyimpan perubahan akan mengirim ulang ruang untuk divalidasi admin."
                  : "Ruang akan berstatus menunggu validasi sampai disetujui admin."}
              </p>
              <div className="flex gap-2">
                {editId ? (
                  <button type="button" onClick={resetForm} className="pl-btn-ghost text-xs">
                    Batalkan perubahan
                  </button>
                ) : null}
                <button type="submit" disabled={sedangKirim} className="pl-btn text-xs">
                  {sedangKirim
                    ? "Mengirim\u2026"
                    : editId
                      ? "Simpan perubahan"
                      : "Kirim untuk validasi"}
                </button>
              </div>
            </div>
          </form>
        ) : null}

        {pengguna && (milik.data?.length ?? 0) > 0 ? (
          <div className="mt-5" data-testid="daftar-ruang-saya">
            <h4 className="text-sm font-bold text-white">Pengajuan ruang saya</h4>
            <ul className="mt-2 space-y-2">
              {(milik.data ?? []).map((room) => (
                <li
                  key={room.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-[#111528] px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{room.name}</p>
                    <p className="text-[11px] text-navy-400">
                      <span
                        className={`mr-2 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${WARNA_STATUS_RUANG[room.status]}`}
                      >
                        {LABEL_STATUS_RUANG[room.status]}
                      </span>
                      {room.adminNote ? `Catatan admin: ${room.adminNote}` : room.inviteUrl}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => mulaiUbah(room)}
                    className="pl-btn-ghost text-xs"
                  >
                    {room.status === "REJECTED" ? "Perbaiki & ajukan ulang" : "Ajukan perubahan"}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
        </>
      )}
    </section>
  );
}
