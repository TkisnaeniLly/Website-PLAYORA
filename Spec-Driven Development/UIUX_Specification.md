# 9. UI/UX & PAGE SPECIFICATION

## 9.1 UI/UX Overview

PLAYORA menggunakan desain antarmuka modern dengan pendekatan gaming information platform. Tampilan harus memberikan pengalaman yang informatif, interaktif, dan mudah digunakan oleh gamer.

Desain website mengutamakan:

1. Modern Gaming Interface.
2. Clean and Organized Layout.
3. Responsive Design.
4. Consistent Design System.
5. Easy Navigation.
6. Clear Information Hierarchy.

Website harus memiliki pengalaman penggunaan yang baik pada perangkat desktop, tablet, dan smartphone.

## 9.2 Brand Identity & Color System

### Primary Color

Warna utama PLAYORA adalah **Purple** yang digunakan sebagai identitas visual utama website.


### Color Usage Rules

1. Purple menjadi warna identitas utama PLAYORA.
2. Background gelap dan terang digunakan untuk menjaga keterbacaan konten.
3. Warna status digunakan secara konsisten.
4. Penggunaan warna harus memperhatikan kontras antara teks dan background.
5. Warna tidak boleh digunakan sebagai satu-satunya penanda status; sertakan teks atau ikon.

## 9.3 Typography

Website menggunakan jenis huruf sans-serif yang modern dan mudah dibaca.

Rekomendasi:

* **Primary Font:** Inter.
* **Heading:** Menggunakan ukuran dan ketebalan lebih besar untuk membedakan hierarki informasi.
* **Body Text:** Menggunakan ukuran yang nyaman dibaca.
* **Caption:** Digunakan untuk tanggal, kategori, metadata, dan informasi tambahan.

Ketentuan:

1. Heading harus memiliki hierarki yang konsisten.
2. Panjang paragraf dan jarak antarbaris harus nyaman dibaca.
3. Teks tombol harus singkat dan jelas.
4. Informasi penting harus mudah ditemukan.

## 9.4 Layout & Navigation

PLAYORA menggunakan layout responsif dengan navigasi yang menyesuaikan perangkat.

### Desktop Navigation

Navbar utama berisi:

* Logo PLAYORA.
* Home.
* Games.
* News.
* Guides.
* Tournaments.
* Search.
* Login / Register atau Profile.
* Notifications untuk pengguna yang login.

### Mobile Navigation

Pada perangkat mobile:

* Navbar dibuat lebih ringkas.
* Menu navigasi dapat menggunakan hamburger menu.
* Elemen interaktif harus mudah dijangkau dengan sentuhan.
* Konten disusun dalam satu kolom atau layout yang sesuai ukuran layar.

### General Layout

Halaman menggunakan:

* Navbar sebagai navigasi utama.
* Main content sebagai area konten.
* Sidebar jika diperlukan.
* Footer sebagai informasi tambahan dan navigasi pendukung.

## 9.5 Public Pages Specification

### 9.5.1 Home Page

**Purpose:** Menjadi halaman utama yang menampilkan informasi penting dan konten terbaru PLAYORA.

**Main Components:**

* Hero section atau featured news.
* Latest News.
* Popular Games.
* Upcoming Tournaments.
* Latest Guides.
* Community Activity hanya jika modul tersebut tersedia pada pengembangan berikutnya.
* Footer.

**Interactions:**

* Pengguna dapat membuka berita utama.
* Pengguna dapat membuka detail game.
* Pengguna dapat melihat informasi turnamen.
* Pengguna dapat membuka berita dan panduan lainnya.

**Access:** Guest, Registered User, Admin.

### 9.5.2 Game Catalog Page

**Purpose:** Menampilkan katalog game yang tersedia di PLAYORA.

**Main Components:**

* Page heading.
* Search input.
* Platform filter.
* Genre filter.
* Game cards.
* Pagination.

**Game Card Information:**

* Cover image.
* Game title.
* Platform.
* Genre.

**Interactions:**

* Mencari game berdasarkan nama atau judul.
* Memfilter berdasarkan platform.
* Memfilter berdasarkan genre.
* Membuka detail game.
* Menambahkan game ke Favorites jika sudah login.

**Access:** Public.

### 9.5.3 Game Detail Page

**Purpose:** Menampilkan informasi lengkap mengenai game yang dipilih.

