/**
 * Verifikasi end-to-end modul autentikasi PLAYORA.
 *
 * Menembak HTTP API sungguhan dengan cookie jar manual, sehingga yang diuji
 * adalah perilaku nyata (Set-Cookie, header, status) — bukan unit test tiruan.
 *
 * Prasyarat: server berjalan di http://localhost:5000 dengan NODE_ENV=development.
 * Jalankan: node scripts/verify-auth.mjs
 */
import { PrismaClient } from "@prisma/client";

const BASE = process.env.PLAYORA_API ?? "http://localhost:5000/api/v1";
const ORIGIN = process.env.PLAYORA_ORIGIN ?? "http://localhost:5173";
const prisma = new PrismaClient();

const AUTH_COOKIE = "playora_token";
const CSRF_COOKIE = "playora_csrf";

let lulus = 0;
let gagal = 0;

function ok(p) {
  lulus++;
  console.log(`  PASS  ${p}`);
}
function fail(p, detail) {
  gagal++;
  console.log(`  FAIL  ${p}${detail ? ` -> ${detail}` : ""}`);
}
function cek(nama, kondisi, detail) {
  if (kondisi) ok(nama);
  else fail(nama, detail);
}

// ------------------------------------------------------------------ cookie jar
const jar = new Map();
let setCookieLog = [];
let tokenTerakhir = null;
let tokenSebelumnya = null;

function perbaruiJar(response) {
  const baris = response.headers.getSetCookie?.() ?? [];
  setCookieLog.push(...baris);
  for (const line of baris) {
    const bagian = line.split(";");
    const pasangan = bagian[0] ?? "";
    const posisi = pasangan.indexOf("=");
    if (posisi < 0) continue;
    const nama = pasangan.slice(0, posisi).trim();
    const nilai = pasangan.slice(posisi + 1).trim();
    const atribut = bagian.map((a) => a.trim().toLowerCase());
    const dihapus =
      atribut.includes("max-age=0") ||
      atribut.some((a) => a.startsWith("expires=") && a.includes("1970"));
    if (dihapus) jar.delete(nama);
    else jar.set(nama, nilai);
  }
}

function headerCookie() {
  if (jar.size === 0) return undefined;
  return [...jar.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
}

async function mintaCsrfBaru() {
  const res = await fetch(`${BASE}/auth/csrf`, {
    headers: { Accept: "application/json", Origin: ORIGIN },
  });
  perbaruiJar(res);
  const body = await res.json().catch(() => null);
  tokenSebelumnya = tokenTerakhir;
  tokenTerakhir = body?.data?.csrfToken ?? null;
  return res.status;
}

/**
 * @param {"valid"|"none"|"mismatch"|"forged"} csrf
 * @param {string|null} origin  null = tanpa header Origin
 */
async function panggil(method, path, opsi = {}) {
  const { body, csrf = "valid", origin = ORIGIN, extraHeaders = {} } = opsi;
  const headers = { Accept: "application/json", ...extraHeaders };
  if (origin !== null) headers.Origin = origin;
  if (body !== undefined) headers["Content-Type"] = "application/json";

  if (csrf === "valid") {
    if (!jar.has(CSRF_COOKIE)) await mintaCsrfBaru();
    headers["X-CSRF-Token"] = jar.get(CSRF_COOKIE) ?? "";
  } else if (csrf === "mismatch") {
    if (!tokenSebelumnya || !tokenTerakhir) {
      await mintaCsrfBaru();
      await mintaCsrfBaru();
    }
    headers["X-CSRF-Token"] = tokenSebelumnya ?? "tidak-ada";
  } else if (csrf === "forged") {
    const palsu = "Zm9yZ2VkLW5vbmNl.c2lnbmF0dXJlLXBhbHN1";
    jar.set(CSRF_COOKIE, palsu);
    headers["X-CSRF-Token"] = palsu;
  }

  const cookie = headerCookie();
  if (cookie) headers.Cookie = cookie;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    redirect: "manual",
  });

  perbaruiJar(res);
  const teks = await res.text();
  let json = null;
  try {
    json = teks ? JSON.parse(teks) : null;
  } catch {
    json = null;
  }
  return { status: res.status, json, teks, setCookies: res.headers.getSetCookie?.() ?? [] };
}

function acak() {
  return Math.random().toString(36).slice(2, 8);
}

