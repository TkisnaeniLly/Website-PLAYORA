# PLAYORA

Platform informasi game, berita & panduan, komunitas gamer, dan direktori turnamen
untuk gamer Indonesia. Website responsif berbahasa Indonesia.

> **Status: Tahap 10 — Komunitas & direktori ruang Discord.**
> Yang tersedia: fondasi backend + database, autentikasi end-to-end (JWT HttpOnly
> cookie, CSRF signed double-submit, otorisasi peran, rate limiting, pencabutan sesi),
> katalog game, berita & panduan, direktori turnamen, alur pengajuan turnamen,
> publikasi & persetujuan hasil, pusat notifikasi dan pengaturan akun, **komunitas
> (postingan, komentar, suka)**, serta **direktori ruang Discord** yang divalidasi admin.

## Teknologi

| Lapisan | Teknologi |
| --- | --- |
| Frontend | React 19 + TypeScript, Vite 8, Tailwind CSS 4, React Router 7, TanStack Query |
| Backend | Node.js + Express 5 + TypeScript |
| Database | MySQL / MariaDB, diakses via Prisma 6 |
| Validasi | Zod |
| Autentikasi | JWT (HttpOnly cookie) + CSRF signed double-submit |
| Hashing kata sandi | bcryptjs |
| Pengujian | Vitest (+ Supertest untuk API, Testing Library untuk UI) |
| Upload gambar | Cloudinary (belum diaktifkan pada tahap ini) |

## Prasyarat

- **Node.js ≥ 20.19** (diuji pada v24.12.0)
- **MySQL 8 atau MariaDB 10.4+** yang berjalan di `localhost:3306`
  (lingkungan pengembangan saat ini memakai MariaDB dari XAMPP)

## Menyiapkan database

Buat database kosong. Prisma yang akan membuat tabelnya.

```bash
mysql -u root -e "CREATE DATABASE IF NOT EXISTS playora_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

Bila `mysql` tidak ada di PATH (kasus XAMPP di Windows), gunakan path lengkap:

```powershell
& "T:\xampp\mysql\bin\mysql.exe" -u root -e "CREATE DATABASE IF NOT EXISTS playora_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

## Menyiapkan skema & data contoh

```bash
cd backend
npx prisma migrate deploy     # terapkan migration yang sudah ada
npm run db:seed               # isi data contoh (idempoten, aman diulang)
```

Periksa hasilnya:

```bash
npm run db:verify        # 96 pemeriksaan struktur database
npm run db:verify-seed   # 48 pemeriksaan data & integritas
npm run auth:verify      # 52 pemeriksaan autentikasi (server harus berjalan)
```

Ketiga skrip keluar dengan kode `0` bila semua pemeriksaan lolos.

## Skema database

17 tabel sesuai 22 fitur MVP:

| Tabel | Fungsi | Fitur MVP |
| --- | --- | --- |
| `users` | Akun, peran, profil | #15, #16, #20 |
| `games` | Katalog game | #2, #3, #4 |
| `platforms` | Daftar platform | #3 |
| `game_platforms` | Relasi game–platform | #3 |
| `articles` | Berita & panduan | #5, #6, #7, #18 |
| `tournament_submissions` | Pengajuan turnamen | #10 |
| `tournament_reviews` | Riwayat keputusan admin | #11 |
| `tournaments` | Turnamen terpublikasi | #8, #9, #12 |
| `tournament_results` | Hasil turnamen | #12 |
| `user_games` | Game favorit | #17 |
| `bookmarks` | Artikel tersimpan | #18 |
| `notifications` | Notifikasi pengajuan & hasil | #19 |
| `tournament_result_reviews` | Riwayat perubahan hasil (audit) | #12 |
| `tournament_change_requests` | Permintaan perubahan info turnamen | #12 |
| `community_posts` | Postingan komunitas | #13 |
| `community_comments` | Komentar komunitas | #13 |
| `community_post_likes` | Suka postingan komunitas | #13 |
| `discord_rooms` | Direktori ruang Discord (validasi admin) | #13 |

Fitur yang **sengaja belum** dibuatkan tabel: laporan konten, review/rating game,
koleksi pribadi, dan fitur sosial lanjutan. `npm run db:verify` akan **gagal**
bila tabel terlarang itu muncul.

Akun hasil seed (kata sandi semua akun: `Playora123!`):

| Surel | Peran |
| --- | --- |
| `admin@playora.id` | ADMIN |
| `tika@playora.id` | USER |
| `arman@playora.id` | USER |
| `syah@playora.id` | USER |

## Menjalankan backend

```bash
cd backend
cp .env.example .env      # lalu sesuaikan DATABASE_URL & JWT_SECRET
npm install
npx prisma generate
npm run dev
```

API berjalan di `http://localhost:5000/api/v1`.

Periksa kesehatan layanan:

```bash
curl http://localhost:5000/api/v1/health
```

Respons sehat (HTTP 200):

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "database": "connected",
    "databaseLatencyMs": 5,
    "environment": "development",
    "uptimeSeconds": 20,
    "timestamp": "2026-11-04T10:49:48.644Z"
  }
}
```

Bila database tidak terjangkau, endpoint membalas **HTTP 503** dengan
`"status": "degraded"` dan `"database": "disconnected"`. Health check tidak pernah
melaporkan sehat palsu.

## Menjalankan frontend

```bash
cd frontend
cp .env.example .env      # VITE_API_BASE_URL
npm install
npm run dev
```

Buka `http://localhost:5173`.

## Variabel environment

### `backend/.env`

