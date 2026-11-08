const CSRF_COOKIE = "playora_csrf";
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api/v1";

export function readCookie(nama: string): string | null {
  const awalan = `${nama}=`;
  for (const bagian of document.cookie.split(";")) {
    const bersih = bagian.trim();
    if (bersih.startsWith(awalan)) {
      return decodeURIComponent(bersih.slice(awalan.length));
    }
  }
  return null;
}

/**
 * Mengambil token CSRF dari cookie. Bila belum ada, minta satu ke server.
 * Selalu membaca cookie (bukan cache) karena server merotasi token saat login/logout.
 */
export async function ensureCsrfToken(): Promise<string> {
  const tersimpan = readCookie(CSRF_COOKIE);
  if (tersimpan) return tersimpan;

  const respons = await fetch(`${API_BASE}/auth/csrf`, {
    method: "GET",
    credentials: "include",
    headers: { Accept: "application/json" },
  });

  if (!respons.ok) {
    throw new Error("Gagal menyiapkan token keamanan.");
  }

  const body = (await respons.json()) as { data?: { csrfToken?: string } };
  return readCookie(CSRF_COOKIE) ?? body.data?.csrfToken ?? "";
}
