import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Field } from "@/components/ui/Field";
import { useRegister } from "@/hooks/useAuth";
import { extractApiError } from "@/lib/api";

export function RegisterPage() {
  const navigate = useNavigate();
  const daftar = useRegister();
  const [nama, setNama] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [sandi, setSandi] = useState("");

  const galat = daftar.error ? extractApiError(daftar.error) : null;

  const galatField = (namaField: string): string | undefined =>
    galat?.details.find((d) => d.field === namaField)?.message;

  function kirim(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    daftar.mutate(
      { name: nama, username, email, password: sandi },
      { onSuccess: () => navigate("/", { replace: true }) },
    );
  }

  return (
    <section className="playora-container flex min-h-[70vh] items-center py-10 sm:py-14">
      <div className="mx-auto w-full max-w-md">
        <span className="pl-eyebrow">Akun PLAYORA</span><h1 className="pl-title mt-3">Daftar akun PLAYORA</h1>
        <p className="mt-2 text-sm text-navy-400">
          Akun diperlukan untuk menyimpan favorit, bookmark, dan mengajukan turnamen.
        </p>

        <form
          onSubmit={kirim}
          className="mt-6 space-y-5 rounded-[var(--radius-card)] border border-line bg-gradient-to-br from-[#171a34] to-[#111528] p-6 shadow-2xl"
          noValidate
        >
          {galat ? (
            <div
              role="alert"
              data-testid="form-error"
              className="rounded-[var(--radius-control)] border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger"
            >
              {galat.message}
            </div>
          ) : null}

          <Field
            label="Nama lengkap"
            name="name"
            autoComplete="name"
            required
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            galat={galatField("name")}
            placeholder="Nama Anda"
          />

          <Field
            label="Username"
            name="username"
            autoComplete="username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            galat={galatField("username")}
            petunjuk="Huruf, angka, dan garis bawah. Minimal 3 karakter."
            placeholder="nama_pengguna"
          />

          <Field
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            galat={galatField("email")}
            placeholder="nama@contoh.id"
          />

          <Field
            label="Kata sandi"
            type="password"
            name="password"
            autoComplete="new-password"
            required
            value={sandi}
            onChange={(e) => setSandi(e.target.value)}
            galat={galatField("password")}
            petunjuk="Minimal 8 karakter, maksimal 72 karakter."
            placeholder="••••••••"
          />

          <button
            type="submit"
            disabled={daftar.isPending}
            className="pl-btn w-full"
          >
            {daftar.isPending ? "Memproses…" : "Daftar"}
          </button>

          <p className="text-center text-sm text-muted">
            Sudah punya akun?{" "}
            <Link to="/login" className="font-semibold text-accent-pink hover:underline">
              Masuk di sini
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
}
