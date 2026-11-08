import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { useChangeRequests, useCreateChangeRequest } from "@/hooks/useChangeRequests";
import { extractApiError } from "@/lib/api";
import {
  LABEL_STATUS_PERUBAHAN,
  WARNA_STATUS_PERUBAHAN,
  ringkasPerubahan,
} from "@/lib/change";
import type { ChangeRequestInput } from "@/types/change";

const AWAL = {
  title: "",
  organizerName: "",
  description: "",
  startDate: "",
  endDate: "",
  registrationDeadline: "",
  registrationUrl: "",
  contact: "",
  format: "",
  teamCount: "",
  registrationMethod: "",
  prizePool: "",
  requirements: "",
  message: "",
};

export function TournamentChangeRequestPage() {
  const { id } = useParams<{ id: string }>();
  const riwayat = useChangeRequests(id);
  const ajukan = useCreateChangeRequest(id ?? "");

  const [form, setForm] = useState(AWAL);

  const items = riwayat.data ?? [];
  const menunggu = items.some((item) => item.status === "PENDING");
  const galat = ajukan.error ? extractApiError(ajukan.error) : null;

  function ubah(nama: keyof typeof AWAL, nilai: string) {
    setForm((sebelumnya) => ({ ...sebelumnya, [nama]: nilai }));
  }

  function kirim(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload: ChangeRequestInput = { message: form.message.trim() };

    if (form.title.trim()) payload.title = form.title.trim();
    if (form.organizerName.trim()) payload.organizerName = form.organizerName.trim();
    if (form.description.trim()) payload.description = form.description.trim();
    if (form.startDate) payload.startDate = new Date(form.startDate).toISOString();
    if (form.endDate) payload.endDate = new Date(form.endDate).toISOString();
    if (form.registrationDeadline)
      payload.registrationDeadline = new Date(form.registrationDeadline).toISOString();
    if (form.registrationUrl.trim()) payload.registrationUrl = form.registrationUrl.trim();
    if (form.contact.trim()) payload.contact = form.contact.trim();
    if (form.format.trim()) payload.format = form.format.trim();
    if (form.teamCount.trim()) payload.teamCount = Number(form.teamCount);
    if (form.registrationMethod.trim())
      payload.registrationMethod = form.registrationMethod.trim();
    if (form.prizePool.trim()) payload.prizePool = form.prizePool.trim();
    if (form.requirements.trim()) payload.requirements = form.requirements.trim();

    ajukan.mutate(payload, { onSuccess: () => setForm(AWAL) });
  }

  return (
    <section className="playora-container py-6 sm:py-8" data-testid="halaman-perubahan-turnamen">
      <Link to="/tournaments/submissions" className="pl-link">
        ← Pengajuan saya
      </Link>

      <header className="mt-3">
        <span className="pl-eyebrow">Perubahan turnamen</span>
        <h1 className="pl-title mt-3">Ajukan perubahan informasi</h1>
        <p className="mt-2 max-w-2xl text-sm text-navy-400">
          Informasi turnamen yang sudah disetujui tidak dapat diubah langsung. Isi formulir ini
          agar admin meninjau perubahan yang Anda minta.
        </p>
      </header>

      {menunggu ? (
        <p
          data-testid="menunggu-tinjauan"
          className="mt-4 rounded-[var(--radius-control)] border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-warning"
        >
          Masih ada permintaan yang menunggu tinjauan admin. Tunggu keputusan sebelum mengirim
          permintaan baru.
        </p>
      ) : null}

      <form
        onSubmit={kirim}
        data-testid="form-perubahan"
        className="mt-5 space-y-4 rounded-[var(--radius-card)] border border-line bg-gradient-to-br from-[#171a34] to-[#111528] p-5"
      >
        <h2 className="text-base font-bold text-white">Informasi yang ingin diubah</h2>
        <p className="text-xs text-navy-400">
          Isi hanya kolom yang perlu diubah. Kolom kosong diabaikan.
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1.5">
            <span className="block text-sm font-medium text-navy-200">Judul turnamen</span>
            <input
              value={form.title}
              onChange={(e) => ubah("title", e.target.value)}
              className="pl-input"
              placeholder="Biarkan kosong bila tidak berubah"
            />
          </label>

          <label className="space-y-1.5">
            <span className="block text-sm font-medium text-navy-200">Penyelenggara</span>
            <input
              value={form.organizerName}
              onChange={(e) => ubah("organizerName", e.target.value)}
              className="pl-input"
              placeholder="Nama penyelenggara baru"
            />
          </label>

          <label className="space-y-1.5">
            <span className="block text-sm font-medium text-navy-200">Tanggal mulai</span>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => ubah("startDate", e.target.value)}
              className="pl-input"
            />
          </label>

          <label className="space-y-1.5">
            <span className="block text-sm font-medium text-navy-200">Tanggal selesai</span>
            <input
              type="date"
              value={form.endDate}
              onChange={(e) => ubah("endDate", e.target.value)}
              className="pl-input"
            />
          </label>

          <label className="space-y-1.5">
            <span className="block text-sm font-medium text-navy-200">Batas pendaftaran</span>
            <input
              type="date"
              value={form.registrationDeadline}
              onChange={(e) => ubah("registrationDeadline", e.target.value)}
              className="pl-input"
            />
          </label>

          <label className="space-y-1.5">
            <span className="block text-sm font-medium text-navy-200">Jumlah tim</span>
            <input
              type="number"
              min={2}
              max={512}
              value={form.teamCount}
              onChange={(e) => ubah("teamCount", e.target.value)}
              className="pl-input"
              placeholder="Contoh: 16"
            />
          </label>

          <label className="space-y-1.5">
            <span className="block text-sm font-medium text-navy-200">URL pendaftaran</span>
            <input
              value={form.registrationUrl}
              onChange={(e) => ubah("registrationUrl", e.target.value)}
              className="pl-input"
              placeholder="https://…"
            />
          </label>

          <label className="space-y-1.5">
            <span className="block text-sm font-medium text-navy-200">Kontak</span>
            <input
              value={form.contact}
              onChange={(e) => ubah("contact", e.target.value)}
              className="pl-input"
              placeholder="Email / WhatsApp"
            />
          </label>

          <label className="space-y-1.5">
            <span className="block text-sm font-medium text-navy-200">Format</span>
            <input
              value={form.format}
              onChange={(e) => ubah("format", e.target.value)}
              className="pl-input"
              placeholder="Contoh: 5v5 single elimination"
            />
          </label>

          <label className="space-y-1.5">
            <span className="block text-sm font-medium text-navy-200">Metode pendaftaran</span>
            <input
              value={form.registrationMethod}
              onChange={(e) => ubah("registrationMethod", e.target.value)}
              className="pl-input"
              placeholder="Contoh: Online"
            />
          </label>

          <label className="space-y-1.5">
            <span className="block text-sm font-medium text-navy-200">Hadiah</span>
            <input
              value={form.prizePool}
              onChange={(e) => ubah("prizePool", e.target.value)}
              className="pl-input"
              placeholder="Contoh: Rp10.000.000"
            />
          </label>
        </div>

        <label className="block space-y-1.5">
          <span className="block text-sm font-medium text-navy-200">Deskripsi</span>
          <textarea
            value={form.description}
            onChange={(e) => ubah("description", e.target.value)}
            rows={3}
            className="pl-input"
            placeholder="Deskripsi turnamen (bila berubah)"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="block text-sm font-medium text-navy-200">Persyaratan</span>
          <textarea
            value={form.requirements}
            onChange={(e) => ubah("requirements", e.target.value)}
            rows={2}
            className="pl-input"
            placeholder="Persyaratan peserta (bila berubah)"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="block text-sm font-medium text-navy-200">
            Alasan perubahan <span className="text-danger">*</span>
          </span>
          <textarea
            value={form.message}
            onChange={(e) => ubah("message", e.target.value)}
            rows={3}
            required
            minLength={10}
            className="pl-input"
            placeholder="Jelaskan alasan perubahan agar admin mudah meninjau."
          />
        </label>

        {galat ? (
          <p role="alert" className="text-sm font-medium text-danger">
            {galat.message}
            {galat.details.length > 0 ? ` — ${galat.details[0]?.message}` : ""}
          </p>
        ) : null}

        {ajukan.isSuccess ? (
          <p className="text-sm font-medium text-success">
            Permintaan terkirim. Admin akan meninjau perubahan Anda.
          </p>
        ) : null}

        <button
          type="submit"
          disabled={ajukan.isPending || menunggu}
          data-testid="kirim-perubahan"
          className="pl-btn"
        >
          {ajukan.isPending ? "Mengirim…" : "Kirim permintaan perubahan"}
        </button>
      </form>

      <section className="mt-8">
        <h2 className="pl-section-title">Riwayat permintaan</h2>

        <div className="mt-3 space-y-2">
          {riwayat.isPending ? (
            <div data-testid="loading-state" className="h-24 animate-pulse rounded-[var(--radius-card)] bg-[#1d1b36]" />
          ) : riwayat.isError ? (
            <ErrorState
              pesan={riwayat.error ? extractApiError(riwayat.error).message : "Terjadi kesalahan."}
              onRetry={() => void riwayat.refetch()}
            />
          ) : items.length === 0 ? (
            <EmptyState judul="Belum ada permintaan" deskripsi="Riwayat perubahan akan muncul di sini." />
          ) : (
            items.map((item) => (
              <article
                key={item.id}
                data-testid="riwayat-perubahan"
                className="rounded-[var(--radius-card)] border border-line bg-[#111528] p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-navy-400">
                    {new Date(item.createdAt).toLocaleString("id-ID")}
                  </p>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${WARNA_STATUS_PERUBAHAN[item.status]}`}
                  >
                    {LABEL_STATUS_PERUBAHAN[item.status]}
                  </span>
                </div>

                <p className="mt-2 text-sm text-navy-200">{item.message}</p>

                <ul className="mt-2 space-y-0.5 text-xs text-navy-400">
                  {ringkasPerubahan(item.payload as Record<string, unknown>).map((baris) => (
                    <li key={baris}>• {baris}</li>
                  ))}
                </ul>

                {item.adminNote ? (
                  <p className="mt-2 text-xs text-warning">Catatan admin: {item.adminNote}</p>
                ) : null}
              </article>
            ))
          )}
        </div>
      </section>
    </section>
  );
}
