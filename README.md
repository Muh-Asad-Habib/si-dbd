# SI-DBD — Sistem Informasi Skrining Demam Berdarah Dengue

Aplikasi web skrining mandiri gejala **Demam Berdarah Dengue (DBD)** untuk masyarakat umum. Responden mengisi persetujuan, identitas, dan 10 pertanyaan Ya/Tidak. Setelah itu aplikasi menampilkan hasil, rekomendasi tindak lanjut, dan edukasi.

> **Disclaimer:** Hasil skrining **bukan diagnosis medis**. DBD hanya dapat dipastikan melalui pemeriksaan tenaga kesehatan dan laboratorium. Dalam keadaan darurat hubungi **112** / **119**.

## Fitur

- **Beranda & persetujuan.** Penjelasan aplikasi dan tujuan skrining. Tombol **Mulai skrining** membuka pop-up persetujuan. Skrining baru dimulai setelah kotak persetujuan dicentang. Persetujuan diminta lagi untuk setiap skrining baru.
- **Identitas responden.** Nama, usia, jenis kelamin, dan domisili (kecamatan/kelurahan). Tidak meminta NIK atau nomor HP. Nama tidak ditampilkan di halaman hasil publik.
- **Tersimpan di perangkat.** Identitas, draf jawaban, dan riwayat disimpan di `localStorage`. Pengguna tidak perlu mengisi identitas ulang. Tautan **Ganti orang** tersedia untuk responden berbeda.
- **Kuesioner 10 pertanyaan.** Satu pertanyaan per layar, progress bar, dan halaman tinjau sebelum kirim. Peringatan darurat muncul bila tanda bahaya dijawab Ya.
- **Hasil skrining.** Skor komponen (x/4), tingkat risiko (hijau/kuning/merah), interpretasi, dan rekomendasi. Setiap hasil punya kode unik (mis. `DBD-261123-1A2B3C`).
- **Aksi hasil.** Salin kode, simpan PDF/cetak, bagikan ke WhatsApp, pengingat Google Calendar, dan cari faskes terdekat.
- **Edukasi.** Fase penyakit, tanda bahaya, perawatan di rumah, 3M Plus, serta mitos vs fakta.
- **Layanan.** Nomor darurat, tautan puskesmas terdekat (Google Maps), dan daftar fasilitas kesehatan.
- **Riwayat.** Cari hasil dengan kode dan lihat riwayat di perangkat.
- **Dashboard petugas** di alamat rahasia `/<ADMIN_PATH>` (bukan `/admin`), login kata sandi, tampilan dioptimalkan untuk HP. Statistik, grafik 30 hari, sebaran kecamatan, frekuensi jawaban per pertanyaan, ekspor CSV, serta **hapus data** per responden atau semuanya (untuk uji coba). Setiap penghapusan meminta konfirmasi; hapus semua wajib mengetik `HAPUS`.

## Desain

- Gaya layanan publik yang datar dan jelas, terinspirasi GOV.UK dan NHS. Tanpa animasi dan dekorasi.
- Diutamakan untuk HP. Teks besar, tombol dan pilihan jawaban besar, satu pertanyaan per layar.
- Navigasi lewat tombol **Menu** di header, tanpa navbar bawah.
- Tombol **AA** di header memperbesar teks. Tombol **Bacakan pertanyaan** membacakan soal dengan suara.
- Fokus keyboard terlihat jelas dan pesan kesalahan muncul di atas formulir.

## Logika skrining

Pertanyaan diberi nomor P1–P10 (teks lengkap di `src/lib/questions.ts`).

| Komponen | Terpenuhi bila |
|---|---|
| K1 Demam mendadak | P1 = Ya |
| K2 Gejala penyerta | Minimal 2 dari P2, P4, P5 = Ya |
| K3 Manifestasi kulit/perdarahan | P3 atau P8 = Ya |
| K4 Tanda bahaya | Salah satu dari P6–P10 = Ya |

