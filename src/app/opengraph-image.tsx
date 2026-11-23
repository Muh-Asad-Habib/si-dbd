import { ImageResponse } from "next/og";

export const alt = "SI-DBD — Skrining mandiri gejala Demam Berdarah Dengue";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BRAND = "#0b4f8a";
const RED = "#c8102e";

async function loadFont(weight: 400 | 700) {
  try {
    const css = await (
      await fetch(`https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@${weight}`, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 6.1)" },
      })
    ).text();
    const url = css.match(/src: url\((.+?)\) format\('(?:truetype|opentype)'\)/)?.[1];
    return url ? await (await fetch(url)).arrayBuffer() : null;
  } catch {
    return null;
  }
}

// WhatsApp memotong pratinjau kecil menjadi kotak di tengah, jadi logo dan
// judul diletakkan di tengah agar tetap terbaca di kedua ukuran.
export default async function OgImage() {
  const [regular, bold] = await Promise.all([loadFont(400), loadFont(700)]);
  const fonts = [
    ...(regular ? [{ name: "Atkinson", data: regular, weight: 400 as const, style: "normal" as const }] : []),
    ...(bold ? [{ name: "Atkinson", data: bold, weight: 700 as const, style: "normal" as const }] : []),
  ];
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: BRAND,
          color: "#fff",
          fontFamily: fonts.length ? "Atkinson" : "sans-serif",
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 18, background: RED, display: "flex" }} />
        <div
          style={{
            width: 168,
            height: 168,
            borderRadius: 28,
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="128" height="128" viewBox="0 0 40 40">
            <path d="M20 6c-1.4 3-10 12.6-10 19.2a10 10 0 0 0 20 0C30 18.6 21.4 9 20 6Z" fill={RED} />
            <path d="M13.5 25.5h4l2-4 2.5 7 2-3h2.5" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div style={{ marginTop: 36, fontSize: 76, fontWeight: 700, letterSpacing: -1, display: "flex" }}>
          Skrining DBD Mandiri
        </div>
        <div style={{ marginTop: 14, fontSize: 36, opacity: 0.9, display: "flex" }}>
          Cek gejala Demam Berdarah Dengue
        </div>
        <div style={{ marginTop: 34, display: "flex", gap: 16 }}>
          {["10 pertanyaan Ya/Tidak", "± 2 menit", "Gratis"].map((t) => (
            <div
              key={t}
              style={{
                display: "flex",
                fontSize: 28,
                fontWeight: 700,
                padding: "10px 22px",
                borderRadius: 999,
                border: "3px solid rgba(255,255,255,0.75)",
              }}
            >
              {t}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