async function main() {
  console.log("\n=== VERIFIKASI MODUL AUTENTIKASI PLAYORA ===\n");
  console.log(`API    : ${BASE}`);
  console.log(`Origin : ${ORIGIN}`);

  const akhiran = `${Date.now().toString(36)}${acak()}`;
  const emailBaru = `uji.${akhiran}@playora.test`;
  const usernameBaru = `uji_${akhiran}`;
  const sandiBaru = "RahasiaUji123!";
  const sandiSalah = "SandiYangSalah999!";

  // ------------------------------------------------------------------ [1] CSRF
  console.log("\n[1] Penerbitan token CSRF");
  const csrfStatus = await mintaCsrfBaru();
  cek("GET /auth/csrf membalas 200", csrfStatus === 200, `status ${csrfStatus}`);
  cek("token CSRF diterima di body", typeof tokenTerakhir === "string" && tokenTerakhir.length > 40);
  cek(
    "token berformat nonce.tandaTangan",
    typeof tokenTerakhir === "string" && tokenTerakhir.split(".").length === 2,
  );
  cek("cookie CSRF ter-set", jar.has(CSRF_COOKIE));
  const csrfSetCookie = setCookieLog.filter((c) => c.startsWith(`${CSRF_COOKIE}=`));
  const csrfHeader = csrfSetCookie.at(-1) ?? "";
  cek("cookie CSRF TIDAK HttpOnly (dapat dibaca frontend)", !/httponly/i.test(csrfHeader), csrfHeader);
  cek("cookie CSRF SameSite=Lax", /samesite=lax/i.test(csrfHeader), csrfHeader);

  // --------------------------------------------------- [2] Penolakan tanpa CSRF
  console.log("\n[2] Penolakan request tanpa token CSRF valid");
  const tanpaCsrf = await panggil("POST", "/auth/register", {
    csrf: "none",
    body: { name: "Uji Tanpa Csrf", username: `x_${akhiran}`, email: `x.${akhiran}@playora.test`, password: sandiBaru },
  });
  cek("POST tanpa header X-CSRF-Token ditolak 403", tanpaCsrf.status === 403, `status ${tanpaCsrf.status}`);
  cek("kode error FORBIDDEN", tanpaCsrf.json?.error?.code === "FORBIDDEN", JSON.stringify(tanpaCsrf.json));

  const salahOrigin = await panggil("POST", "/auth/register", {
    origin: "http://situs-penyerang.example",
    body: { name: "Uji Origin", username: `y_${akhiran}`, email: `y.${akhiran}@playora.test`, password: sandiBaru },
  });
  cek("Origin asing ditolak 403", salahOrigin.status === 403, `status ${salahOrigin.status}`);

  const tanpaOrigin = await panggil("POST", "/auth/register", {
    origin: null,
    body: { name: "Uji Tanpa Origin", username: `z_${akhiran}`, email: `z.${akhiran}@playora.test`, password: sandiBaru },
  });
  cek("tanpa header Origin ditolak 403", tanpaOrigin.status === 403, `status ${tanpaOrigin.status}`);

  const tokenTidakCocok = await panggil("POST", "/auth/register", {
    csrf: "mismatch",
    body: { name: "Uji Mismatch", username: `w_${akhiran}`, email: `w.${akhiran}@playora.test`, password: sandiBaru },
  });
  cek("token header != cookie ditolak 403", tokenTidakCocok.status === 403, `status ${tokenTidakCocok.status}`);

  const tokenPalsu = await panggil("POST", "/auth/register", {
    csrf: "forged",
    body: { name: "Uji Palsu", username: `v_${akhiran}`, email: `v.${akhiran}@playora.test`, password: sandiBaru },
  });
  cek("tanda tangan CSRF palsu ditolak 403", tokenPalsu.status === 403, `status ${tokenPalsu.status}`);

  // Uji di atas sengaja merusak cookie CSRF di jar; terbitkan ulang sebelum lanjut.
  await mintaCsrfBaru();
  cek("token CSRF baru dapat diterbitkan ulang", jar.has(CSRF_COOKIE));

  // ------------------------------------------------------------- [3] Register
  console.log("\n[3] Registrasi");
  const daftar = await panggil("POST", "/auth/register", {
    body: { name: "Pengguna Uji", username: usernameBaru, email: emailBaru, password: sandiBaru },
  });
  cek("registrasi valid membalas 201", daftar.status === 201, `status ${daftar.status} ${daftar.teks.slice(0, 160)}`);
  cek("body memuat data user", daftar.json?.data?.user?.email === emailBaru, JSON.stringify(daftar.json?.data?.user));
  cek("passwordHash TIDAK ikut terkirim", !daftar.teks.includes("passwordHash"));
  cek("cookie sesi ter-set", jar.has(AUTH_COOKIE));
  cek("role pengguna baru = USER", daftar.json?.data?.user?.role === "USER");

  const authSetCookie = setCookieLog.filter((c) => c.startsWith(`${AUTH_COOKIE}=`)).at(-1) ?? "";
  cek("cookie sesi HttpOnly", /httponly/i.test(authSetCookie), authSetCookie);
  cek("cookie sesi SameSite=Lax", /samesite=lax/i.test(authSetCookie), authSetCookie);
  cek("cookie sesi tidak Secure di development", !/;\s*secure/i.test(authSetCookie), authSetCookie);
  cek("cookie sesi memiliki Path=/", /path=\//i.test(authSetCookie), authSetCookie);

  // ------------------------------------------------ [4] Password di database
  console.log("\n[4] Penyimpanan kata sandi");
  const tersimpan = await prisma.user.findUnique({
    where: { email: emailBaru },
    select: { passwordHash: true },
  });
  cek("password tersimpan sebagai hash bcrypt", /^\$2[aby]\$\d{2}\$/.test(tersimpan?.passwordHash ?? ""));
  cek("password bukan teks biasa", tersimpan?.passwordHash !== sandiBaru && (tersimpan?.passwordHash.length ?? 0) === 60);

  // ---------------------------------------------------------------- [5] /me
  console.log("\n[5] Endpoint terproteksi GET /auth/me");
  const me = await panggil("GET", "/auth/me");
  cek("akses /auth/me dengan sesi membalas 200", me.status === 200, `status ${me.status}`);
  cek("email sesuai", me.json?.data?.user?.email === emailBaru, JSON.stringify(me.json?.data));
  cek("respons /me tidak memuat passwordHash", !me.teks.includes("passwordHash"));

  // -------------------------------------------------------- [6] Duplikasi
  console.log("\n[6] Registrasi duplikat & validasi");
  const duplikat = await panggil("POST", "/auth/register", {
    body: { name: "Duplikat", username: `${usernameBaru}_lain`, email: emailBaru, password: sandiBaru },
  });
  cek("email duplikat ditolak 409", duplikat.status === 409, `status ${duplikat.status}`);
  cek("kode error CONFLICT", duplikat.json?.error?.code === "CONFLICT", JSON.stringify(duplikat.json));

  const tidakValid = await panggil("POST", "/auth/register", {
    body: { name: "A", username: "ab", email: "bukan-email", password: "123" },
  });
  cek("input tidak valid ditolak 400", tidakValid.status === 400, `status ${tidakValid.status}`);
  cek("kode error VALIDATION_ERROR", tidakValid.json?.error?.code === "VALIDATION_ERROR");
  cek(
    "detail validasi menyebut field bermasalah",
    Array.isArray(tidakValid.json?.error?.details) && tidakValid.json.error.details.length >= 3,
    JSON.stringify(tidakValid.json?.error?.details),
  );

  // ------------------------------------------------------------- [7] Logout
  console.log("\n[7] Logout");
  const keluar = await panggil("POST", "/auth/logout");
  cek("logout membalas 200", keluar.status === 200, `status ${keluar.status}`);
  cek("cookie sesi dihapus", !jar.has(AUTH_COOKIE));
  const setelahKeluar = await panggil("GET", "/auth/me");
  cek("akses /auth/me setelah logout ditolak 401", setelahKeluar.status === 401, `status ${setelahKeluar.status}`);

  // -------------------------------------------------------------- [8] Login
  console.log("\n[8] Login");
  const salahSandi = await panggil("POST", "/auth/login", {
    body: { email: emailBaru, password: sandiSalah },
  });
  cek("password salah ditolak 401", salahSandi.status === 401, `status ${salahSandi.status}`);
  const pesanSalahSandi = salahSandi.json?.error?.message;

  const emailAsing = await panggil("POST", "/auth/login", {
    body: { email: `tidak.ada.${akhiran}@playora.test`, password: sandiSalah },
  });
  cek("email tak terdaftar ditolak 401", emailAsing.status === 401, `status ${emailAsing.status}`);
  cek(
    "pesan error identik untuk email asing (tidak membocorkan keberadaan akun)",
    emailAsing.json?.error?.message === pesanSalahSandi,
    `${JSON.stringify(emailAsing.json?.error?.message)} vs ${JSON.stringify(pesanSalahSandi)}`,
  );
  cek("pesan error tidak menyebut field mana yang salah", /email atau kata sandi salah/i.test(pesanSalahSandi ?? ""), pesanSalahSandi);

  const masuk = await panggil("POST", "/auth/login", {
    body: { email: emailBaru, password: sandiBaru },
  });
  cek("login benar membalas 200", masuk.status === 200, `status ${masuk.status}`);
  cek("cookie sesi ter-set setelah login", jar.has(AUTH_COOKIE));
  const meSetelahLogin = await panggil("GET", "/auth/me");
  cek("/auth/me berhasil setelah login", meSetelahLogin.status === 200, `status ${meSetelahLogin.status}`);

  // --------------------------------------------------- [9] Otorisasi peran
  console.log("\n[9] Otorisasi berbasis peran (server-side)");
  const adminSebagaiUser = await panggil("GET", "/admin/ping");
  cek("USER ditolak mengakses endpoint admin (403)", adminSebagaiUser.status === 403, `status ${adminSebagaiUser.status}`);

  const masukAdmin = await panggil("POST", "/auth/login", {
    body: { email: "admin@playora.id", password: "Playora123!" },
  });
  cek("login admin berhasil", masukAdmin.status === 200, `status ${masukAdmin.status}`);
  const adminPing = await panggil("GET", "/admin/ping");
  cek("ADMIN dapat mengakses endpoint admin (200)", adminPing.status === 200, `status ${adminPing.status}`);
  cek("peran diambil dari database, bukan klaim klien", adminPing.json?.data?.userId === masukAdmin.json?.data?.user?.id);

  // ---------------------------------------------------------- [10] Rate limit
  console.log("\n[10] Rate limiting");
  const emailLimit = `limit.${akhiran}@playora.test`;
  const statusLogin = [];
  for (let i = 0; i < 6; i++) {
    const r = await panggil("POST", "/auth/login", { body: { email: emailLimit, password: sandiSalah } });
    statusLogin.push(r.status);
  }
  cek(
    "login ke-6 untuk email yang sama dibatasi 429",
    statusLogin[5] === 429,
    `urutan status: ${statusLogin.join(", ")}`,
  );
  cek(
    "percobaan ke-1 s/d ke-5 masih diproses (401)",
    statusLogin.slice(0, 5).every((s) => s === 401),
    `urutan status: ${statusLogin.join(", ")}`,
  );

  const statusDaftar = [];
  for (let i = 0; i < 4; i++) {
    const r = await panggil("POST", "/auth/register", {
      body: {
        name: "Uji Batas",
        username: `batas_${akhiran}_${i}`,
        email: `batas.${akhiran}.${i}@playora.test`,
        password: sandiBaru,
      },
    });
    statusDaftar.push(r.status);
    if (r.status === 429) break;
  }
  cek(
    "registrasi berulang dari IP yang sama dibatasi 429",
    statusDaftar.includes(429),
    `urutan status: ${statusDaftar.join(", ")}`,
  );

  // -------------------------------------------------------- [11] Regresi
  console.log("\n[11] Regresi modul sebelumnya");
  const health = await panggil("GET", "/health");
  cek("GET /health tetap 200", health.status === 200, `status ${health.status}`);
  cek("health melaporkan database terhubung", health.json?.data?.database === "connected", JSON.stringify(health.json?.data));

  const tidakAda = await panggil("GET", "/rute-yang-tidak-ada");
  cek("rute tak dikenal tetap 404", tidakAda.status === 404, `status ${tidakAda.status}`);

  // ------------------------------------------------------------ ringkasan
  console.log("\n=== RINGKASAN ===");
  console.log(`LULUS : ${lulus}`);
  console.log(`GAGAL : ${gagal}`);

  if (gagal > 0) {
    console.log("\nHASIL: MODUL AUTENTIKASI BELUM SESUAI\n");
    process.exitCode = 1;
  } else {
    console.log("\nHASIL: MODUL AUTENTIKASI SESUAI\n");
    process.exitCode = 0;
  }
}

main()
  .catch((e) => {
    console.error("\nERROR TAK TERTANGANI:", e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
