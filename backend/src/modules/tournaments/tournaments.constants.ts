export type TournamentStatus = "upcoming" | "ongoing" | "finished";

export const SEMUA_STATUS: readonly TournamentStatus[] = [
  "upcoming",
  "ongoing",
  "finished",
];

export const LABEL_STATUS: Record<TournamentStatus, string> = {
  upcoming: "Mendatang",
  ongoing: "Berlangsung",
  finished: "Selesai",
};

/**
 * Kolom `start_date`/`end_date` bertipe DATE (tanpa jam). Perbandingan memakai
 * awal hari ini agar turnamen yang berakhir hari ini masih dianggap berlangsung,
 * bukan langsung "selesai" pada tengah malam.
 */
export function awalHariIni(sekarang: Date = new Date()): Date {
  return new Date(
    Date.UTC(sekarang.getUTCFullYear(), sekarang.getUTCMonth(), sekarang.getUTCDate()),
  );
}

export function statusDariTanggal(
  startDate: Date,
  endDate: Date,
  sekarang: Date = new Date(),
): TournamentStatus {
  const hariIni = awalHariIni(sekarang);

  if (startDate > hariIni) return "upcoming";
  if (endDate < hariIni) return "finished";
  return "ongoing";
}
