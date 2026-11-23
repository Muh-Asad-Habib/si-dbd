export type Facility = {
  name: string;
  type: string;
  address: string;
  phone?: string;
  igd24?: boolean;
};

// Data contoh wilayah Kota Makassar. Sesuaikan dengan wilayah klien.
export const FACILITIES: Facility[] = [
  {
    name: "RSUP Dr. Wahidin Sudirohusodo",
    type: "Rumah sakit rujukan",
    address: "Jl. Perintis Kemerdekaan Km. 11, Tamalanrea, Makassar",
    phone: "(0411) 584677",
    igd24: true,
  },
  {
    name: "RS Universitas Hasanuddin",
    type: "Rumah sakit",
    address: "Jl. Perintis Kemerdekaan Km. 10, Tamalanrea, Makassar",
    phone: "(0411) 591331",
    igd24: true,
  },
  {
    name: "RSUD Daya Makassar",
    type: "Rumah sakit daerah",
    address: "Jl. Perintis Kemerdekaan Km. 14, Biringkanaya, Makassar",
    igd24: true,
  },
  {
    name: "RSUD Labuang Baji",
    type: "Rumah sakit daerah",
    address: "Jl. Dr. Ratulangi No. 81, Mamajang, Makassar",
    igd24: true,
  },
  {
    name: "Puskesmas Tamalanrea",
    type: "Puskesmas",
    address: "BTP Blok B, Jl. Kesejahteraan Timur I, Tamalanrea, Makassar",
  },
  {
    name: "Puskesmas Kassi-Kassi",
    type: "Puskesmas",
    address: "Jl. Tamalate I, Kassi-Kassi, Rappocini, Makassar",
  },
  {
    name: "Puskesmas Antang",
    type: "Puskesmas",
    address: "Antang, Manggala, Makassar",
  },
];

export function mapsUrl(f: Facility) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${f.name} ${f.address}`)}`;
}