**Main Components:**

* Game cover atau banner.
* Game title.
* Description.
* Developer.
* Publisher.
* Release date.
* Platform.
* Genre.
* Favorite button.
* Related content jika tersedia.

**Interactions:**

* Membuka informasi game.
* Menambahkan atau menghapus game dari Favorites.
* Mengakses berita atau panduan terkait jika relasinya tersedia.

**Access:** Public, dengan fitur Favorites khusus Registered User.

### 9.5.4 News Page

**Purpose:** Menampilkan kumpulan berita dan informasi terbaru seputar game.

**Main Components:**

* Page heading.
* Featured news.
* News cards.
* Category filter.
* Pagination.

**Categories:**

* News.
* Update.
* Review.
* Esports.

**News Card Information:**

* Cover image.
* Title.
* Excerpt.
* Category.
* Publication date.

**Interactions:**

* Membuka detail berita.
* Memfilter berita berdasarkan kategori.
* Menyimpan berita ke Bookmarks jika sudah login.

**Access:** Public, dengan fitur Bookmarks khusus Registered User.

### 9.5.5 News Detail Page

**Purpose:** Menampilkan isi berita secara lengkap.

**Main Components:**

* News title.
* Cover image.
* Category.
* Author.
* Publication date.
* Article content.
* Bookmark button.
* Related news jika tersedia.

**Interactions:**

* Membaca isi berita.
* Menyimpan atau menghapus berita dari Bookmarks.
* Membuka berita terkait jika tersedia.

**Access:** Public, dengan fitur Bookmarks khusus Registered User.

### 9.5.6 Guides Page

**Purpose:** Menampilkan kumpulan tips, tutorial, dan panduan game.

**Main Components:**

* Page heading.
* Featured guides.
* Guide cards.
* Category filter.
* Pagination.

**Categories:**

* Tips.
* Tutorial.
* Game Guide.

**Guide Card Information:**

* Cover image.
* Title.
* Excerpt.
* Category.
* Publication date.

**Interactions:**

* Membuka detail panduan.
* Memfilter berdasarkan kategori.
* Menyimpan panduan ke Bookmarks jika sudah login.

**Access:** Public, dengan fitur Bookmarks khusus Registered User.

### 9.5.7 Guide Detail Page

**Purpose:** Menampilkan panduan game secara lengkap.

**Main Components:**

* Guide title.
* Cover image.
* Category.
* Author.
* Publication date.
* Guide content.
* Bookmark button.
* Related guides jika tersedia.

**Interactions:**

* Membaca panduan.
* Menyimpan atau menghapus panduan dari Bookmarks.
* Membuka panduan terkait jika tersedia.

**Access:** Public, dengan fitur Bookmarks khusus Registered User.

### 9.5.8 Tournament Page

**Purpose:** Menampilkan daftar turnamen game.

**Main Components:**

* Page heading.
* Tournament cards.
* Game filter.
* Tournament status filter.
* Pagination.
* Tournament submission button sesuai hak akses.

**Tournament Card Information:**

* Tournament image.
* Tournament name.
* Game.
* Organizer.
* Schedule.
* Prize.
* Tournament status.

**Interactions:**

* Melihat daftar turnamen.
* Memfilter turnamen.
* Membuka detail turnamen.
* Mengajukan informasi turnamen sesuai ketentuan akses.

**Access:** Public, dengan pengajuan turnamen mengikuti aturan autentikasi yang ditetapkan.

### 9.5.9 Tournament Detail Page

**Purpose:** Menampilkan informasi lengkap mengenai turnamen.

**Main Components:**

* Tournament cover.
* Tournament name.
* Game.
* Organizer.
* Schedule.
* Registration deadline.
* Team count.
* Prize.
* Requirements.
* Registration method.
* Tournament status.
* Results jika sudah tersedia.

**Interactions:**

* Melihat informasi turnamen.
* Mengakses metode pendaftaran yang disediakan penyelenggara.
* Melihat hasil turnamen jika tersedia.

**Access:** Public.

## 9.6 Authentication Pages

### 9.6.1 Register Page

**Purpose:** Memungkinkan pengunjung membuat akun PLAYORA.

**Main Components:**

* Username input.
* Email input.
* Password input.
* Confirm password input.
* Register button.
* Login link.

**Interactions:**

