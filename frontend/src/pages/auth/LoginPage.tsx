import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Field } from "@/components/ui/Field";
import { useLogin } from "@/hooks/useAuth";
import { extractApiError } from "@/lib/api";

export function LoginPage() {
  const navigate = useNavigate();
  const masuk = useLogin();
  const [email, setEmail] = useState("");
  const [sandi, setSandi] = useState("");

  const galat = masuk.error ? extractApiError(masuk.error) : null;

  function kirim(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    masuk.mutate(
      { email, password: sandi },
      { onSuccess: () => navigate("/", { replace: true }) },
    );
  }

  return (
    <section className="playora-container flex min-h-[70vh] items-center py-10 sm:py-14">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-6 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7135f5] to-[#8b4cff] text-lg font-black text-white">
            P
          </span>
          <span className="pl-eyebrow mt-4">Akun PLAYORA</span>
          <h1 className="pl-title mt-3">Masuk ke PLAYORA</h1>
          <p className="mt-2 text-sm text-navy-400">
            Gunakan akun yang sudah terdaftar untuk mengakses fitur personal.
          </p>
        </div>

        <form
          onSubmit={kirim}
          className="space-y-5 rounded-[var(--radius-card)] border border-line bg-gradient-to-br from-[#171a34] to-[#111528] p-6 shadow-2xl"
          noValidate
        >
          {galat ? (
            <div
              role="alert"
              data-testid="form-error"
              className="rounded-[var(--radius-control)] border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"
            >
              {galat.message}
            </div>
          ) : null}

          <Field
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@contoh.id"
          />

          <Field
            label="Kata sandi"
            type="password"
            name="password"
            autoComplete="current-password"
            required
            value={sandi}
            onChange={(e) => setSandi(e.target.value)}
            placeholder="••••••••"
          />

          <button type="submit" disabled={masuk.isPending} className="pl-btn w-full">
            {masuk.isPending ? "Memproses…" : "Masuk"}
          </button>

          <p className="text-center text-sm text-navy-400">
            Belum punya akun?{" "}
            <Link to="/register" className="font-semibold text-accent-pink hover:underline">
              Daftar di sini
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
}
