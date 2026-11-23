import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-2xl">
      <h1 className="page-title">Halaman tidak ditemukan</h1>
      <p className="mt-3 text-lg">Jika Anda mengetik alamat atau kode hasil, periksa apakah sudah benar.</p>
      <p className="mt-2 text-lg">Jika Anda menempelkan tautan, periksa apakah tautannya lengkap.</p>
      <ul className="mt-6 space-y-1 text-lg">
        <li>
          <Link href="/" className="inline-flex min-h-12 items-center text-brand-600 underline underline-offset-4">
            Kembali ke beranda
          </Link>
        </li>
        <li>
          <Link href="/riwayat" className="inline-flex min-h-12 items-center text-brand-600 underline underline-offset-4">
            Cari hasil dengan kode
          </Link>
        </li>
      </ul>
    </div>
  );
}
