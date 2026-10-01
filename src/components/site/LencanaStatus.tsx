export function LencanaStatus({ status }: { status: string }) {
  const gaya =
    status === "lulus"
      ? "bg-primary/10 text-primary"
      : status === "ditolak"
        ? "bg-destructive/10 text-destructive"
        : "bg-secondary text-secondary-foreground";
  const teks = status === "lulus" ? "Diluluskan" : status === "ditolak" ? "Ditolak" : "Menunggu";
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${gaya}`}>{teks}</span>;
}