| Tingkat | Aturan | Rekomendasi |
|---|---|---|
| Merah — Segera ditangani | K4 terpenuhi | Segera ke IGD/puskesmas |
| Kuning — Perlu diperiksa | K1 dan (K2 atau K3) | Periksa ke puskesmas, cek darah |
| Hijau — Risiko rendah | Selain di atas | Pantau gejala, cegah dengan 3M Plus |

Logika ada di `src/lib/scoring.ts`.

## Teknologi

- [Next.js 15](https://nextjs.org) (App Router) + TypeScript
- Tailwind CSS v4, lucide-react, Recharts
- [Neon](https://neon.tech) Postgres + Drizzle ORM
- Zod untuk validasi input

## Menjalankan secara lokal

Prasyarat: Node.js 20+ dan database Neon (paket gratis cukup).

```bash
git clone https://github.com/Muh-Asad-Habib/si-dbd.git
cd si-dbd
npm install
cp .env.example .env.local   # lalu isi nilainya
npm run db:migrate           # membuat tabel di database
npm run dev                  # http://localhost:3000
```

### Variabel lingkungan

| Nama | Keterangan |
|---|---|
| `DATABASE_URL` | Connection string Neon Postgres |
| `ADMIN_PASSWORD` | Kata sandi login dashboard petugas |
| `ADMIN_PATH` | Segmen URL rahasia dashboard, mis. `petugas-8f3kq2...`. Dashboard dibuka di `/<ADMIN_PATH>` |
| `ADMIN_SECRET` | String acak panjang untuk menandatangani cookie admin |

Jangan commit `.env.local`. File ini sudah masuk `.gitignore`.

## Pratinjau publik sementara (Cloudflare Tunnel)

Gunakan cara ini untuk membagikan tautan ke klien tanpa hosting:

```bash
npm run build
npm start
cloudflared tunnel --url http://localhost:3000 --protocol http2
```

Tautan `https://xxxx.trycloudflare.com` hanya aktif selama komputer, server, dan tunnel menyala.

## Deploy (Netlify + Neon)

1. Push repo ke GitHub.
2. Di Netlify pilih **Add new site → Import from Git**, lalu pilih repo ini. Next.js terdeteksi otomatis.
3. Isi `DATABASE_URL`, `ADMIN_PASSWORD`, `ADMIN_PATH`, dan `ADMIN_SECRET` di **Site configuration → Environment variables**.
4. Deploy.

Alternatif gratis lain: Cloudflare Workers (via OpenNext) atau Render.

## Menyesuaikan data wilayah dan faskes

- Kecamatan/kelurahan: `src/data/regions.json` (bawaan: Kota Makassar).
- Daftar fasilitas kesehatan: `src/data/facilities.ts`.
- Teks pertanyaan: `src/lib/questions.ts`.

Data wilayah dan faskes bawaan adalah **contoh**. Verifikasi dengan data resmi dinas kesehatan sebelum dipakai.

## Struktur folder

```
src/
  app/            halaman (beranda, skrining, hasil, riwayat, edukasi, layanan, admin) dan API
  components/     komponen UI
  data/           data wilayah dan faskes
  lib/            skoring, pertanyaan, DB, auth, validasi, localStorage
scripts/
  migrate.mjs     membuat tabel database
```

## Privasi

- Data identitas hanya nama, tanpa NIK atau nomor HP.
- Data di perangkat tersimpan di `localStorage` dan bisa dihapus dari halaman **Riwayat**.
- Data di server: nama, usia, jenis kelamin, wilayah, jawaban, dan hasil skrining. Petugas dapat menghapusnya dari dashboard.

## Keamanan dashboard petugas

- Dashboard hanya terbuka di `/<ADMIN_PATH>`. Akses langsung ke `/admin` atau `/api/admin/*` tanpa sesi petugas akan mendapat 404.
- Tidak ada tautan ke dashboard di halaman publik. Bagikan alamatnya hanya ke petugas.
- Login dibatasi 5 kali gagal per IP, lalu dikunci 15 menit.
- Cookie sesi `httpOnly`, berlaku 8 jam. Halaman dikirim dengan `noindex` dan `Referrer-Policy: no-referrer`.
- Ganti `ADMIN_PATH` dan `ADMIN_PASSWORD` bila alamat atau kata sandi bocor.