| Variabel | Wajib | Default | Keterangan |
| --- | --- | --- | --- |
| `NODE_ENV` | tidak | `development` | `development` \| `test` \| `production` |
| `PORT` | tidak | `5000` | Port HTTP API |
| `DATABASE_URL` | **ya** | — | `mysql://user:pass@host:port/db` |
| `JWT_SECRET` | **ya** | — | Minimal 32 karakter |
| `JWT_EXPIRES_IN` | tidak | `7d` | Masa berlaku token (`45s`, `30m`, `12h`, `7d`) |
| `CSRF_SECRET` | **ya** | — | Minimal 32 karakter, **harus berbeda** dari `JWT_SECRET` |
| `RATE_LIMIT_WINDOW_MS` | tidak | `900000` | Jendela waktu rate limit (15 menit) |
| `RATE_LIMIT_LOGIN_MAX` | tidak | `5` | Percobaan login per IP + email |
| `RATE_LIMIT_LOGIN_IP_MAX` | tidak | `30` | Percobaan login per IP (semua email) |
| `RATE_LIMIT_REGISTER_MAX` | tidak | `5` | Pendaftaran per IP |
| `CORS_ORIGIN` | tidak | `http://localhost:5173` | Origin frontend, pisahkan dengan koma |
| `BCRYPT_SALT_ROUNDS` | tidak | `10` | 8–15 |
| `CLOUDINARY_*` | tidak | kosong | Diperlukan saat modul upload dibangun |

Konfigurasi divalidasi dengan Zod saat proses start. Bila ada yang salah, server
**menolak berjalan** dan menyebutkan nama variabel yang bermasalah.

### `frontend/.env`

| Variabel | Default | Keterangan |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `http://localhost:5000/api/v1` | Basis URL API |

## Struktur folder

```
SRTS_Playora/
├─ backend/
│  ├─ prisma/schema.prisma        # skema database
│  └─ src/
│     ├─ app.ts                   # susunan middleware + router
│     ├─ server.ts                # bootstrap + graceful shutdown
│     ├─ config/                  # env, prisma client
│     ├─ middlewares/             # error handler, 404
│     ├─ modules/                 # per-fitur: routes → controller → service
│     ├─ routes/index.ts          # registrasi /api/v1
│     └─ utils/                   # ApiError, envelope respons
└─ frontend/
   └─ src/
      ├─ app/                     # router, providers
      ├─ components/layout/       # Header, Footer, AppLayout
      ├─ lib/api.ts               # klien HTTP
      ├─ pages/                   # halaman per area
      ├─ styles/index.css         # token desain (Navy Blue)
      └─ types/                   # tipe respons API
```

## Autentikasi & Keamanan

### Endpoint

| Method | Path | Akses | Keterangan |
| --- | --- | --- | --- |
| `GET` | `/auth/csrf` | publik | Terbitkan cookie + token CSRF |
| `POST` | `/auth/register` | publik | Daftar akun, langsung membuat sesi |
| `POST` | `/auth/login` | publik | Masuk, membuat sesi |
| `POST` | `/auth/logout` | publik | Hapus cookie sesi & CSRF |
| `GET` | `/auth/me` | sesi | Profil pengguna yang sedang masuk |

Endpoint admin (`/admin/*`) dilindungi `authenticate` + `authorize("ADMIN")`.
Peran **selalu** dibaca ulang dari database pada setiap request, bukan dari klaim
token — sehingga perubahan peran atau penonaktifan akun langsung berlaku.

### Cookie

| Cookie | HttpOnly | Dibaca JS | Isi |
| --- | --- | --- | --- |
| `playora_token` | **ya** | tidak | JWT (HS256, issuer `playora`) |
| `playora_csrf` | tidak | **ya** | `nonce.HMAC-SHA256` |

Keduanya `SameSite=Lax`, `Path=/`, dan otomatis memakai flag `Secure` saat
`NODE_ENV=production`.

### Alur CSRF (signed double-submit, tanpa state di server)

1. Frontend memanggil `GET /auth/csrf` sekali saat dibutuhkan.
2. Server menanam cookie `playora_csrf` berisi `nonce.tandaTanganHMAC`.
3. Untuk setiap request yang mengubah data, frontend menyalin nilai cookie ke
   header `X-CSRF-Token`.
4. Server memeriksa tiga hal: **Origin** ada dan termasuk `CORS_ORIGIN`, header
   sama dengan cookie (perbandingan waktu-konstan), dan tanda tangan HMAC valid
   dengan `CSRF_SECRET`.

Tanda tangan inilah yang membuat skema ini lebih kuat daripada double-submit
biasa: penyerang yang mampu menanam cookie sendiri tetap tidak bisa memalsukan
tanda tangan tanpa `CSRF_SECRET`.

### Password

Disimpan sebagai hash bcrypt (`bcryptjs`, cost dari `BCRYPT_SALT_ROUNDS`).
Panjang dibatasi 8–72 karakter karena bcrypt mengabaikan byte setelah 72.
Percobaan login dengan email tak terdaftar tetap menjalankan `bcrypt.compare`
terhadap hash tiruan agar waktu respons tidak membocorkan keberadaan akun.

## Katalog Game

### Endpoint

| Method | Path | Akses | Keterangan |
| --- | --- | --- | --- |
| `GET` | `/games` | publik | Daftar game terpublikasi |
| `GET` | `/games/:slug` | publik | Detail game + konten terkait |
| `GET` | `/games/meta/filters` | publik | Daftar platform dan genre tersedia |

Parameter `GET /games`:

| Parameter | Tipe | Default | Batasan |
| --- | --- | --- | --- |
| `q` | string | — | Maks 100 karakter, pencarian judul (tidak peka huruf besar-kecil) |
| `platform` | string | — | Nama platform, mis. `PC`, `Mobile` |
| `genre` | string | — | Nama genre (cocok persis) |
| `page` | integer | `1` | Minimal 1 |
| `limit` | integer | `12` | 1–48 |

Respons daftar memakai `meta`:

```json
{
  "success": true,
  "data": { "items": [] },
  "meta": { "page": 1, "limit": 12, "total": 14 }
}
```

**Hanya game berstatus `PUBLISHED` yang dapat diakses publik.** Game `DRAFT`
tidak muncul di daftar, tidak muncul di filter, dan mengembalikan `404` pada
halaman detailnya.

## Berita & Panduan

Satu tabel `articles` dengan lima kategori, disajikan sebagai **dua bagian**:

| Bagian | Kategori | Halaman |
| --- | --- | --- |
| Berita | `NEWS`, `UPDATE`, `ESPORTS` | `/news`, `/news/:slug` |
| Panduan | `TIPS`, `TUTORIAL` | `/guides`, `/guides/:slug` |

### Endpoint

| Method | Path | Akses | Keterangan |
| --- | --- | --- | --- |
| `GET` | `/articles` | publik | Daftar artikel terpublikasi |
| `GET` | `/articles/:slug` | publik | Detail artikel |
| `GET` | `/articles/meta/filters` | publik | Jumlah artikel per kategori |

Parameter `GET /articles`:

| Parameter | Tipe | Default | Batasan |
| --- | --- | --- | --- |
| `q` | string | — | Maks 150 karakter, pencarian judul |
| `type` | `berita` \| `panduan` | — | Menyaring kelompok kategori |
| `category` | salah satu dari 5 kategori | — | Harus konsisten dengan `type` |
| `page` | integer | `1` | Minimal 1 |
| `limit` | integer | `12` | 1–48 |

Kombinasi `type` dan `category` yang bertentangan (mis. `type=berita&category=TUTORIAL`)
ditolak dengan `400 VALIDATION_ERROR`.

Parameter `GET /articles/:slug` menerima `type` opsional. Bila `type` tidak cocok
dengan kategori artikel, responsnya `404` — sehingga `/news/<slug-panduan>` tidak
dapat dipakai untuk membuka panduan.

**Hanya artikel `PUBLISHED` dengan `publishedAt <= sekarang` yang tampil.**
Artikel `DRAFT` maupun artikel terjadwal di masa depan tidak muncul di daftar,
tidak dihitung di filter, dan mengembalikan `404` pada detailnya.

## Turnamen

Direktori informasi turnamen. **PLAYORA bukan penyelenggara** — pendaftaran peserta,
pembayaran, dan bracket dikelola penyelenggara di luar platform.

Halaman `/tournaments` menyediakan akses pengajuan langsung: pengguna yang sudah
masuk melihat tombol **+ Ajukan turnamen** dan **Pengajuan saya**; tamu melihat
ajakan dengan tombol **Masuk** / **Daftar akun** yang mengarah ke autentikasi.

### Endpoint

| Method | Path | Akses | Keterangan |
| --- | --- | --- | --- |
| `GET` | `/tournaments` | publik | Daftar turnamen terpublikasi |
| `GET` | `/tournaments/:slug` | publik | Detail turnamen + hasil pertandingan |

Parameter `GET /tournaments`:

| Parameter | Tipe | Default | Batasan |
| --- | --- | --- | --- |
| `status` | `upcoming` \| `ongoing` \| `finished` | — | Menyaring berdasarkan tanggal |
| `page` | integer | `1` | Minimal 1 |
| `limit` | integer | `12` | 1–48 |

### Status turnamen (diturunkan, bukan kolom database)

Tabel `tournaments` hanya menyimpan tanggal, sehingga status dihitung saat dibaca:

| Status | Label | Kondisi |
| --- | --- | --- |
| `upcoming` | Mendatang | `start_date` > awal hari ini |
| `ongoing` | Berlangsung | `start_date` ≤ awal hari ini ≤ `end_date` |
| `finished` | Selesai | `end_date` < awal hari ini |

Perbandingan memakai **awal hari ini**, sehingga turnamen yang berakhir hari ini
masih dihitung *Berlangsung*, bukan langsung *Selesai*.

### Gerbang publik

Turnamen tampil hanya bila `is_published = true` **dan** — bila berasal dari
pengajuan — pengajuannya berstatus `APPROVED`. Kondisi kedua mencegah turnamen
tayang akibat data tidak konsisten (publikasi sebelum pengajuan disetujui).
Turnamen yang dibuat admin tanpa pengajuan (`submission_id` NULL) tetap dapat tampil.

### Hasil pertandingan

Detail turnamen menyertakan `results` terurut berdasarkan `position`. Posisi 1
dilabeli "Juara 1", posisi lain "Peringkat N". Bila belum ada hasil, UI menampilkan
"Hasil pertandingan belum tersedia".

**Belum termasuk tahap ini:** pendaftaran peserta, pembayaran, dan bracket otomatis.

## Pengajuan Turnamen

Pengguna terdaftar dapat mengajukan turnamen. Pengajuan wajib diperiksa admin
sebelum menjadi turnamen.

### Endpoint

| Method | Path | Akses | Keterangan |
| --- | --- | --- | --- |
| `POST` | `/submissions` | login | Kirim pengajuan baru |
| `GET` | `/submissions/me` | login | Daftar pengajuan milik sendiri |
| `GET` | `/submissions/:id` | login | Detail (pemilik atau admin) |
| `PATCH` | `/submissions/:id` | login | Perbaiki — **hanya** saat `NEEDS_REVISION` |
| `GET` | `/admin/submissions` | admin | Daftar seluruh pengajuan |
| `PATCH` | `/admin/submissions/:id/decision` | admin | Setujui / revisi / tolak |
| `GET` | `/me/notifications` | login | Notifikasi milik sendiri |
| `PATCH` | `/me/notifications/:id/read` | login | Tandai sudah dibaca |

