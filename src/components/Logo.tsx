// Tanda sederhana: tetes darah putih dengan garis denyut, di atas kotak.
export function Logo({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <rect width="40" height="40" rx="4" fill="#fff" />
      <path d="M20 6c-1.4 3-10 12.6-10 19.2a10 10 0 0 0 20 0C30 18.6 21.4 9 20 6Z" fill="#c8102e" />
      <path
        d="M13.5 25.5h4l2-4 2.5 7 2-3h2.5"
        fill="none"
        stroke="#fff"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