* Mengisi data registrasi.
* Melakukan validasi input.
* Menampilkan pesan jika registrasi berhasil atau gagal.

### 9.6.2 Login Page

**Purpose:** Memungkinkan pengguna masuk ke akun PLAYORA.

**Main Components:**

* Email input.
* Password input.
* Login button.
* Register link.

**Interactions:**

* Mengisi email dan password.
* Melakukan autentikasi.
* Menampilkan pesan kesalahan jika login gagal.
* Mengarahkan pengguna sesuai kondisi autentikasi dan role.

## 9.7 Registered User Pages

Halaman berikut hanya dapat diakses oleh pengguna yang sudah login.

### 9.7.1 Profile Page

**Main Components:**

* Avatar.
* Username.
* Email.
* Bio.
* Edit profile button.

**Interactions:**

* Melihat profil.
* Mengubah informasi profil yang diizinkan.

### 9.7.2 Favorites Page

**Main Components:**

* Page heading.
* Favorite game cards.
* Empty state jika belum memiliki game favorit.

**Interactions:**

* Melihat game favorit.
* Menghapus game dari Favorites.
* Membuka detail game.

### 9.7.3 Bookmarks Page

**Main Components:**

* Page heading.
* News bookmarks.
* Guide bookmarks.
* Empty state jika belum menyimpan konten.

**Interactions:**

* Melihat konten tersimpan.
* Membuka detail konten.
* Menghapus konten dari Bookmarks.

### 9.7.4 Notifications Page

**Main Components:**

* Notification list.
* Read/unread indicator.
* Notification timestamp.
* Mark as read button.
* Mark all as read button.

**Interactions:**

* Melihat notifikasi.
* Menandai notifikasi sebagai sudah dibaca.
* Membuka informasi terkait notifikasi jika tersedia.

### 9.7.5 Settings Page

**Main Components:**

* Account information.
* Account preferences yang telah ditetapkan.
* Pengaturan akun.

**Interactions:**

* Mengubah informasi atau preferensi yang memang didukung sistem.

Detail preferensi yang belum diputuskan tidak boleh ditambahkan secara sepihak.

## 9.8 Admin Pages

Admin memiliki dashboard dan halaman pengelolaan data.

### 9.8.1 Admin Dashboard

**Purpose:** Menampilkan ringkasan kondisi sistem.

**Main Components:**

* Total users.
* Total games.
* Total news.
* Total guides.
* Total tournaments.
* Pending tournament submissions.
* Quick navigation ke modul pengelolaan.

### 9.8.2 Game Management

**Main Components:**

* Game data table.
* Search.
* Add game button.
* Edit action.
* Delete action.
* Publication status.

**Interactions:**

* Menambahkan game.
* Mengubah data game.
* Menghapus game.
* Mengelola status publikasi.

### 9.8.3 News Management

**Main Components:**

* News data table.
* Search.
* Category filter.
* Add news button.
* Edit action.
* Delete action.
* Publication status.

**Interactions:**

* Membuat berita.
* Mengubah berita.
* Menghapus berita.
* Mengatur kategori dan status publikasi.

### 9.8.4 Guide Management

**Main Components:**

* Guide data table.
* Search.
* Category filter.
* Add guide button.
* Edit action.
* Delete action.
* Publication status.

**Interactions:**

* Membuat panduan.
* Mengubah panduan.
* Menghapus panduan.
* Mengatur kategori dan status publikasi.

### 9.8.5 Tournament Management

**Main Components:**

* Tournament data table.
* Search.
* Status filter.
* Add tournament button.
* Edit action.
* Delete action.

**Interactions:**

* Membuat turnamen.
* Mengubah informasi turnamen.
* Mengelola status turnamen.
* Mengelola hasil turnamen.

### 9.8.6 Tournament Submission Management

**Main Components:**

* Submission list.
* Submission detail.
* Pending status.
* Approve button.
* Reject button.
* Admin note.

**Interactions:**

* Melihat pengajuan.
* Memeriksa informasi.
* Menyetujui pengajuan.
* Menolak pengajuan.
* Memberikan catatan pemeriksaan.

### 9.8.7 User Management

**Main Components:**

* User data table.
* Search.
* Role information.
* Account status.
* User detail.

**Interactions:**