### Atribut pengajuan

`title`, `gameId`, `organizerName`, `description`, `startDate`, `endDate`,
`registrationDeadline` (opsional), `format`, `teamCount`, `prizePool` (opsional),
`requirements` (opsional), `registrationMethod`, `registrationUrl` (opsional),
`contact` (opsional).

Validasi utama:

- `endDate ≥ startDate`, `registrationDeadline ≤ startDate`
- `endDate` tidak boleh sudah lewat
- `teamCount` bilangan bulat 2–512
- **Minimal salah satu** `registrationUrl` atau `contact` harus diisi
- `gameId` harus menunjuk game berstatus `PUBLISHED`

### Alur status

```
PENDING ──► NEEDS_REVISION ──► (pengguna kirim ulang) ──► PENDING
   │
   ├──► APPROVED   (membuat/menyegarkan record turnamen, is_published = false)
   └──► REJECTED
```

| Aturan | Konsekuensi |
| --- | --- |
| `APPROVED` dan `REJECTED` bersifat final | Keputusan kedua ditolak `409` |
| Setelah `APPROVED`, pengguna tidak dapat mengubah data | `PATCH` ditolak `409` |
| `PATCH` hanya berlaku saat `NEEDS_REVISION` | Status kembali ke `PENDING`, catatan admin dihapus |
| Setiap keputusan menulis satu baris `tournament_reviews` | Riwayat audit append-only |
| Persetujuan membuat turnamen dalam **satu transaksi** | `submission_id` UNIQUE mencegah turnamen ganda |
| Pengguna lain mendapat `404`, bukan `403` | Keberadaan pengajuan tidak terbocorkan |

### Notifikasi

Notifikasi dicatat **saat status benar-benar berubah**, bukan saat halaman dibuka:

| Kejadian | Tipe |
| --- | --- |
| Pengajuan dikirim | `SUBMISSION_CREATED` |
| Dikirim ulang setelah revisi | `SUBMISSION_STATUS_CHANGED` |
| Diminta revisi | `SUBMISSION_NEEDS_REVISION` |
| Disetujui | `SUBMISSION_APPROVED` |
| Ditolak | `SUBMISSION_REJECTED` |

Halaman pusat notifikasi belum dibangun pada tahap ini; endpoint API-nya sudah
tersedia untuk dipakai tahap berikutnya.

## Publikasi & Pengelolaan Hasil

Penyelenggara mengisi hasil turnamen miliknya; **admin wajib menyetujui** sebelum
hasil tampil kepada publik.

### Endpoint

| Method | Path | Akses | Keterangan |
| --- | --- | --- | --- |
| `GET` | `/tournaments/:id/results/manage` | penyelenggara / admin | Hasil + status tinjauan |
| `PUT` | `/tournaments/:id/results` | penyelenggara / admin | Kirim/ubah hasil (→ `PENDING_REVIEW`) |
| `GET` | `/admin/tournaments` | admin | Daftar turnamen + ringkasan hasil |
| `PATCH` | `/admin/tournaments/:id/publish` | admin | Publikasikan / batalkan |
| `PATCH` | `/admin/tournaments/:id/results/review` | admin | Setujui / tolak hasil |

### Status hasil

```
(penyelenggara kirim) ──► PENDING_REVIEW
                              │
                     admin ───┼──► APPROVED  (tampil publik)
                              └──► REJECTED  (tidak tampil, catatan wajib)
```

| Aturan | Konsekuensi |
| --- | --- |
| Penyelenggara hanya mengelola turnamen `managerId`-nya | Turnamen pihak lain dibalas **404** (bukan 403) |
| Penyelenggara tidak bisa menyetujui hasil | Endpoint tinjau khusus `ADMIN` → `403` |
| Penyelenggara tidak dapat menghapus hasil `APPROVED` | `409 CONFLICT`; baris tetap ada dan tetap tampil publik (ditegakkan di backend) |
| Admin tetap dapat menghapus hasil dengan status apa pun | Kewenangan koreksi administrator |
| Hasil baru atau yang isinya berubah masuk `PENDING_REVIEW` | Hanya baris itu yang hilang sementara dari halaman publik |
| Baris `APPROVED` yang tidak diubah mempertahankan statusnya | Tetap `APPROVED` dan tetap tampil publik saat penyelenggara memperbaiki baris lain |
| Baris `REJECTED` yang belum diperbaiki tetap `REJECTED` | Tidak kembali ke antrean tinjauan sampai isinya diubah |
| Menolak hasil wajib menyertakan catatan | `400 VALIDATION_ERROR`; notifikasi memuat alasan dan ajakan kirim ulang |
| Setiap hasil baru/berubah & setiap keputusan menulis `tournament_result_reviews` | Audit trail append-only; kirim ulang tanpa perubahan tidak menambah baris |
| Publikasi ditolak bila hasil belum disetujui | `409 CONFLICT` |
| Publikasi ditolak bila pengajuan belum `APPROVED` | `409 CONFLICT` |
| Halaman publik hanya menampilkan hasil `APPROVED` | Dijamin di query, bukan di UI |

