import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { AdminPageHeader, AdminPanel } from "@/components/admin/AdminUI";
import { Field } from "@/components/ui/Field";
import { TextArea } from "@/components/ui/TextArea";
import { useChangePassword, useProfile, useUpdateProfile } from "@/hooks/useAccount";
import { extractApiError } from "@/lib/api";

export function AdminSettingsPage() {
  const profil = useProfile();
  const simpanProfil = useUpdateProfile();
  const gantiSandi = useChangePassword();

  const [nama, setNama] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const [sandiLama, setSandiLama] = useState("");
  const [sandiBaru, setSandiBaru] = useState("");
  const [konfirmasi, setKonfirmasi] = useState("");
  const [pesanSandi, setPesanSandi] = useState<string | null>(null);

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
    return galatProfil?.details.find((detail) => detail.field === namaField)?.message;
  }

  function simpan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    simpanProfil.mutate({ name: nama, username, bio, avatarUrl });
  }

  function ubahSandi(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPesanSandi(null);

    if (sandiBaru !== konfirmasi) {
      setPesanSandi("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    gantiSandi.mutate(
      { currentPassword: sandiLama, newPassword: sandiBaru, confirmPassword: konfirmasi },
      {
        onSuccess: () => {
          setSandiLama("");
          setSandiBaru("");
          setKonfirmasi("");
          setPesanSandi("Kata sandi berhasil diperbarui.");
        },
      },
    );
  }

  return (
    <section className="space-y-5" data-testid="halaman-admin-pengaturan">
      <AdminPageHeader
        judul="Pengaturan"
        deskripsi="Kelola profil administrator dan keamanan akun panel."
      />

      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <AdminPanel className="p-5">
          <h2 className="text-base font-bold text-white">Profil administrator</h2>
          <p className="mt-1 text-xs text-[#8f88b8]">
            Nama dan username tampil pada aktivitas admin di seluruh platform.
          </p>

          {profil.isPending ? (
            <div data-testid="loading-state" className="mt-4 h-32 animate-pulse rounded-xl bg-[#1d1b36]" />
          ) : (
            <form onSubmit={simpan} data-testid="form-profil-admin" className="mt-4 grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Nama lengkap"
                  value={nama}
                  onChange={(event) => setNama(event.target.value)}
                  required
                  maxLength={100}
                  galat={pesanField("name")}
                />
                <Field
                  label="Username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  required
                  maxLength={50}
                  galat={pesanField("username")}
                />
              </div>

              <TextArea
                label="Bio"
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                rows={3}
                maxLength={500}
                placeholder="Ceritakan singkat peranmu di PLAYORA."
              />

              <Field
                label="URL avatar"
                value={avatarUrl}
                onChange={(event) => setAvatarUrl(event.target.value)}
                placeholder="https://..."
                maxLength={500}
                petunjuk="Opsional. Kosongkan untuk memakai inisial nama."
                galat={pesanField("avatarUrl")}
              />

              {galatProfil ? (
                <p role="alert" className="text-xs font-medium text-[#ff647c]">
                  {galatProfil.message}
                </p>
              ) : null}
              {simpanProfil.isSuccess ? (
                <p className="text-xs font-medium text-[#35c98a]">Profil berhasil disimpan.</p>
              ) : null}

              <div className="flex justify-end">
                <button type="submit" disabled={simpanProfil.isPending} className="pl-btn text-xs">
                  {simpanProfil.isPending ? "Menyimpan\u2026" : "Simpan profil"}
                </button>
              </div>
            </form>
          )}
        </AdminPanel>

        <div className="grid gap-4">
          <AdminPanel className="p-5" data-testid="info-akun-admin">
            <h2 className="text-base font-bold text-white">Informasi akun</h2>
            <dl className="mt-3 space-y-3 text-sm">
              <div>
                <dt className="text-[10px] uppercase tracking-wide text-[#8f88b8]">Email</dt>
                <dd className="mt-0.5 break-all font-medium text-white">
                  {profil.data?.email ?? "\u2014"}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-wide text-[#8f88b8]">Peran</dt>
                <dd className="mt-0.5 font-medium text-white">Administrator</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-wide text-[#8f88b8]">Bergabung</dt>
                <dd className="mt-0.5 font-medium text-white">
                  {profil.data
                    ? new Date(profil.data.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "\u2014"}
                </dd>
              </div>
            </dl>
            <p className="mt-4 rounded-xl bg-[#11132B] p-3 text-[11px] leading-relaxed text-[#8f88b8]">
              Email tidak dapat diubah dari panel. Hubungi pemilik sistem bila perlu
              mengganti alamat email administrator.
            </p>
          </AdminPanel>

          <AdminPanel className="p-5">
            <h2 className="text-base font-bold text-white">Ganti kata sandi</h2>
            <p className="mt-1 text-xs text-[#8f88b8]">
              Semua sesi lain akan dikeluarkan setelah kata sandi berubah.
            </p>

            <form onSubmit={ubahSandi} data-testid="form-sandi-admin" className="mt-4 grid gap-3">
              <Field
                label="Kata sandi saat ini"
                type="password"
                autoComplete="current-password"
                value={sandiLama}
                onChange={(event) => setSandiLama(event.target.value)}
                required
              />
              <Field
                label="Kata sandi baru"
                type="password"
                autoComplete="new-password"
                value={sandiBaru}
                onChange={(event) => setSandiBaru(event.target.value)}
                required
                minLength={8}
                maxLength={72}
              />
              <Field
                label="Ulangi kata sandi baru"
                type="password"
                autoComplete="new-password"
                value={konfirmasi}
                onChange={(event) => setKonfirmasi(event.target.value)}
                required
                minLength={8}
                maxLength={72}
              />

              {pesanSandi ? (
                <p
                  role="alert"
                  className={[
                    "text-xs font-medium",
                    pesanSandi.startsWith("Kata sandi berhasil") ? "text-[#35c98a]" : "text-[#ff647c]",
                  ].join(" ")}
                >
                  {pesanSandi}
                </p>
              ) : null}

              {galatSandi ? (
                <p role="alert" className="text-xs font-medium text-[#ff647c]">
                  {galatSandi.message}
                </p>
              ) : null}

              <button type="submit" disabled={gantiSandi.isPending} className="pl-btn text-xs">
                {gantiSandi.isPending ? "Memproses\u2026" : "Perbarui kata sandi"}
              </button>
            </form>
          </AdminPanel>
        </div>
      </div>
    </section>
  );
}
