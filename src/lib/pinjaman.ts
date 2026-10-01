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

/** Pilihan tempoh pinjaman (bulan). Mesti sepadan dengan semakan dalam sah_pinjaman(). */
export const TENOR_PILIHAN = [1, 3, 6, 12] as const;

export const TUJUAN_PINJAMAN = [
  "Perbelanjaan perubatan",
  "Pendidikan",
  "Pembaikan rumah atau kenderaan",
  "Modal perniagaan",
  "Pembayaran bil atau hutang",
  "Perbelanjaan keluarga",
  "Lain-lain",
] as const;

export const SENARAI_BANK = [
  "Maybank",
  "CIMB Bank",
  "Public Bank",
  "RHB Bank",
  "Hong Leong Bank",
  "AmBank",
  "Bank Islam",
  "Bank Rakyat",
  "BSN",
  "Affin Bank",
  "Alliance Bank",
  "OCBC Bank",
  "UOB",
  "HSBC",
  "Standard Chartered",
  "Agrobank",
  "MBSB Bank",
] as const;

/** Anggaran faedah sepanjang tempoh (30 hari sebulan) pada kadar harian tetap. */
export function anggarFaedah(jumlah: number, tempohBulan: number): number {
  return Math.round(jumlah * KADAR_FAEDAH_HARIAN * tempohBulan * 30 * 100) / 100;
}

const normalkanNama = (n: string) =>
  n
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/** Bandingkan nama pemegang akaun dengan nama pada kad pengenalan (abaikan huruf besar/kecil dan tanda baca). */
export function namaSama(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a || !b) return false;
  return normalkanNama(a) === normalkanNama(b);
}

/** Sorokkan nombor akaun, tunjuk 4 digit terakhir sahaja. */
export function sorokNoAkaun(no: string | null | undefined): string {
  if (!no) return "-";
  return `•••• ${no.slice(-4)}`;
}