**Konsekuensi yang disengaja:** mengubah isi hasil yang sudah disetujui mengembalikannya
ke `PENDING_REVIEW`, sehingga **sementara tidak tampil** di halaman publik sampai
disetujui ulang. Ini penerapan langsung aturan "perubahan hasil yang sudah
dipublikasikan harus melalui pemeriksaan ulang". Baris yang tidak diubah tidak
tersentuh, sehingga penyelenggara **hanya perlu memperbaiki hasil yang ditolak**
(keputusan M-33).

Hasil yang sudah `APPROVED` juga tidak dapat dihapus oleh penyelenggara: penghapusan
ditolak `409` dan barisnya tetap tampil di halaman publik. Untuk mengubahnya,
penyelenggara harus mengirim isi baru agar masuk tinjauan ulang. Administrator tetap
dapat menghapus hasil berstatus apa pun sebagai koreksi. Aturan ini ditegakkan di
backend, bukan hanya dengan menyembunyikan tombol di antarmuka.

## Notifikasi & Pengaturan Akun

### Endpoint

| Method | Path | Akses | Keterangan |
| --- | --- | --- | --- |
| `GET` | `/me/notifications` | login | Daftar notifikasi milik sendiri |
| `GET` | `/me/notifications/unread-count` | login | Jumlah belum dibaca |
| `PATCH` | `/me/notifications/:id/read` | login | Tandai satu sudah dibaca |
| `PATCH` | `/me/notifications/read-all` | login | Tandai semua sudah dibaca |
| `GET` | `/me/profile` | login | Profil pengguna |
| `PATCH` | `/me/profile` | login | Ubah nama, username, bio, avatar |
| `PATCH` | `/me/profile/password` | login | Ganti kata sandi |

### Notifikasi

Notifikasi dibuat **di dalam transaksi yang sama** dengan perubahan status, sehingga
tidak ada perubahan data tanpa notifikasi dan tidak ada notifikasi untuk perubahan
yang gagal.

| Kejadian | Tipe | Penerima |
| --- | --- | --- |
| Pengajuan dikirim | `SUBMISSION_CREATED` | Pengaju |
| Dikirim ulang setelah revisi | `SUBMISSION_STATUS_CHANGED` | Pengaju |
| Diminta revisi / disetujui / ditolak | `SUBMISSION_NEEDS_REVISION` / `_APPROVED` / `_REJECTED` | Pengaju |
| Hasil disetujui / ditolak | `RESULT_APPROVED` / `RESULT_REJECTED` | Penyelenggara (manager turnamen) |

Satu keputusan admin menghasilkan **satu** notifikasi — bukan satu per baris hasil.

Setiap notifikasi punya `referenceId` yang dipakai UI untuk menautkan ke detail
pengajuan atau halaman kelola hasil. Pengguna lain mendapat `404`, bukan `403`,
sehingga keberadaan notifikasi tidak terbocorkan.

### Ganti kata sandi

1. Kata sandi saat ini diverifikasi dengan `bcrypt.compare`.
2. Kata sandi baru di-hash dengan bcryptjs (cost dari `BCRYPT_SALT_ROUNDS`).
3. `token_version` dinaikkan → **semua token lama langsung ditolak**.
4. Server menerbitkan cookie baru dengan versi terbaru, sehingga perangkat yang
   sedang dipakai tetap login sementara sesi lain dikeluarkan.

## Favorit & Artikel Tersimpan

Dua fitur personal yang memakai tabel `user_games` dan `bookmarks`.

### Endpoint

| Method | Path | Akses | Keterangan |
| --- | --- | --- | --- |
| `GET` | `/me/favorites` | login | Daftar game favorit pengguna |
| `POST` | `/me/favorites/:gameId` | login | Simpan game sebagai favorit |
| `DELETE` | `/me/favorites/:gameId` | login | Hapus game dari favorit |
| `GET` | `/me/bookmarks` | login | Daftar artikel tersimpan pengguna |
| `POST` | `/me/bookmarks/:articleId` | login | Simpan artikel |
| `DELETE` | `/me/bookmarks/:articleId` | login | Hapus artikel dari simpanan |

Aturan yang berlaku:

- Hanya game berstatus `PUBLISHED` yang bisa difavoritkan; sisanya `404`.
- Hanya artikel `PUBLISHED` yang sudah tayang yang bisa disimpan; sisanya `404`.
- Menyimpan dua kali tidak menggandakan data — permintaan kedua dibalas `200`
  (idempoten), bukan `409`.
- Menghapus yang tidak ada tetap aman (`200`, `dihapus: 0`).
- Setiap pengguna hanya melihat dan mengubah miliknya sendiri.

Halaman: `/profile/favorites` dan `/profile/bookmarks`. Tombol simpan tersedia di
halaman detail game dan artikel.

## Komunitas & Ruang Discord

Halaman `/community` menggabungkan dua hal: **direktori ruang Discord** yang
divalidasi admin dan **feed diskusi** komunitas.

### Endpoint ruang Discord

| Method | Path | Akses | Keterangan |
| --- | --- | --- | --- |
| `GET` | `/community/discord-rooms` | **login** | Rekomendasi ruang `APPROVED` saja |
| `GET` | `/community/discord-rooms/mine` | login | Pengajuan milik sendiri + status & catatan admin |
| `POST` | `/community/discord-rooms` | login | Ajukan ruang baru (`PENDING`) |
| `PATCH` | `/community/discord-rooms/:id` | pemilik | Perbaiki pengajuan, status kembali `PENDING` |
| `GET` | `/admin/discord-rooms` | admin | Antrean validasi (`status`, `q`, paginasi) |
| `PATCH` | `/admin/discord-rooms/:id/review` | admin | `APPROVED` / `REJECTED` + catatan |

Aturan yang berlaku:

- Tautan wajib `https://discord.gg/<kode>` atau `https://discord.com/invite/<kode>`;
  format lain ditolak `400 VALIDATION_ERROR`.
