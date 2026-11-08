import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Field } from "./Field";
import { TextArea } from "./TextArea";
import { useGames } from "@/hooks/useGames";
import { extractApiError } from "@/lib/api";
import type { SubmissionFormValues } from "@/types/submissions";

export interface TournamentFormProps {
  awal?: Partial<SubmissionFormValues>;
  labelTombol: string;
  sedangProses: boolean;
  galat: unknown;
  onSubmit: (values: SubmissionFormValues) => void;
}

const KOSONG: SubmissionFormValues = {
  title: "",
  gameId: "",
  organizerName: "",
  description: "",
  startDate: "",
  endDate: "",
  registrationDeadline: "",
  format: "",
  teamCount: 16,
  prizePool: "",
  requirements: "",
  registrationMethod: "",
  registrationUrl: "",
  contact: "",
};

export function TournamentForm({
  awal,
  labelTombol,
  sedangProses,
  galat,
  onSubmit,
}: TournamentFormProps) {
  const [nilai, setNilai] = useState<SubmissionFormValues>({ ...KOSONG, ...awal });
  const katalog = useGames({ page: 1, limit: 48 });

  useEffect(() => {
    if (awal) setNilai((sebelumnya) => ({ ...sebelumnya, ...awal }));
  }, [awal]);

  const infoGalat = galat ? extractApiError(galat) : null;

  function pesanField(nama: string): string | undefined {
    return infoGalat?.details.find((d) => d.field === nama)?.message;
  }

  function ubah<K extends keyof SubmissionFormValues>(
    kunci: K,
    nilaiBaru: SubmissionFormValues[K],
  ) {
    setNilai((sebelumnya) => ({ ...sebelumnya, [kunci]: nilaiBaru }));
  }

  function kirim(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(nilai);
  }

  return (
    <form
      onSubmit={kirim}
      noValidate
      data-testid="form-turnamen"
      className="space-y-5 rounded-[var(--radius-card)] border border-line bg-white p-6"
    >
      {infoGalat ? (
        <div
          role="alert"
          data-testid="form-error"
          className="rounded-[var(--radius-control)] border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger"
        >
          {infoGalat.message}
        </div>
      ) : null}

      <Field
        label="Judul turnamen"
        name="title"
        required
        value={nilai.title}
        onChange={(e) => ubah("title", e.target.value)}
        galat={pesanField("title")}
        placeholder="Contoh: Turnamen Kampus Mobile Legends 2027"
      />

      <div className="space-y-1.5">
        <label htmlFor="gameId" className="block text-sm font-medium text-navy-800">
          Game
        </label>
        <select
          id="gameId"
          name="gameId"
          required
          data-testid="select-game"
          value={nilai.gameId}
          onChange={(e) => ubah("gameId", e.target.value)}
          className={[
            "w-full rounded-[var(--radius-control)] border bg-white px-3 py-2.5 text-sm",
            pesanField("gameId") ? "border-danger" : "border-line",
          ].join(" ")}
        >
          <option value="">
            {katalog.isPending ? "Memuat game…" : "Pilih game"}
          </option>
          {(katalog.data?.items ?? []).map((game) => (
            <option key={game.id} value={game.id}>
              {game.title}
            </option>
          ))}
        </select>
        {pesanField("gameId") ? (
          <p className="text-xs font-medium text-danger" role="alert">
            {pesanField("gameId")}
          </p>
        ) : null}
      </div>

      <Field
        label="Nama penyelenggara"
        name="organizerName"
        required
        value={nilai.organizerName}
        onChange={(e) => ubah("organizerName", e.target.value)}
        galat={pesanField("organizerName")}
        placeholder="Contoh: Himpunan Mahasiswa Teknik Informatika"
      />

      <TextArea
        label="Deskripsi turnamen"
        name="description"
        rows={4}
        required
        value={nilai.description}
        onChange={(e) => ubah("description", e.target.value)}
        galat={pesanField("description")}
        petunjuk="Minimal 20 karakter. Jelaskan format dan gambaran umum turnamen."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Field
          label="Tanggal mulai"
          type="date"
          name="startDate"
          required
          value={nilai.startDate}
          onChange={(e) => ubah("startDate", e.target.value)}
          galat={pesanField("startDate")}
        />
        <Field
          label="Tanggal selesai"
          type="date"
          name="endDate"
          required
          value={nilai.endDate}
          onChange={(e) => ubah("endDate", e.target.value)}
          galat={pesanField("endDate")}
        />
        <Field
          label="Batas pendaftaran"
          type="date"
          name="registrationDeadline"
          value={nilai.registrationDeadline ?? ""}
          onChange={(e) => ubah("registrationDeadline", e.target.value)}
          galat={pesanField("registrationDeadline")}
          petunjuk="Opsional."
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Format turnamen"
          name="format"
          required
          value={nilai.format}
          onChange={(e) => ubah("format", e.target.value)}
          galat={pesanField("format")}
          placeholder="Contoh: 5v5, grup + gugur"
        />
        <Field
          label="Jumlah tim"
          type="number"
          name="teamCount"
          min={2}
          max={512}
          required
          value={String(nilai.teamCount)}
          onChange={(e) => ubah("teamCount", Number(e.target.value))}
          galat={pesanField("teamCount")}
          petunjuk="Antara 2 dan 512 tim."
        />
      </div>

      <Field
        label="Hadiah"
        name="prizePool"
        value={nilai.prizePool ?? ""}
        onChange={(e) => ubah("prizePool", e.target.value)}
        galat={pesanField("prizePool")}
        petunjuk="Opsional. Contoh: Rp5.000.000"
      />

      <TextArea
        label="Persyaratan peserta"
        name="requirements"
        rows={3}
        value={nilai.requirements ?? ""}
        onChange={(e) => ubah("requirements", e.target.value)}
        galat={pesanField("requirements")}
        petunjuk="Opsional."
      />

      <Field
        label="Metode pendaftaran"
        name="registrationMethod"
        required
        value={nilai.registrationMethod}
        onChange={(e) => ubah("registrationMethod", e.target.value)}
        galat={pesanField("registrationMethod")}
        placeholder="Contoh: Formulir daring / WhatsApp penyelenggara"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Tautan pendaftaran"
          name="registrationUrl"
          value={nilai.registrationUrl ?? ""}
          onChange={(e) => ubah("registrationUrl", e.target.value)}
          galat={pesanField("registrationUrl")}
          placeholder="https://..."
          petunjuk="Isi salah satu: tautan atau kontak."
        />
        <Field
          label="Kontak penyelenggara"
          name="contact"
          value={nilai.contact ?? ""}
          onChange={(e) => ubah("contact", e.target.value)}
          galat={pesanField("contact")}
          placeholder="Email atau nomor telepon"
        />
      </div>

      <p className="rounded-[var(--radius-control)] bg-navy-50 px-3 py-2 text-xs leading-relaxed text-navy-700">
        Dengan mengirim, pengajuan akan diperiksa administrator. Pendaftaran peserta
        tetap dilakukan langsung melalui penyelenggara, bukan melalui PLAYORA.
      </p>

      <button
        type="submit"
        disabled={sedangProses}
        className="w-full rounded-[var(--radius-control)] bg-[#7138F5] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#4B1DB8] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {sedangProses ? "Mengirim…" : labelTombol}
      </button>
    </form>
  );
}