* Melihat daftar pengguna.
* Melihat detail akun.
* Mengelola status akun.
* Mengelola role sesuai kewenangan.

## 9.9 Reusable UI Components

Komponen yang dapat digunakan kembali pada berbagai halaman:

| Component           | Function                        |
| ------------------- | ------------------------------- |
| Navbar              | Navigasi utama                  |
| Footer              | Informasi dan navigasi tambahan |
| Sidebar             | Navigasi dashboard              |
| Button              | Tombol interaksi                |
| Input               | Input data                      |
| Search Bar          | Pencarian                       |
| Select / Dropdown   | Pemilihan kategori atau filter  |
| Card                | Menampilkan ringkasan konten    |
| Badge               | Menampilkan kategori dan status |
| Modal               | Dialog konfirmasi atau formulir |
| Pagination          | Navigasi halaman data           |
| Data Table          | Menampilkan data Admin          |
| Toast / Alert       | Menampilkan pesan sistem        |
| Empty State         | Tampilan ketika data kosong     |
| Loading State       | Indikator proses pemuatan       |
| Confirmation Dialog | Konfirmasi tindakan penting     |

Komponen harus memiliki tampilan dan perilaku yang konsisten.

## 9.10 UI States & Feedback

Setiap halaman yang mengambil atau mengubah data harus memperhatikan kondisi berikut:

1. **Loading State:** Ditampilkan ketika data sedang dimuat.
2. **Empty State:** Ditampilkan ketika belum ada data.
3. **Error State:** Ditampilkan ketika terjadi kesalahan.
4. **Success Feedback:** Ditampilkan ketika tindakan berhasil.
5. **Disabled State:** Digunakan ketika tindakan tidak dapat dilakukan.
6. **Confirmation State:** Digunakan untuk tindakan penting seperti penghapusan data.

Sistem tidak boleh menampilkan halaman kosong tanpa penjelasan ketika terjadi kesalahan atau data belum tersedia.

## 9.11 Responsive Design Requirements

PLAYORA harus mendukung:

* Mobile.
* Tablet.
* Laptop.
* Desktop.

Ketentuan:

1. Layout menyesuaikan ukuran layar.
2. Navbar desktop berubah menjadi navigasi mobile.
3. Grid card menyesuaikan lebar perangkat.
4. Gambar tidak boleh terpotong secara tidak wajar.
5. Tabel Admin harus tetap dapat digunakan pada layar kecil.
6. Tidak boleh ada horizontal overflow yang tidak diperlukan.
7. Tombol dan input harus nyaman digunakan melalui layar sentuh.
8. Ukuran teks harus tetap mudah dibaca.

## 9.12 UI/UX Implementation Rules

AI harus mengikuti aturan berikut saat membangun frontend:

1. Menggunakan React.js dan TypeScript.
2. Menggunakan Tailwind CSS dan shadcn/ui.
3. Membuat komponen yang reusable.
4. Menjaga konsistensi layout dan navigasi.
5. Mengimplementasikan seluruh halaman sesuai spesifikasi MVP.
6. Menghubungkan komponen interaktif dengan backend API.
7. Tidak menggunakan data dummy sebagai pengganti database pada implementasi final.
8. Menampilkan loading, empty, error, dan success state.
9. Memastikan setiap halaman responsif.
10. Tidak menambahkan halaman atau fitur di luar MVP tanpa persetujuan.
11. Memastikan tampilan Guest, Registered User, dan Admin sesuai hak akses masing-masing.
12. Menggunakan data aktual dari API setelah integrasi backend selesai.

## 9.13 Design Reference & Assets

Desain Figma yang disediakan tim PLAYORA menjadi referensi visual utama jika tersedia.

Jika desain Figma belum lengkap:

* AI boleh menggunakan spesifikasi pada dokumen ini sebagai dasar desain.
* AI harus mempertahankan identitas visual Navy Blue.
* AI tidak boleh mengubah struktur fitur dan kebutuhan sistem.
* Komponen visual yang belum ditentukan boleh menggunakan keputusan desain yang konsisten, selama tidak mengubah fungsi atau ruang lingkup MVP.

Seluruh aset gambar harus berasal dari sumber yang sah atau aset yang disediakan proyek. Gambar placeholder hanya diperbolehkan selama tahap pengembangan dan harus diganti sebelum finalisasi jika konten sebenarnya sudah tersedia.
