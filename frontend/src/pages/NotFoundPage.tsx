import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <section className="playora-container py-20 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-muted">
        404
      </p>
      <h1 className="mt-2 text-2xl font-bold text-navy-800 sm:text-3xl">
        Halaman tidak ditemukan
      </h1>
      <p className="mt-3 text-sm text-muted">
        Alamat yang Anda buka tidak tersedia atau sudah dipindahkan.
      </p>
      <Link
        to="/"
        className="mt-6 inline-block rounded-[var(--radius-control)] bg-[#7138F5] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#4B1DB8]"
      >
        Kembali ke Beranda
      </Link>
    </section>
  );
}