- Tautan dinormalkan (host huruf kecil, garis miring akhir dibuang) dan **unik** —
  duplikat dibalas `409 CONFLICT`.
- Ruang `PENDING`/`REJECTED` **tidak pernah** tampil di rekomendasi.
- Menolak wajib menyertakan catatan; keputusan mengirim notifikasi
  `DISCORD_ROOM_APPROVED` / `DISCORD_ROOM_REJECTED` ke pengaju.
- Ruang yang sudah diputuskan tidak dapat ditinjau ulang (`409`).
- Respons rekomendasi tidak memuat identitas pengaju maupun catatan admin.
- **Rekomendasi ruang hanya untuk anggota.** Tamu yang belum masuk mendapat `401
  UNAUTHORIZED`; antarmuka menampilkan ajakan Masuk/Daftar alih-alih daftar ruang.

Sidebar hanya memuat menu utama dan kartu ajakan bergabung ke Discord dengan
tombol **Gabung** menuju `/community#discord`. Seluruh fitur akun — Favorit saya,
Artikel tersimpan, Notifikasi (dengan badge belum dibaca), Pengajuan saya,
Pengaturan akun, dan Keluar — berada di dropdown ikon profil pada header, di
samping kolom pencarian.

### Endpoint diskusi komunitas

| Method | Path | Akses | Keterangan |
| --- | --- | --- | --- |
| `GET` | `/community/posts` | publik | Daftar postingan (`category`, `q`, `sort`, paginasi) |
| `GET` | `/community/posts/:id` | publik | Detail + komentar |
| `POST` | `/community/posts` | login | Buat postingan |
| `PATCH` | `/community/posts/:id` | pemilik/admin | Ubah postingan |
| `DELETE` | `/community/posts/:id` | pemilik/admin | Hapus postingan |
| `POST` | `/community/posts/:id/comments` | login | Tambah komentar |
| `DELETE` | `/community/comments/:id` | pemilik/admin | Hapus komentar |
| `POST` | `/community/posts/:id/like` | login | Suka / batal suka |
| `GET` | `/admin/community/posts` | admin | Moderasi (termasuk tersembunyi) |
| `PATCH` | `/admin/community/posts/:id/hide` | admin | Sembunyikan / tampilkan |
## Panel Admin

`/admin` memakai tata letak khusus yang terpisah dari tata letak publik
(`AdminLayout`), dengan sidebar gelap dan delapan menu:

| Menu | Rute |
| --- | --- |
| Dashboard | `/admin` |
| Kelola Game | `/admin/games` |
| Kelola Berita | `/admin/articles` |
| Kelola Turnamen | `/admin/tournaments` (tab **Turnamen**, **Pengajuan**, **Perubahan**) |
| Kelola Komunitas | `/admin/community` (tab **Postingan**, **Ruang Discord**) |
| Kelola Pengguna | `/admin/users` |
| Laporan & Statistik | `/admin/reports` |
| Pengaturan | `/admin/settings` |

Menu **Kelola Turnamen** menyatukan tiga alur:

| Tab | Fungsi |
| --- | --- |
| Turnamen | Publikasi turnamen, tinjau hasil, kelola hasil per turnamen |
| Pengajuan | Setujui / minta revisi / tolak pengajuan dari pengguna, termasuk pratinjau detail |
| Perubahan | Setujui / tolak pembaruan informasi dari penyelenggara; langsung diterapkan saat disetujui |

Menu **Kelola Komunitas** menyatukan dua alur:

| Tab | Fungsi |
| --- | --- |
| Postingan | Sembunyikan/tampilkan postingan yang melanggar aturan |
| Ruang Discord | Setujui / tolak pengajuan ruang Discord sebelum tampil di halaman anggota |

Rute lama `/admin/submissions`, `/admin/change-requests`, dan
`/admin/discord-rooms` masih tersedia.

Endpoint laporan:

| Method | Path | Akses | Keterangan |
| --- | --- | --- | --- |
| `GET` | `/admin/reports` | admin | Ringkasan konten, pengguna, seri aktivitas 14 hari, game populer, kontributor |
## Manajemen Admin

Administrator dapat mengelola konten, pengguna, dan melihat ringkasan sistem.

### Endpoint

| Method | Path | Keterangan |
| --- | --- | --- |
| `GET` | `/admin/dashboard` | Ringkasan jumlah data sistem + pengajuan terbaru |
| `GET` | `/admin/games` | Daftar game **termasuk `DRAFT`** (`q`, `status`, paginasi) |
| `POST` | `/admin/games` | Buat game baru |
| `PATCH` | `/admin/games/:id` | Ubah game / terbitkan / terbturkan |
| `DELETE` | `/admin/games/:id` | Hapus game (ditolak `409` bila masih dirujuk artikel atau pengajuan) |
| `GET` | `/admin/articles` | Daftar artikel **termasuk `DRAFT`** |
| `POST` | `/admin/articles` | Buat artikel baru |
| `PATCH` | `/admin/articles/:id` | Ubah artikel |
| `DELETE` | `/admin/articles/:id` | Hapus artikel (ditolak `409` bila masih disimpan pengguna) |
| `GET` | `/admin/users` | Daftar pengguna (`q`, `role`, paginasi) |
| `PATCH` | `/admin/users/:id` | Ubah peran (`USER`/`ADMIN`) dan status aktif |

Ketentuan:

