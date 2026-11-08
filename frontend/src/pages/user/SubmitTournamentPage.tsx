import { Link, useNavigate } from "react-router-dom";
import { TournamentForm } from "@/components/ui/TournamentForm";
import { useCreateSubmission } from "@/hooks/useSubmissions";
import type { SubmissionFormValues } from "@/types/submissions";

export function SubmitTournamentPage() {
  const navigate = useNavigate();
  const kirim = useCreateSubmission();

  function onSubmit(values: SubmissionFormValues) {
    kirim.mutate(values, {
      onSuccess: (hasil) => {
        navigate(`/tournaments/submissions/${hasil.id}`, { replace: true });
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

        <h1 className="mt-3 pl-title">
          Ajukan turnamen
        </h1>
        <p className="mt-2 text-sm text-muted">
          Lengkapi informasi turnamen. Pengajuan akan diperiksa administrator sebelum
          tampil di direktori publik.
        </p>

        <div className="mt-6">
          <TournamentForm
            labelTombol="Kirim pengajuan"
            sedangProses={kirim.isPending}
            galat={kirim.error}
            onSubmit={onSubmit}
          />
        </div>
      </div>
    </section>
  );
}
