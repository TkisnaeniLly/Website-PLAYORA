import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Field } from "@/components/ui/Field";
import { useAuth } from "@/hooks/useAuth";
import { useManagedResults, useReviewResults, useSubmitResults } from "@/hooks/useManagement";
import { extractApiError } from "@/lib/api";
import {
  LABEL_STATUS_HASIL,
  WARNA_STATUS_HASIL,
  bolehHapusHasil,
  rapikanPeringkat,
  validasiHasilLokal,
} from "@/lib/management";
import type { ResultEntry } from "@/types/management";

const BARIS_KOSONG = (posisi: number): ResultEntry => ({
  position: posisi,
  teamOrPlayer: "",
  note: "",
});

function TinjauBaris({
  tournamentId,
  resultId,
  position,
  onSelesai,
}: {
  tournamentId: string;
  resultId: string;
  position: number;
  onSelesai: () => void;
}) {
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
      { id: tournamentId, resultId, decision, note: catatan.trim() || undefined },
      { onSuccess: onSelesai },
    );
  }

  return (
    <div
      data-testid="tinjau-baris"
      className="mt-3 space-y-2 rounded-[var(--radius-control)] border border-[#26264F] bg-navy-50 p-3"
    >
      <p className="text-[11px] font-bold uppercase tracking-wide text-[#cbc5e6]">
        Tinjau hasil peringkat {position}
      </p>

      <textarea
        data-testid="catatan-baris-input"
        rows={2}
        value={catatan}
        onChange={(e) => setCatatan(e.target.value)}
        placeholder="Catatan (wajib bila menolak)"
        className="w-full rounded-[var(--radius-control)] border border-[#26264F] bg-[#161839] px-3 py-2 text-xs"
      />

      {galatLokal || galat ? (
        <p className="text-xs font-medium text-danger" role="alert">
          {galatLokal ?? galat?.message}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          data-testid="setujui-baris"
          disabled={tinjau.isPending}
          onClick={() => kirim("APPROVED")}
          className="rounded-[var(--radius-control)] bg-success px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
        >
          Setujui
        </button>
        <button
          type="button"
          data-testid="tolak-baris"
          disabled={tinjau.isPending}
          onClick={() => kirim("REJECTED")}
          className="rounded-[var(--radius-control)] bg-danger px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
        >
          Tolak
        </button>
      </div>
    </div>
  );
}

export function ManageResultsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: pengguna } = useAuth();
  const detail = useManagedResults(id);
  const kirim = useSubmitResults(id ?? "");

  const [baris, setBaris] = useState<ResultEntry[]>([]);
  const [galatLokal, setGalatLokal] = useState<string | null>(null);
  const [sukses, setSukses] = useState(false);

  useEffect(() => {
    if (!detail.data) return;
    setBaris(
      detail.data.hasil.length > 0
        ? detail.data.hasil.map((h) => ({
            position: h.position,
            teamOrPlayer: h.teamOrPlayer,
            note: h.note ?? "",
          }))
        : [BARIS_KOSONG(1), BARIS_KOSONG(2), BARIS_KOSONG(3)],
    );
  }, [detail.data]);

  if (detail.isPending) {
    return (
      <section className="space-y-5" data-testid="loading-state">
        <div className="h-8 w-2/3 animate-pulse rounded bg-[#1d1b36]" />
      </section>
    );
  }

  if (detail.isError || !detail.data) {
    const pesan = detail.error ? extractApiError(detail.error).message : "Terjadi kesalahan.";
    return (
      <section className="py-16 text-center">
        <h1 className="text-2xl font-bold text-white">Tidak dapat mengelola hasil</h1>
        <p className="mt-2 text-sm text-[#9d9ac2]">{pesan}</p>
        <Link
          to="/admin/tournaments"
          className="mt-6 inline-block rounded-[var(--radius-control)] bg-[#7138F5] px-5 py-2.5 text-sm font-semibold text-white"
        >
          Kembali ke kelola turnamen
        </Link>
      </section>
    );
  }

  const turnamen = detail.data.turnamen;
  const galatApi = kirim.error ? extractApiError(kirim.error) : null;

  function ubahBaris(indeks: number, kunci: "teamOrPlayer" | "note", nilaiBaru: string) {
    setBaris((sebelumnya) =>
      sebelumnya.map((baris2, i) => (i === indeks ? { ...baris2, [kunci]: nilaiBaru } : baris2)),
    );
    setSukses(false);
  }

  function tambahBaris() {
    setBaris((sebelumnya) => [...sebelumnya, BARIS_KOSONG(sebelumnya.length + 1)]);
  }

  function hapusBaris(indeks: number) {
    setBaris((sebelumnya) => rapikanPeringkat(sebelumnya.filter((_, i) => i !== indeks)));
  }

  function kirimHasil() {
    const dibersihkan = baris
      .filter((b) => b.teamOrPlayer.trim().length > 0)
      .map((b) => ({
        position: b.position,
        teamOrPlayer: b.teamOrPlayer.trim(),
        note: b.note?.trim() ? b.note.trim() : undefined,
      }));

    const galat = validasiHasilLokal(dibersihkan);
    if (galat) {
      setGalatLokal(galat);
      return;
    }

    setGalatLokal(null);
    kirim.mutate(dibersihkan, {
      onSuccess: () => {
        setSukses(true);
        void detail.refetch();
      },
    });
  }

  return (
    <section className="space-y-5" data-testid="manage-results">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/admin/tournaments"
          className="text-xs font-semibold uppercase tracking-widest text-navy-600"
        >
          ← Kelola turnamen
        </Link>

        <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-white">
          Kelola hasil turnamen
        </h1>
        <p className="mt-2 text-sm text-[#9d9ac2]">{turnamen.title}</p>

        <p className="mt-4 rounded-[var(--radius-control)] bg-navy-50 px-3 py-2 text-xs leading-relaxed text-[#cbc5e6]">
          Hanya baris baru atau yang isinya Anda ubah yang masuk <strong>Menunggu Tinjauan</strong>.
          Hasil yang sudah disetujui tetap tampil untuk publik, dan hasil yang ditolak tetap
          ditolak sampai Anda memperbaikinya.
        </p>

        {galatLokal || galatApi ? (
          <div
            role="alert"
            data-testid="form-error"
            className="mt-4 rounded-[var(--radius-control)] border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger"
          >
            {galatLokal ?? galatApi?.message}
          </div>
        ) : null}

        {sukses ? (
          <div
            data-testid="sukses-kirim"
            className="mt-4 rounded-[var(--radius-control)] border border-success/30 bg-success/10 px-3 py-2 text-sm text-white"
          >
            Perubahan tersimpan. Baris baru atau yang diubah menunggu tinjauan administrator.
          </div>
        ) : null}

        <div className="mt-6 space-y-3">
          {baris.map((entri, indeks) => {
            const hasilTersimpan = detail.data?.hasil.find((h) => h.position === entri.position);
            const bolehHapus = bolehHapusHasil(
              hasilTersimpan?.status ?? "PENDING_REVIEW",
              pengguna?.role ?? "USER",
            );

            return (
              <div
                key={indeks}
                data-testid="baris-hasil"
                className="rounded-[var(--radius-card)] border border-[#26264F] bg-[#161839] p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wide text-[#cbc5e6]">
                    Peringkat {indeks + 1}
                  </span>

                  {hasilTersimpan ? (
                    <span
                      data-testid="status-hasil"
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${WARNA_STATUS_HASIL[hasilTersimpan.status]}`}
                    >
                      {LABEL_STATUS_HASIL[hasilTersimpan.status]}
                    </span>
                  ) : null}
                </div>

                {hasilTersimpan?.adminNote ? (
                  <p className="mt-2 rounded-[var(--radius-control)] bg-warning/10 px-3 py-2 text-xs text-white">
                    Catatan admin: {hasilTersimpan.adminNote}
                  </p>
                ) : null}

                {hasilTersimpan?.status === "REJECTED" ? (
                  <p
                    data-testid="petunjuk-perbaikan"
                    className="mt-2 text-xs font-medium text-danger"
                  >
                    Perbaiki baris ini lalu kirim ulang untuk ditinjau.
                  </p>
                ) : null}

                {pengguna?.role === "ADMIN" &&
                hasilTersimpan?.status === "PENDING_REVIEW" ? (
                  <TinjauBaris
                    tournamentId={id ?? ""}
                    resultId={hasilTersimpan.id}
                    position={hasilTersimpan.position}
                    onSelesai={() => void detail.refetch()}
                  />
                ) : null}

                <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                  <Field
                    label="Tim / pemain"
                    name={`team-${indeks}`}
                    value={entri.teamOrPlayer}
                    onChange={(e) => ubahBaris(indeks, "teamOrPlayer", e.target.value)}
                    placeholder="Nama tim"
                  />
                  <Field
                    label="Catatan"
                    name={`note-${indeks}`}
                    value={entri.note ?? ""}
                    onChange={(e) => ubahBaris(indeks, "note", e.target.value)}
                    placeholder="Opsional"
                  />
                  <button
                    type="button"
                    onClick={() => hapusBaris(indeks)}
                    disabled={!bolehHapus}
                    data-testid="hapus-baris"
                    title={
                      bolehHapus
                        ? undefined
                        : "Hasil yang sudah disetujui tidak dapat dihapus. Ubah isinya untuk ditinjau ulang."
                    }
                    className="self-end rounded-[var(--radius-control)] border border-[#26264F] px-3 py-2.5 text-xs font-medium text-danger disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={tambahBaris}
            className="rounded-[var(--radius-control)] border border-[#26264F] px-4 py-2.5 text-sm font-medium text-white"
          >
            Tambah peringkat
          </button>
          <button
            type="button"
            onClick={kirimHasil}
            disabled={kirim.isPending}
            data-testid="kirim-hasil"
            className="rounded-[var(--radius-control)] bg-[#7138F5] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {kirim.isPending ? "Mengirim…" : "Kirim untuk ditinjau"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/tournaments")}
            className="rounded-[var(--radius-control)] border border-[#26264F] px-4 py-2.5 text-sm font-medium text-white"
          >
            Selesai
          </button>
        </div>

        {pengguna?.role !== "ADMIN" ? (
          <p className="mt-4 text-xs text-[#9d9ac2]">
            Anda mengelola sebagai penyelenggara. Persetujuan hasil dilakukan administrator.
          </p>
        ) : null}
      </div>
    </section>
  );
}
