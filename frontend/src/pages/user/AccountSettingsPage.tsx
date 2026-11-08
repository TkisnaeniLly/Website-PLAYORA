import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Link } from "react-router-dom";
import { Field } from "@/components/ui/Field";
import { TextArea } from "@/components/ui/TextArea";
import {
  useChangePassword,
  useProfile,
  useUpdateProfile,
} from "@/hooks/useAccount";
import { useUploadAvatar, useUploadStatus } from "@/hooks/useUploads";
import { extractApiError } from "@/lib/api";
import { bacaSebagaiDataUrl } from "@/lib/uploads";

export function AccountSettingsPage() {
  const profil = useProfile();
  const simpanProfil = useUpdateProfile();
  const gantiSandi = useChangePassword();
  const statusUnggah = useUploadStatus();
  const unggahAvatar = useUploadAvatar();

  const [nama, setNama] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [galatUnggah, setGalatUnggah] = useState<string | null>(null);
  const [suksesUnggah, setSuksesUnggah] = useState(false);

  const [sandiLama, setSandiLama] = useState("");
  const [sandiBaru, setSandiBaru] = useState("");
  const [konfirmasi, setKonfirmasi] = useState("");

  useEffect(() => {
    if (!profil.data) return;
    setNama(profil.data.name);
    setUsername(profil.data.username);
    setBio(profil.data.bio ?? "");
    setAvatarUrl(profil.data.avatarUrl ?? "");
  }, [profil.data]);

  const galatProfil = simpanProfil.error ? extractApiError(simpanProfil.error) : null;
  const galatSandi = gantiSandi.error ? extractApiError(gantiSandi.error) : null;

  function pesanField(namaField: string): string | undefined {
    return galatProfil?.details.find((d) => d.field === namaField)?.message;
  }

  function simpan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    simpanProfil.mutate({ name: nama, username, bio, avatarUrl });
  }

  function ubahSandi(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    gantiSandi.mutate(
      { currentPassword: sandiLama, newPassword: sandiBaru, confirmPassword: konfirmasi },
      {
        onSuccess: () => {
          setSandiLama("");
          setSandiBaru("");
          setKonfirmasi("");
        },
      },
    );
  }

  function pesanSandi(namaField: string): string | undefined {
    return galatSandi?.details.find((d) => d.field === namaField)?.message;
  }

  async function pilihBerkas(event: ChangeEvent<HTMLInputElement>) {
    const berkas = event.target.files?.[0];
    event.target.value = "";
    if (!berkas) return;

    setGalatUnggah(null);
    setSuksesUnggah(false);

    try {
      const dataUrl = await bacaSebagaiDataUrl(berkas);
      const hasil = await unggahAvatar.mutateAsync(dataUrl);
      setAvatarUrl(hasil.url);
      setSuksesUnggah(true);
    } catch (error) {
      setGalatUnggah(
        error instanceof Error ? error.message : extractApiError(error).message,
      );
    }
  }

  if (profil.isPending) {
    return (
      <section className="playora-container py-10" data-testid="loading-state">
        <div className="h-8 w-1/3 animate-pulse rounded bg-navy-100" />
        <div className="mt-4 h-56 animate-pulse rounded-[var(--radius-card)] bg-navy-100" />
      </section>
    );
  }

  if (profil.isError || !profil.data) {
    return (
      <section className="playora-container py-20 text-center">
        <h1 className="text-xl font-bold text-danger">Gagal memuat profil</h1>
        <p className="mt-2 text-sm text-muted">
          {profil.error ? extractApiError(profil.error).message : "Terjadi kesalahan."}
        </p>
      </section>
    );
  }

  return (
    <section className="playora-container py-6 sm:py-8" data-testid="pengaturan-akun">
      <div className="mx-auto max-w-2xl">
        <Link
          to="/notifications"
          className="text-xs font-semibold uppercase tracking-widest text-navy-600"
        >
          ← Notifikasi
        </Link>

        <h1 className="mt-3 pl-title">
          Pengaturan akun
        </h1>
        <p className="mt-2 text-sm text-muted">
          Kelola informasi profil dan kata sandi akun Anda.
        </p>

        <p
          data-testid="info-email"
          className="mt-4 rounded-[var(--radius-control)] bg-navy-50 px-3 py-2 text-xs text-navy-700"
        >
          Email <span className="font-semibold">{profil.data.email}</span> tidak dapat diubah
          pada tahap ini karena memerlukan verifikasi email.
        </p>

        <nav
          aria-label="Menu akun"
          data-testid="menu-akun"
          className="mt-4 grid gap-2 sm:grid-cols-3"
        >
          <Link
            to="/profile/favorites"
            className="rounded-[var(--radius-control)] border border-line bg-white px-3 py-2.5 text-sm font-semibold text-navy-800 hover:bg-navy-50"
          >
            Favorit saya
          </Link>
          <Link
            to="/profile/bookmarks"
            className="rounded-[var(--radius-control)] border border-line bg-white px-3 py-2.5 text-sm font-semibold text-navy-800 hover:bg-navy-50"
          >
            Artikel tersimpan
          </Link>
          <Link
            to="/notifications"
            className="rounded-[var(--radius-control)] border border-line bg-white px-3 py-2.5 text-sm font-semibold text-navy-800 hover:bg-navy-50"
          >
            Notifikasi
          </Link>
        </nav>

        <form
          onSubmit={simpan}
          noValidate
          data-testid="form-profil"
          className="mt-6 space-y-5 rounded-[var(--radius-card)] border border-line bg-white p-6"
        >
          <h2 className="text-lg font-bold text-navy-800">Informasi profil</h2>

          {galatProfil && galatProfil.details.length === 0 ? (
            <div
              role="alert"
              data-testid="galat-profil"
              className="rounded-[var(--radius-control)] border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger"
            >
              {galatProfil.message}
            </div>
          ) : null}

          {simpanProfil.isSuccess ? (
            <div
              data-testid="sukses-profil"
              className="rounded-[var(--radius-control)] border border-success/30 bg-success/10 px-3 py-2 text-sm text-navy-800"
            >
              Profil tersimpan.
            </div>
          ) : null}

          <Field
            label="Nama"
            name="name"
            required
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            galat={pesanField("name")}
          />

          <Field
            label="Username"
            name="username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            galat={pesanField("username")}
            petunjuk="Huruf kecil, angka, dan garis bawah."
          />

          <Field
            label="URL avatar"
            name="avatarUrl"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            galat={pesanField("avatarUrl")}
            placeholder="https://..."
            petunjuk="Opsional. Harus diawali http:// atau https://."
          />

          {statusUnggah.data?.aktif ? (
            <div className="rounded-[var(--radius-control)] bg-navy-50 px-3 py-2" data-testid="unggah-avatar">
              <label className="block text-xs font-semibold uppercase tracking-wide text-navy-700">
                Unggah avatar
              </label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(e) => void pilihBerkas(e)}
                className="mt-2 block w-full text-xs text-navy-800 file:mr-3 file:rounded-[var(--radius-control)] file:border-0 file:bg-[#7138F5] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
              />
              <p className="mt-1 text-[11px] text-muted">Maksimal 2 MB. Unggahan menyimpan tautan ke kolom URL avatar.</p>

              {galatUnggah ? (
                <p role="alert" className="mt-2 text-xs font-medium text-danger">
                  {galatUnggah}
                </p>
              ) : null}

              {suksesUnggah ? (
                <p className="mt-2 text-xs font-medium text-success">
                  Avatar terunggah. Tekan “Simpan profil” untuk menyimpan tautannya.
                </p>
              ) : null}
            </div>
          ) : null}

          <TextArea
            label="Bio"
            name="bio"
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            galat={pesanField("bio")}
            petunjuk="Maksimal 500 karakter."
          />

          <button
            type="submit"
            disabled={simpanProfil.isPending}
            data-testid="simpan-profil"
            className="w-full rounded-[var(--radius-control)] bg-[#7138F5] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#4B1DB8] disabled:opacity-60"
          >
            {simpanProfil.isPending ? "Menyimpan…" : "Simpan profil"}
          </button>
        </form>

        <form
          onSubmit={ubahSandi}
          noValidate
          data-testid="form-sandi"
          className="mt-6 space-y-5 rounded-[var(--radius-card)] border border-line bg-white p-6"
        >
          <h2 className="text-lg font-bold text-navy-800">Ganti kata sandi</h2>
          <p className="text-xs text-muted">
            Setelah kata sandi diganti, semua sesi di perangkat lain otomatis dikeluarkan.
          </p>

          {galatSandi && galatSandi.details.length === 0 ? (
            <div
              role="alert"
              data-testid="galat-sandi"
              className="rounded-[var(--radius-control)] border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger"
            >
              {galatSandi.message}
            </div>
          ) : null}

          {gantiSandi.isSuccess ? (
            <div
              data-testid="sukses-sandi"
              className="rounded-[var(--radius-control)] border border-success/30 bg-success/10 px-3 py-2 text-sm text-navy-800"
            >
              Kata sandi diperbarui. Sesi lain telah dikeluarkan.
            </div>
          ) : null}

          <Field
            label="Kata sandi saat ini"
            type="password"
            name="currentPassword"
            autoComplete="current-password"
            required
            value={sandiLama}
            onChange={(e) => setSandiLama(e.target.value)}
            galat={pesanSandi("currentPassword")}
          />

          <Field
            label="Kata sandi baru"
            type="password"
            name="newPassword"
            autoComplete="new-password"
            required
            value={sandiBaru}
            onChange={(e) => setSandiBaru(e.target.value)}
            galat={pesanSandi("newPassword")}
            petunjuk="Minimal 8 karakter, maksimal 72 karakter."
          />

          <Field
            label="Konfirmasi kata sandi baru"
            type="password"
            name="confirmPassword"
            autoComplete="new-password"
            required
            value={konfirmasi}
            onChange={(e) => setKonfirmasi(e.target.value)}
            galat={pesanSandi("confirmPassword")}
          />

          <button
            type="submit"
            disabled={gantiSandi.isPending}
            data-testid="simpan-sandi"
            className="w-full rounded-[var(--radius-control)] bg-[#7138F5] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#4B1DB8] disabled:opacity-60"
          >
            {gantiSandi.isPending ? "Memproses…" : "Ganti kata sandi"}
          </button>
        </form>
      </div>
    </section>
  );
}
