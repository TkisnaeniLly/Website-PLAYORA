import axios from "axios";
import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { TournamentForm } from "@/components/ui/TournamentForm";
import { useSubmissionDetail, useUpdateSubmission } from "@/hooks/useSubmissions";
import { extractApiError } from "@/lib/api";
import {
  LABEL_STATUS_PENGAJUAN,
  WARNA_STATUS_PENGAJUAN,
  dapatDiajukanUlang,
} from "@/lib/submissions";
import { formatRentangTanggal, formatTanggal } from "@/lib/tournaments";
import type { SubmissionFormValues } from "@/types/submissions";

export function SubmissionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const detail = useSubmissionDetail(id);
  const perbarui = useUpdateSubmission(id ?? "");
  const [modeEdit, setModeEdit] = useState(false);

  const awal = useMemo<Partial<SubmissionFormValues> | undefined>(() => {
    if (!detail.data) return undefined;
    return {
      title: detail.data.title,
      gameId: detail.data.game.id,
      organizerName: detail.data.organizerName,
      description: detail.data.description,
      startDate: detail.data.startDate.slice(0, 10),
      endDate: detail.data.endDate.slice(0, 10),
      registrationDeadline: detail.data.registrationDeadline?.slice(0, 10) ?? "",
      format: detail.data.format ?? "",
      teamCount: detail.data.teamCount ?? 16,
      prizePool: detail.data.prizePool ?? "",
      requirements: detail.data.requirements ?? "",
      registrationMethod: detail.data.registrationMethod ?? "",
      registrationUrl: detail.data.registrationUrl ?? "",
      contact: detail.data.contact ?? "",
    };
  }, [detail.data]);

  const tidakDitemukan =
    axios.isAxiosError(detail.error) && detail.error.response?.status === 404;

  if (detail.isPending) {
    return (
      <section className="playora-container py-10" data-testid="loading-state">
        <div className="h-8 w-2/3 animate-pulse rounded bg-navy-100" />
        <div className="mt-4 h-40 animate-pulse rounded-[var(--radius-card)] bg-navy-100" />
      </section>
    );
  }

  if (tidakDitemukan) {
    return (
      <section className="playora-container py-20 text-center">
        <h1 className="text-2xl font-bold text-navy-800">Pengajuan tidak ditemukan</h1>
        <p className="mt-2 text-sm text-muted">
          Pengajuan ini tidak tersedia atau bukan milik Anda.
        </p>
        <Link
          to="/tournaments/submissions"
          className="mt-6 inline-block rounded-[var(--radius-control)] bg-[#7138F5] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#4B1DB8]"
        >
          Kembali
        </Link>
      </section>
    );
  }

  if (detail.isError || !detail.data) {
    return (
      <section className="playora-container py-20 text-center">
        <h1 className="text-xl font-bold text-danger">Gagal memuat pengajuan</h1>
        <p className="mt-2 text-sm text-muted">
          {detail.error ? extractApiError(detail.error).message : "Terjadi kesalahan."}
        </p>
      </section>
    );
  }

  const pengajuan = detail.data;

  function kirimPerbaikan(values: SubmissionFormValues) {
    perbarui.mutate(values, {
      onSuccess: () => {
        setModeEdit(false);
        void detail.refetch();
      },
    });
  }

  return (
    <section className="playora-container py-6 sm:py-8">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/tournaments/submissions"
          className="text-xs font-semibold uppercase tracking-widest text-navy-600"
        >
          ← Pengajuan saya
        </Link>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span
            data-testid="status-pengajuan"
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${WARNA_STATUS_PENGAJUAN[pengajuan.status]}`}
          >
            {LABEL_STATUS_PENGAJUAN[pengajuan.status]}
          </span>
          <span className="text-xs text-muted">{pengajuan.game.title}</span>
        </div>

        <h1 data-testid="judul-pengajuan" className="mt-2 text-2xl font-extrabold text-navy-800">
          {pengajuan.title}
        </h1>

        {pengajuan.adminNote ? (
          <div
            data-testid="catatan-admin"
            className="mt-4 rounded-[var(--radius-card)] border border-warning/30 bg-warning/10 px-4 py-3"
          >
            <p className="text-xs font-bold uppercase tracking-wide text-navy-700">
              Catatan admin
            </p>
            <p className="mt-1 text-sm text-navy-800">{pengajuan.adminNote}</p>
            {pengajuan.reviewer ? (
              <p className="mt-1 text-xs text-muted">
                Oleh {pengajuan.reviewer.name}
                {pengajuan.reviewedAt ? ` · ${formatTanggal(pengajuan.reviewedAt)}` : ""}
              </p>
            ) : null}
          </div>
        ) : null}

        {pengajuan.status === "APPROVED" ? (
          <div className="mt-4 rounded-[var(--radius-card)] border border-success/30 bg-success/10 px-4 py-3 text-sm text-navy-800">
            Pengajuan disetujui. Data penting tidak dapat diubah lagi; hubungi admin bila
            perlu koreksi.
            {pengajuan.tournament ? (
              <>
                {" "}
                {pengajuan.tournament.isPublished ? (
                  <Link
                    to={`/tournaments/${pengajuan.tournament.slug}`}
                    className="font-semibold text-navy-700 underline"
                  >
                    Lihat turnamen publik
                  </Link>
                ) : (
                  <span className="text-muted">Menunggu publikasi admin.</span>
                )}
                {" · "}
                <Link
                  to={`/tournaments/${pengajuan.tournament.id}/results/manage`}
                  data-testid="kelola-hasil-penyelenggara"
                  className="font-semibold text-navy-700 underline"
                >
                  Kelola hasil
                </Link>
              </>
            ) : null}
          </div>
        ) : null}

        {modeEdit && dapatDiajukanUlang(pengajuan.status) ? (
          <div className="mt-6">
            <h2 className="mb-3 text-lg font-bold text-navy-800">Perbaiki pengajuan</h2>
            <TournamentForm
              awal={awal}
              labelTombol="Simpan dan kirim ulang"
              sedangProses={perbarui.isPending}
              galat={perbarui.error}
              onSubmit={kirimPerbaikan}
            />
          </div>
        ) : (
          <div className="mt-6 space-y-4 rounded-[var(--radius-card)] border border-line bg-white p-6">
            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted">Penyelenggara</dt>
                <dd className="mt-0.5 font-medium text-ink">{pengajuan.organizerName}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted">Jadwal</dt>
                <dd className="mt-0.5 font-medium text-ink">
                  {formatRentangTanggal(pengajuan.startDate, pengajuan.endDate)}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted">Format</dt>
                <dd className="mt-0.5 font-medium text-ink">{pengajuan.format ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted">Jumlah tim</dt>
                <dd className="mt-0.5 font-medium text-ink">
                  {pengajuan.teamCount ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted">Hadiah</dt>
                <dd className="mt-0.5 font-medium text-ink">{pengajuan.prizePool ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted">
                  Batas pendaftaran
                </dt>
                <dd className="mt-0.5 font-medium text-ink">
                  {formatTanggal(pengajuan.registrationDeadline)}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted">
                  Metode pendaftaran
                </dt>
                <dd className="mt-0.5 font-medium text-ink">
                  {pengajuan.registrationMethod ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted">Kontak</dt>
                <dd className="mt-0.5 break-words font-medium text-ink">
                  {pengajuan.contact ?? "—"}
                </dd>
              </div>
            </dl>

            {pengajuan.registrationUrl ? (
              <p className="break-words text-sm text-navy-700">
                Tautan:{" "}
                <a
                  href={pengajuan.registrationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  {pengajuan.registrationUrl}
                </a>
              </p>
            ) : null}

            <div>
              <h2 className="text-sm font-bold uppercase tracking-wide text-muted">
                Deskripsi
              </h2>
              <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-ink">
                {pengajuan.description}
              </p>
            </div>

            {pengajuan.requirements ? (
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wide text-muted">
                  Persyaratan
                </h2>
                <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-ink">
                  {pengajuan.requirements}
                </p>
              </div>
            ) : null}

            {dapatDiajukanUlang(pengajuan.status) ? (
              <div className="flex flex-wrap gap-2 border-t border-line pt-4">
                <button
                  type="button"
                  onClick={() => setModeEdit(true)}
                  className="rounded-[var(--radius-control)] bg-[#7138F5] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#4B1DB8]"
                >
                  Perbaiki dan kirim ulang
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/tournaments/submissions")}
                  className="rounded-[var(--radius-control)] border border-line px-4 py-2.5 text-sm font-medium text-navy-800"
                >
                  Kembali
                </button>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}