- **Peran tidak pernah dibuat baru** — hanya `USER` dan `ADMIN` yang sudah ada.
- Admin **tidak dapat** menurunkan peran atau menonaktifkan akunnya sendiri (`409`).
- Menonaktifkan pengguna menaikkan `token_version` → semua sesinya langsung keluar.
- Tidak ada role baru dan tidak ada mekanisme penugasana manager (keputusan M-31).

Halaman: `/admin` (dashboard), `/admin/games`, `/admin/articles`, `/admin/users`.

## Unggah Gambar (Cloudinary)

| Method | Path | Keterangan |
| --- | --- | --- |
| `GET` | `/me/uploads/status` | Apakah unggahan aktif di server ini |
| `POST` | `/me/uploads/avatar` | Unggah avatar (data URL base64, maks 2 MB) |
| `POST` | `/admin/uploads` | Unggah sampul/thumbnail konten |

Unggahan memakai **REST API Cloudinary secara langsung** (tanpa SDK, tanpa
dependency baru). Format yang diizinkan: JPEG, PNG, WebP, GIF.

**Belum aktif secara bawaan**: bila `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`,
atau `CLOUDINARY_API_SECRET` kosong di `backend/.env`, endpoint membalas `400`
dengan pesan konfigurasi dan tombol unggah **tidak ditampilkan** di antarmuka.


**Email tidak dapat diubah** pada tahap ini karena memerlukan alur verifikasi email
yang belum dibangun. UI menampilkannya sebagai informasi, bukan kolom input.

## Konvensi API

Semua respons memakai satu bentuk.

Sukses:

```json
{ "success": true, "data": {}, "meta": { "page": 1, "limit": 12, "total": 0 } }
```

Gagal:

```json
{ "success": false, "error": { "code": "NOT_FOUND", "message": "..." } }
```

Kode error: `VALIDATION_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`,
`CONFLICT`, `RATE_LIMITED`, `INTERNAL_ERROR`.

## Perintah yang tersedia

**backend**

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Jalankan API dengan auto-reload |
| `npm run build` | Kompilasi TypeScript ke `dist/` |
| `npm start` | Jalankan hasil build |
| `npm run typecheck` | Cek tipe tanpa menulis berkas |
| `npm run prisma:generate` | Buat Prisma Client |
| `npm run prisma:validate` | Validasi `schema.prisma` |
| `npm run prisma:migrate` | Buat & terapkan migration |
| `npm run prisma:studio` | Buka Prisma Studio |
| `npm run db:seed` | Isi/perbarui data contoh (idempoten) |
| `npm run db:verify` | Verifikasi struktur database (96 cek) |
| `npm run db:verify-seed` | Verifikasi data & integritas (48 cek) |
| `npm run auth:verify` | Verifikasi E2E autentikasi (52 cek, perlu server berjalan) |

**frontend**

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Dev server di port 5173 |
| `npm run build` | Typecheck + build produksi ke `dist/` |
| `npm run preview` | Pratinjau hasil build |
| `npm run typecheck` | Cek tipe |
| `npm test` | Jalankan seluruh test (Vitest) |
| `npm run test:watch` | Test dalam mode watch |

## Pengujian otomatis

Keduanya memakai **Vitest**.

```bash
cd backend  && npm test    # 304 test: unit + API (Supertest)
cd frontend && npm test    # 162 test: utilitas + komponen (Testing Library)
```

**Test backend memakai database terpisah** `playora_test` yang dibuat otomatis
dari `backend/.env.test`. Database pengembangan `playora_db` **tidak pernah**
disentuh oleh test — `tests/globalSetup.ts` menolak berjalan bila nama database
tidak berakhiran `_test`.

Rincian cakupan:

