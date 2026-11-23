import { Phone } from "lucide-react";

export function EmergencyBanner({ compact = false }: { compact?: boolean }) {
  return (
    <div role="alert" className="border-l-8 border-[#c8102e] bg-[#fdf1f2] p-4">
      <p className="text-lg font-bold text-[#8a0b20]">Anda menjawab Ya pada tanda bahaya</p>
      {!compact && (
        <p className="mt-1 text-lg">
          Jangan menunggu skrining selesai. Segera ke IGD atau fasilitas kesehatan terdekat.
        </p>
      )}
      <div className="mt-3 grid grid-cols-2 gap-3 sm:flex">
        <a
          href="tel:112"
          className="btn min-h-12 bg-[#c8102e] px-4 text-white shadow-[0_4px_0_#7a0a1c] hover:bg-[#a00d25]"
        >
          <Phone className="h-5 w-5" aria-hidden /> 112
        </a>
        <a href="tel:119" className="btn min-h-12 border-2 border-[#c8102e] bg-white px-4 text-[#8a0b20]">
          <Phone className="h-5 w-5" aria-hidden /> Ambulans 119
        </a>
      </div>
    </div>
  );
}
