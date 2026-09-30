export const KADAR_FAEDAH_HARIAN = 0.00005; // 0.005% sehari

export const ringgit = (n: number) =>
  new Intl.NumberFormat("ms-MY", {
    style: "currency",
    currency: "MYR",
    maximumFractionDigits: 2,
  }).format(n);

/**
 * Jana maksimum 3 pilihan jumlah pinjaman daripada had kredit yang diluluskan.
 * Had kecil menghasilkan lebih sedikit pilihan, sekurang-kurangnya satu.
 */
export function pilihanJumlah(hadKredit: number): number[] {
  if (!hadKredit || hadKredit <= 0) return [];
  const bulat = hadKredit >= 1000 ? 100 : 10;
  const calon = [0.3, 0.6, 1].map((n) => Math.floor((hadKredit * n) / bulat) * bulat);
  const unik = Array.from(new Set(calon.filter((n) => n > 0))).sort((a, b) => a - b);
  return unik.length > 0 ? unik.slice(-3) : [hadKredit];
}

export type PinjamanAsas = {
  jumlah_pokok: number;
  kadar_faedah_harian: number;
  jumlah_dibayar: number;
  tarikh_lulus: string | null;
  tarikh_selesai: string | null;
};

export function hariBerjalan(p: PinjamanAsas): number {
  if (!p.tarikh_lulus) return 0;
  const mula = new Date(p.tarikh_lulus).getTime();
  const tamat = p.tarikh_selesai ? new Date(p.tarikh_selesai).getTime() : Date.now();
  return Math.max(0, Math.floor((tamat - mula) / 86_400_000));
}

export function jumlahFaedah(p: PinjamanAsas): number {
  return Math.round(p.jumlah_pokok * p.kadar_faedah_harian * hariBerjalan(p) * 100) / 100;
}

export function jumlahTagihan(p: PinjamanAsas): number {
  return Math.round((p.jumlah_pokok + jumlahFaedah(p)) * 100) / 100;
}

export function bakiTagihan(p: PinjamanAsas): number {
  return Math.max(0, Math.round((jumlahTagihan(p) - p.jumlah_dibayar) * 100) / 100);
}

export function labelStatusPinjaman(status: string) {
  switch (status) {
    case "aktif":
      return "Aktif";
    case "selesai":
      return "Selesai";
    case "ditolak":
      return "Ditolak";
    default:
      return "Menunggu Kelulusan";
  }
}
