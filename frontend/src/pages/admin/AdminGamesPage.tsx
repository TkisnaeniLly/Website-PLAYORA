import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { Field } from "@/components/ui/Field";
import { TextArea } from "@/components/ui/TextArea";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { Pagination } from "@/components/ui/Pagination";
import {
  useAdminGames,
  useCreateAdminGame,
  useDeleteAdminGame,
  useUpdateAdminGame,
} from "@/hooks/useAdmin";
import {
  BATAS_ADMIN,
  DAFTAR_PLATFORM,
  LABEL_STATUS,
  WARNA_STATUS,
  formatTanggal,
  keSlug,
} from "@/lib/admin";
import { extractApiError } from "@/lib/api";
import type { AdminGameItem } from "@/types/admin";

const KOSONG = {
  title: "",
  slug: "",
  description: "",
  genre: "",
  developer: "",
  publisher: "",
  releaseDate: "",
  coverImageUrl: "",
  isPopular: false,
  status: "DRAFT" as "DRAFT" | "PUBLISHED",
  platformIds: [] as string[],
};

export function AdminGamesPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"" | "DRAFT" | "PUBLISHED">("");
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(KOSONG);
  const [sedangEdit, setSedangEdit] = useState<string | null>(null);
  const [formTerbuka, setFormTerbuka] = useState(false);
  const [searchParams] = useSearchParams();
  const qUrl = searchParams.get("q") ?? "";

  useEffect(() => {
    setQ(qUrl);
    setPage(1);
  }, [qUrl]);

  const daftar = useAdminGames({ q, status: status || undefined, page, limit: BATAS_ADMIN });
  const buat = useCreateAdminGame();
  const ubah = useUpdateAdminGame();
  const hapus = useDeleteAdminGame();

  const items = daftar.data?.items ?? [];
  const totalHalaman = Math.max(1, Math.ceil((daftar.data?.total ?? 0) / BATAS_ADMIN));
  const galat = buat.error ?? ubah.error ?? hapus.error;

  function isiForm(item: AdminGameItem) {
    setSedangEdit(item.id);
    setFormTerbuka(true);
    setForm({
      title: item.title,
      slug: item.slug,
      description: item.description,
      genre: item.genre,
      developer: item.developer ?? "",
      publisher: item.publisher ?? "",
      releaseDate: item.releaseDate ? item.releaseDate.slice(0, 10) : "",
      coverImageUrl: item.coverImageUrl ?? "",
      isPopular: item.isPopular,
      status: item.status,
      platformIds: item.platforms.map((p) => p.platform.name),
    });
  }

  function resetForm() {
    setSedangEdit(null);
    setForm(KOSONG);
  }

  function ubahField(nama: "title" | "slug" | "description" | "genre" | "developer" | "publisher" | "releaseDate" | "coverImageUrl", nilai: string) {
    setForm((sebelumnya) => ({
      ...sebelumnya,
      [nama]: nilai,
      slug: nama === "title" && sebelumnya.slug === keSlug(sebelumnya.title) ? keSlug(nilai) : sebelumnya.slug,
    }));
  }

  function kirim(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = {
      title: form.title,
      slug: form.slug || keSlug(form.title),
      description: form.description,
      genre: form.genre,
      developer: form.developer,
      publisher: form.publisher,
      releaseDate: form.releaseDate || undefined,
      coverImageUrl: form.coverImageUrl,
      isPopular: form.isPopular,
      status: form.status,
    };

    if (sedangEdit) {
      ubah.mutate(
      { id: sedangEdit, data: payload },
      {
        onSuccess: () => {
          resetForm();
          setFormTerbuka(false);
        },
      },
    );
      return;
    }

    buat.mutate(payload, {
      onSuccess: () => {
        resetForm();
        setFormTerbuka(false);
      },
    });
  }

  function toggleTerbit(item: AdminGameItem) {
    ubah.mutate({
      id: item.id,
      data: { status: item.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED" },
    });
  }

  function konfirmasiHapus(item: AdminGameItem) {
    const ya = window.confirm(`Hapus game “${item.title}”? Tindakan ini tidak dapat dibatalkan.`);
    if (ya) hapus.mutate(item.id);
  }

  return (
    <section className="space-y-5" data-testid="halaman-admin-game">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-white">Kelola game</h1>
          <p className="mt-2 text-sm text-[#9d9ac2]">
            Buat, ubah, terbitkan, dan arsipkan katalog game.
          </p>
        </div>
        <button
          type="button"
          data-testid="tambah-game"
          onClick={() => {
            if (formTerbuka) {
              resetForm();
              setFormTerbuka(false);
              return;
            }
            resetForm();
            setFormTerbuka(true);
          }}
          className="pl-btn text-xs"
        >
          {formTerbuka ? "Tutup formulir" : "+ Tambah game"}
        </button>
      </header>

      {formTerbuka ? (
      <form
        onSubmit={kirim}
        data-testid="form-game"
        className="mt-6 space-y-4 rounded-[var(--radius-card)] border border-[#26264F] bg-[#161839] p-5"
      >
        <h2 className="text-lg font-bold text-white">
          {sedangEdit ? "Ubah game" : "Tambah game baru"}
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Judul"
            name="title"
            required
            value={form.title}
            onChange={(e) => ubahField("title", e.target.value)}
          />
          <Field
            label="Slug"
            name="slug"
            required
            value={form.slug}
            onChange={(e) => ubahField("slug", e.target.value)}
            petunjuk="Dipakai pada URL. Dikisi otomatis dari judul bila dikosongkan."
          />
          <Field
            label="Genre"
            name="genre"
            required
            value={form.genre}
            onChange={(e) => ubahField("genre", e.target.value)}
          />
          <Field
            label="Developer"
            name="developer"
            value={form.developer}
            onChange={(e) => ubahField("developer", e.target.value)}
          />
          <Field
            label="Publisher"
            name="publisher"
            value={form.publisher}
            onChange={(e) => ubahField("publisher", e.target.value)}
          />
          <Field
            label="Tanggal rilis"
            name="releaseDate"
            type="date"
            value={form.releaseDate}
            onChange={(e) => ubahField("releaseDate", e.target.value)}
          />
        </div>

        <TextArea
          label="Deskripsi"
          name="description"
          rows={4}
          required
          value={form.description}
          onChange={(e) => ubahField("description", e.target.value)}
        />

        <Field
          label="URL sampul"
          name="coverImageUrl"
          value={form.coverImageUrl}
          onChange={(e) => ubahField("coverImageUrl", e.target.value)}
          petunjuk="Opsional. Harus diawali http:// atau https://."
        />

        <fieldset>
          <legend className="text-sm font-medium text-white">Platform</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {DAFTAR_PLATFORM.map((nama) => {
              const aktif = form.platformIds.includes(nama);
              return (
                <button
                  key={nama}
                  type="button"
                  data-testid={`platform-${nama}`}
                  onClick={() =>
                    setForm((sebelumnya) => ({
                      ...sebelumnya,
                      platformIds: aktif
                        ? sebelumnya.platformIds.filter((item) => item !== nama)
                        : [...sebelumnya.platformIds, nama],
                    }))
                  }
                  className={[
                    "rounded-full px-3 py-1.5 text-xs font-semibold",
                    aktif ? "bg-[#7138F5] text-white" : "border border-[#26264F] bg-[#161839] text-[#cbc5e6]",
                  ].join(" ")}
                >
                  {nama}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-white">
            <input
              type="checkbox"
              checked={form.isPopular}
              onChange={(e) => setForm((s) => ({ ...s, isPopular: e.target.checked }))}
              className="h-4 w-4 rounded border-[#26264F]"
            />
            Tandai populer
          </label>

          <label className="flex items-center gap-2 text-sm text-white">
            Status
            <select
              value={form.status}
              onChange={(e) =>
                setForm((s) => ({ ...s, status: e.target.value as "DRAFT" | "PUBLISHED" }))
              }
              className="rounded-[var(--radius-control)] border border-[#26264F] bg-[#161839] px-3 py-2 text-sm"
            >
              <option value="DRAFT">Draf</option>
              <option value="PUBLISHED">Terbit</option>
            </select>
          </label>
        </div>

        {galat ? (
          <p role="alert" data-testid="galat-form-game" className="text-sm font-medium text-danger">
            {extractApiError(galat).message}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={buat.isPending || ubah.isPending}
            data-testid="simpan-game"
            className="rounded-[var(--radius-control)] bg-[#7138F5] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {sedangEdit ? "Simpan perubahan" : "Tambah game"}
          </button>

          {sedangEdit ? (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-[var(--radius-control)] border border-[#26264F] bg-[#161839] px-4 py-2.5 text-sm font-medium text-white"
            >
              Batal ubah
            </button>
          ) : null}
        </div>
      </form>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
          placeholder="Cari judul game…"
          data-testid="cari-game"
          className="rounded-[var(--radius-control)] border border-[#26264F] bg-[#161839] px-3 py-2.5 text-sm"
        />

        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as "" | "DRAFT" | "PUBLISHED");
            setPage(1);
          }}
          data-testid="filter-status-game"
          className="rounded-[var(--radius-control)] border border-[#26264F] bg-[#161839] px-3 py-2.5 text-sm"
        >
          <option value="">Semua status</option>
          <option value="PUBLISHED">Terbit</option>
          <option value="DRAFT">Draf</option>
        </select>
      </div>

      <div className="mt-4">
        {daftar.isPending ? (
          <div data-testid="loading-state" className="space-y-2">
            <div className="h-16 animate-pulse rounded-[var(--radius-card)] bg-[#1d1b36]" />
            <div className="h-16 animate-pulse rounded-[var(--radius-card)] bg-[#1d1b36]" />
          </div>
        ) : daftar.isError ? (
          <ErrorState
            pesan={daftar.error ? extractApiError(daftar.error).message : "Terjadi kesalahan."}
            onRetry={() => void daftar.refetch()}
          />
        ) : items.length === 0 ? (
          <EmptyState judul="Belum ada game" deskripsi="Belum ada game yang cocok dengan filter." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm" data-testid="tabel-game">
              <thead>
                <tr className="border-b border-[#26264F] text-xs uppercase tracking-wide text-[#9d9ac2]">
                  <th className="py-2 pr-3">Judul</th>
                  <th className="py-2 pr-3">Genre</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Diperbarui</th>
                  <th className="py-2">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-[#26264F]/70">
                    <td className="py-3 pr-3">
                      <p className="font-semibold text-white">{item.title}</p>
                      <p className="text-xs text-[#9d9ac2]">/{item.slug}</p>
                    </td>
                    <td className="py-3 pr-3 text-[#cbc5e6]">{item.genre}</td>
                    <td className="py-3 pr-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${WARNA_STATUS[item.status]}`}
                      >
                        {LABEL_STATUS[item.status]}
                      </span>
                    </td>
                    <td className="py-3 pr-3 text-xs text-[#9d9ac2]">{formatTanggal(item.updatedAt)}</td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          data-testid={`ubah-game-${item.slug}`}
                          onClick={() => isiForm(item)}
                          className="rounded-[var(--radius-control)] border border-[#26264F] bg-[#161839] px-2.5 py-1.5 text-xs font-semibold text-white"
                        >
                          Ubah
                        </button>
                        <button
                          type="button"
                          data-testid={`terbit-game-${item.slug}`}
                          onClick={() => toggleTerbit(item)}
                          className="rounded-[var(--radius-control)] border border-[#26264F] bg-[#161839] px-2.5 py-1.5 text-xs font-semibold text-white"
                        >
                          {item.status === "PUBLISHED" ? "Tarik jadi draf" : "Terbitkan"}
                        </button>
                        <button
                          type="button"
                          data-testid={`hapus-game-${item.slug}`}
                          onClick={() => konfirmasiHapus(item)}
                          className="rounded-[var(--radius-control)] border border-[#26264F] bg-[#161839] px-2.5 py-1.5 text-xs font-semibold text-danger"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination page={page} totalPages={totalHalaman} onChange={setPage} />
    </section>
  );
}
