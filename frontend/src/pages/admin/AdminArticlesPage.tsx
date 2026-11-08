import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { Field } from "@/components/ui/Field";
import { TextArea } from "@/components/ui/TextArea";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { Pagination } from "@/components/ui/Pagination";
import {
  useAdminArticles,
  useCreateAdminArticle,
  useDeleteAdminArticle,
  useUpdateAdminArticle,
} from "@/hooks/useAdmin";
import {
  BATAS_ADMIN,
  LABEL_KATEGORI,
  LABEL_STATUS,
  WARNA_STATUS,
  formatTanggal,
  keSlug,
} from "@/lib/admin";
import { extractApiError } from "@/lib/api";
import type { ArticleCategory } from "@/types/articles";
import type { AdminArticleItem } from "@/types/admin";

const KOSONG = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  category: "NEWS" as ArticleCategory,
  thumbnailUrl: "",
  status: "DRAFT" as "DRAFT" | "PUBLISHED",
  publishedAt: "",
};

export function AdminArticlesPage() {
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

  const daftar = useAdminArticles({ q, status: status || undefined, page, limit: BATAS_ADMIN });
  const buat = useCreateAdminArticle();
  const ubah = useUpdateAdminArticle();
  const hapus = useDeleteAdminArticle();

  const items = daftar.data?.items ?? [];
  const totalHalaman = Math.max(1, Math.ceil((daftar.data?.total ?? 0) / BATAS_ADMIN));
  const galat = buat.error ?? ubah.error ?? hapus.error;

  function isiForm(item: AdminArticleItem) {
    setSedangEdit(item.id);
    setFormTerbuka(true);
    setForm({
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt ?? "",
      content: item.content,
      category: item.category,
      thumbnailUrl: item.thumbnailUrl ?? "",
      status: item.status,
      publishedAt: item.publishedAt ? item.publishedAt.slice(0, 16) : "",
    });
  }

  function resetForm() {
    setSedangEdit(null);
    setForm(KOSONG);
  }

  function ubahField(
    nama: "title" | "slug" | "excerpt" | "content" | "thumbnailUrl" | "publishedAt",
    nilai: string,
  ) {
    setForm((sebelumnya) => ({
      ...sebelumnya,
      [nama]: nilai,
      slug:
        nama === "title" && sebelumnya.slug === keSlug(sebelumnya.title) ? keSlug(nilai) : sebelumnya.slug,
    }));
  }

  function kirim(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = {
      title: form.title,
      slug: form.slug || keSlug(form.title),
      excerpt: form.excerpt,
      content: form.content,
      category: form.category,
      thumbnailUrl: form.thumbnailUrl,
      status: form.status,
      publishedAt: form.publishedAt ? new Date(form.publishedAt).toISOString() : undefined,
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

  function toggleTerbit(item: AdminArticleItem) {
    ubah.mutate({
      id: item.id,
      data: { status: item.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED" },
    });
  }

  function konfirmasiHapus(item: AdminArticleItem) {
    const ya = window.confirm(`Hapus artikel “${item.title}”? Tindakan ini tidak dapat dibatalkan.`);
    if (ya) hapus.mutate(item.id);
  }

  return (
    <section className="space-y-5" data-testid="halaman-admin-artikel">
      <header>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-white">Kelola artikel</h1>
        <p className="mt-2 text-sm text-[#9d9ac2]">Tulis, terbitkan, dan arsipkan berita serta panduan.</p>
        <button
          type="button"
          data-testid="tambah-artikel"
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
          {formTerbuka ? "Tutup formulir" : "+ Tambah berita"}
        </button>
      </header>

      {formTerbuka ? (
      <form
        onSubmit={kirim}
        data-testid="form-artikel"
        className="mt-6 space-y-4 rounded-[var(--radius-card)] border border-[#26264F] bg-[#161839] p-5"
      >
        <h2 className="text-lg font-bold text-white">
          {sedangEdit ? "Ubah artikel" : "Tulis artikel baru"}
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

          <label className="space-y-1.5">
            <span className="block text-sm font-medium text-white">Kategori</span>
            <select
              value={form.category}
              onChange={(e) => setForm((s) => ({ ...s, category: e.target.value as ArticleCategory }))}
              className="w-full rounded-[var(--radius-control)] border border-[#26264F] bg-[#161839] px-3 py-2.5 text-sm"
            >
              {Object.entries(LABEL_KATEGORI).map(([nilai, label]) => (
                <option key={nilai} value={nilai}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1.5">
            <span className="block text-sm font-medium text-white">Status</span>
            <select
              value={form.status}
              onChange={(e) =>
                setForm((s) => ({ ...s, status: e.target.value as "DRAFT" | "PUBLISHED" }))
              }
              className="w-full rounded-[var(--radius-control)] border border-[#26264F] bg-[#161839] px-3 py-2.5 text-sm"
            >
              <option value="DRAFT">Draf</option>
              <option value="PUBLISHED">Terbit</option>
            </select>
          </label>
        </div>

        <Field
          label="Ringkasan"
          name="excerpt"
          value={form.excerpt}
          onChange={(e) => ubahField("excerpt", e.target.value)}
          petunjuk="Tampil di daftar artikel. Maksimal 500 karakter."
        />

        <TextArea
          label="Isi artikel"
          name="content"
          rows={8}
          required
          value={form.content}
          onChange={(e) => ubahField("content", e.target.value)}
        />

        <Field
          label="URL ilustrasi"
          name="thumbnailUrl"
          value={form.thumbnailUrl}
          onChange={(e) => ubahField("thumbnailUrl", e.target.value)}
          petunjuk="Opsional. Harus diawali http:// atau https://."
        />

        <Field
          label="Waktu terbit"
          name="publishedAt"
          type="datetime-local"
          value={form.publishedAt}
          onChange={(e) => ubahField("publishedAt", e.target.value)}
          petunjuk="Kosongkan bila artikel terbit saat disimpan."
        />

        {galat ? (
          <p role="alert" data-testid="galat-form-artikel" className="text-sm font-medium text-danger">
            {extractApiError(galat).message}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={buat.isPending || ubah.isPending}
            data-testid="simpan-artikel"
            className="rounded-[var(--radius-control)] bg-[#7138F5] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {sedangEdit ? "Simpan perubahan" : "Terbitkan artikel"}
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
          placeholder="Cari judul artikel…"
          data-testid="cari-artikel"
          className="rounded-[var(--radius-control)] border border-[#26264F] bg-[#161839] px-3 py-2.5 text-sm"
        />

        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as "" | "DRAFT" | "PUBLISHED");
            setPage(1);
          }}
          data-testid="filter-status-artikel"
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
          <EmptyState
            judul="Belum ada artikel"
            deskripsi="Belum ada artikel yang cocok dengan filter."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm" data-testid="tabel-artikel">
              <thead>
                <tr className="border-b border-[#26264F] text-xs uppercase tracking-wide text-[#9d9ac2]">
                  <th className="py-2 pr-3">Judul</th>
                  <th className="py-2 pr-3">Kategori</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Terbit</th>
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
                    <td className="py-3 pr-3 text-[#cbc5e6]">
                      {LABEL_KATEGORI[item.category] ?? item.category}
                    </td>
                    <td className="py-3 pr-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${WARNA_STATUS[item.status]}`}
                      >
                        {LABEL_STATUS[item.status]}
                      </span>
                    </td>
                    <td className="py-3 pr-3 text-xs text-[#9d9ac2]">{formatTanggal(item.publishedAt)}</td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          data-testid={`ubah-artikel-${item.slug}`}
                          onClick={() => isiForm(item)}
                          className="rounded-[var(--radius-control)] border border-[#26264F] bg-[#161839] px-2.5 py-1.5 text-xs font-semibold text-white"
                        >
                          Ubah
                        </button>
                        <button
                          type="button"
                          data-testid={`terbit-artikel-${item.slug}`}
                          onClick={() => toggleTerbit(item)}
                          className="rounded-[var(--radius-control)] border border-[#26264F] bg-[#161839] px-2.5 py-1.5 text-xs font-semibold text-white"
                        >
                          {item.status === "PUBLISHED" ? "Tarik jadi draf" : "Terbitkan"}
                        </button>
                        <button
                          type="button"
                          data-testid={`hapus-artikel-${item.slug}`}
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