| Berkas | Cakupan |
| --- | --- |
| `tests/unit/jwt.test.ts` | Tanda tangan/verifikasi token, token dipalsukan, algoritma `none` |
| `tests/unit/csrf.test.ts` | Format token, tanda tangan palsu, perbandingan waktu-konstan, parser durasi |
| `tests/unit/games-query.test.ts` | Validasi & normalisasi query katalog |
| `tests/api/games.test.ts` | Daftar, pencarian, filter, pagination, detail, DRAFT tersembunyi, filter meta |
| `tests/api/articles.test.ts` | Tipe berita/panduan, kategori, pencarian, pagination, DRAFT & terjadwal tersembunyi, lintas-tipe 404 |
| `tests/api/tournaments.test.ts` | Filter status, pagination, gerbang publik (belum terbit / pengajuan PENDING & REJECTED), detail + hasil, 404 |
| `tests/api/submissions.test.ts` | Validasi form, kepemilikan, alur PENDING→REVISI→PENDING→APPROVED/REJECTED, anti-turnamen-ganda, notifikasi, transaksi |
| `tests/api/tournament-management.test.ts` | Hak akses hasil, kepemilikan turnamen, pengajuan hasil, persetujuan/penolakan satuan & massal, publikasi, anti-regresi hasil publik, audit |
| `tests/api/notifications.test.ts` | Isolasi antar pengguna, unread count, tandai satu & semua dibaca, tipe notifikasi hasil |
| `tests/api/profile.test.ts` | Ubah profil, validasi username/avatar, ganti kata sandi, bcrypt, token_version, sesi bertahan |
| `tests/api/personal.test.ts` | Favorit game & simpanan artikel: isolasi antar pengguna, 404 data fiktif, simpan idempoten, hapus aman |
| `tests/api/admin-management.test.ts` | CRUD game & artikel, slug duplikat, status terbit, kelola peran/aktif pengguna, dashboard |
| `tests/api/admin-reports.test.ts` | Ringkasan laporan, seri aktivitas 14 hari, peringkat game & kontributor |
| `tests/api/uploads.test.ts` | Unggah avatar/konten: validasi data URL, allow-list format, guard konfigurasi Cloudinary |
| `tests/api/auth-token-version.test.ts` | Siklus sesi + pencabutan token lewat `token_version` |
| `tests/api/community.test.ts` | Postingan, komentar, suka, moderasi, isolasi data tersembunyi |
| `tests/api/discord-rooms.test.ts` | Pengajuan ruang, validasi tautan & duplikat, kepemilikan, persetujuan/penolakan, notifikasi, gerbang publik |
| `src/lib/games.test.ts` | Penyusunan parameter query game & hitung halaman |
| `src/lib/articles.test.ts` | Pemetaan kategori→jalur, penyusunan parameter, hitung halaman |
| `src/lib/tournaments.test.ts` | Parameter status, format rentang tanggal, label peringkat, hitung halaman |
| `src/lib/submissions.test.ts` | Label status pengajuan, aturan boleh-revisi, pembersihan payload form |
| `src/lib/management.test.ts` | Label status hasil, validasi hasil lokal, penomoran ulang peringkat, parameter filter |
| `src/lib/account.test.ts` | Parameter notifikasi, tautan per tipe, metadata kelompok & warna |
| `src/lib/personal.test.ts` | Deteksi favorit & simpanan pada daftar pengguna |
| `src/lib/admin.test.ts` | Parameter filter admin, pembentukan slug, label & warna status, format tanggal |
| `src/lib/discord.test.ts` | Parameter pencarian ruang Discord, format jumlah anggota, label status |
| `src/components/layout/AppLayout.test.tsx` | Gulir ke seksi `#discord`, tautan Gabung sidebar, tombol keluar lama hilang |
| `src/components/discord/DiscordRoomSection.test.tsx` | Gerbang tamu: ajakan masuk, tanpa daftar/kartu/pencarian, hook tidak aktif |
| `src/components/layout/AdminLayout.test.tsx` | Delapan menu panel admin, rute, status aktif, tombol keluar |
| `src/components/layout/Sidebar.test.tsx` | Sidebar hanya menu utama + ajakan Discord, tanpa blok Akun saya |
| `src/components/layout/Header.test.tsx` | Fitur akun & badge notifikasi di dropdown profil |
| `src/pages/public/TournamentsPage.test.tsx` | Tombol ajukan turnamen untuk anggota, ajakan masuk untuk tamu |
| `src/pages/admin/AdminTournamentsPage.test.tsx` | Tiga tab pengelolaan turnamen, tab aktif, panel yang dirender |
| `src/pages/admin/AdminSubmissionsPage.test.tsx` | Pratinjau detail pengajuan sebelum keputusan admin |
| `src/pages/admin/AdminCommunityPage.test.tsx` | Dua tab kelola komunitas, tab aktif, panel ruang Discord |
| `src/components/ui/*.test.tsx` | Render kartu game, kartu artikel, kartu turnamen, empty/error/loading state |

## Catatan penting

- `npm run db:seed` bersifat **idempoten sekaligus memperbaiki**: setiap entri data
  contoh ditulis ulang dengan nilai terkini saat seed dijalankan ulang. Baris lama
  yang tertinggal dari versi seed sebelumnya ikut diperbaiki — termasuk
  `reviewed_by`, `submitted_by`, `admin_note`, `team_count`, `registration_method`,
  dan jejak audit (`tournament_result_reviews`) hasil pertandingan. Verifikasi
  atas hal ini dilakukan oleh `npm run db:verify-seed`.
- Berkas `.env` **tidak** di-commit. Hanya `.env.example` yang masuk repositori.
- `JWT_SECRET` dan `CSRF_SECRET` pada `.env` pengembangan adalah nilai sementara.
  Wajib diganti dengan nilai acak yang berbeda sebelum deployment.
- **`NODE_ENV=production` mewajibkan HTTPS.** Cookie sesi memakai flag `Secure`,
  sehingga aplikasi tidak akan berfungsi bila disajikan lewat HTTP biasa.
- Endpoint yang mengubah data **mewajibkan header `Origin`**. Klien non-browser
  (curl, Postman) harus mengirimkannya secara eksplisit.
- Komunitas (postingan, komentar, moderasi) **sudah tersedia** pada Tahap 10,
  bersama direktori ruang Discord. Ruang Discord hanya tampil publik setelah
  disetujui admin.
- Database `db_turnamen` yang ada di server lokal **bukan** milik PLAYORA.
  Jangan dipakai atau dimodifikasi.
- `backend/.env.test` **ikut di-commit** karena hanya berisi nilai khusus
  pengujian, bukan kredensial nyata.
- Game memiliki status `DRAFT`/`PUBLISHED`. Migration pertama yang menambahkan
  kolom ini menyertakan backfill `PUBLISHED` untuk game yang sudah ada, sehingga
  katalog lama tidak hilang dari halaman publik.
- Artikel tayang hanya bila `status = PUBLISHED` **dan** `publishedAt <= sekarang`.
  Artikel `DRAFT` maupun yang dijadwalkan ke masa depan tidak dapat diakses publik.
- Turnamen tayang hanya bila `is_published = true` **dan** pengajuan terkait (bila ada)
  berstatus `APPROVED`. Status `Mendatang`/`Berlangsung`/`Selesai` **dihitung** dari
  tanggal, bukan kolom tersimpan.
- `team_count` dan `registration_method` ditambahkan pada Tahap 7 dan bersifat
  **nullable** di database karena baris lama tidak memilikinya; wajib diisi untuk
  pengajuan baru lewat validasi Zod.
- 15 dokumen spesifikasi di root masih kosong dan akan diisi mengikuti
  perkembangan implementasi, bukan dibuat di muka.
