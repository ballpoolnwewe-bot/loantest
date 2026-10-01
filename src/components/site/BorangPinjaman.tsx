import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import {
  SENARAI_BANK,
  TENOR_PILIHAN,
  TUJUAN_PINJAMAN,
  anggarFaedah,
  namaSama,
  pilihanJumlah,
  ringgit,
} from "@/lib/pinjaman";

type Props = {
  permohonanId: string;
  userId: string;
  namaKp: string;
  hadKredit: number;
  onSelesai: () => void;
};

export function BorangPinjaman({ permohonanId, userId, namaKp, hadKredit, onSelesai }: Props) {
  const pilihanJumlahList = pilihanJumlah(hadKredit);
  const [buka, setBuka] = useState(false);
  const [jumlah, setJumlah] = useState<number | null>(null);
  const [tenor, setTenor] = useState<number | null>(null);
  const [tujuan, setTujuan] = useState("");
  const [tujuanLain, setTujuanLain] = useState("");
  const [bank, setBank] = useState("");
  const [namaAkaun, setNamaAkaun] = useState(namaKp.toUpperCase());
  const [noAkaun, setNoAkaun] = useState("");
  const [sah, setSah] = useState(false);
  const [sibuk, setSibuk] = useState(false);

  const namaTidakSepadan = namaAkaun.trim().length > 0 && !namaSama(namaAkaun, namaKp);
  const anggaran = jumlah && tenor ? anggarFaedah(jumlah, tenor) : null;

  const hantar = async (e: React.FormEvent) => {
    e.preventDefault();
    const tujuanAkhir = tujuan === "Lain-lain" ? tujuanLain.trim() : tujuan;
    const digit = noAkaun.replace(/\D/g, "");

    if (!jumlah) return void toast.error("Pilih jumlah pinjaman.");
    if (!tenor) return void toast.error("Pilih tempoh pinjaman.");
    if (!tujuanAkhir) return void toast.error("Nyatakan tujuan pinjaman.");
    if (!bank) return void toast.error("Pilih bank penerima.");
    if (namaAkaun.trim().length < 3) return void toast.error("Isi nama pemegang akaun.");
    if (digit.length < 8 || digit.length > 20)
      return void toast.error("Nombor akaun mesti 8 hingga 20 digit.");
    if (!sah) return void toast.error("Sahkan nama pemegang akaun sama dengan kad pengenalan.");

    setSibuk(true);
    const { error } = await supabase.from("pinjaman").insert({
      user_id: userId,
      permohonan_id: permohonanId,
      jumlah_pokok: jumlah,
      tempoh_bulan: tenor,
      tujuan: tujuanAkhir,
      nama_bank: bank,
      nama_pemegang_akaun: namaAkaun.trim().toUpperCase(),
      no_akaun: digit,
    });
    setSibuk(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Permohonan pinjaman dihantar. Menunggu kelulusan pentadbir.");
    setBuka(false);
    onSelesai();
  };

  return (
    <Dialog open={buka} onOpenChange={setBuka}>
      <DialogTrigger asChild>
        <Button size="lg" className="mt-4 w-full rounded-xl text-base sm:w-auto">
          Mohon Pinjaman
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Mohon Pinjaman</DialogTitle>
          <DialogDescription>
            Had kredit anda {ringgit(hadKredit)}. Pilih jumlah dan tempoh, kemudian isi akaun bank
            untuk menerima wang.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={hantar} className="space-y-5">
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Jumlah pinjaman</legend>
            <div className="grid grid-cols-3 gap-2">
              {pilihanJumlahList.map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-pressed={jumlah === n}
                  onClick={() => setJumlah(n)}
                  className={`rounded-xl border px-2 py-3 text-sm font-semibold transition-colors ${
                    jumlah === n
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card hover:bg-accent"
                  }`}
                >
                  {ringgit(n)}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Tempoh pinjaman</legend>
            <div className="grid grid-cols-4 gap-2">
              {TENOR_PILIHAN.map((t) => (
                <button
                  key={t}
                  type="button"
                  aria-pressed={tenor === t}
                  onClick={() => setTenor(t)}
                  className={`rounded-xl border px-2 py-3 text-sm font-semibold transition-colors ${
                    tenor === t
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card hover:bg-accent"
                  }`}
                >
                  {t} bulan
                </button>
              ))}
            </div>
            {anggaran !== null && jumlah && tenor && (
              <p className="text-xs text-muted-foreground">
                Anggaran faedah sepanjang {tenor} bulan: {ringgit(anggaran)} (jumlah anggaran{" "}
                {ringgit(jumlah + anggaran)}). Faedah sebenar dikira setiap hari pada kadar 0.005%
                daripada jumlah pokok.
              </p>
            )}
          </fieldset>

          <div className="space-y-2">
            <Label htmlFor="tujuan">Tujuan pinjaman</Label>
            <Select value={tujuan} onValueChange={setTujuan}>
              <SelectTrigger id="tujuan">
                <SelectValue placeholder="Pilih tujuan" />
              </SelectTrigger>
              <SelectContent>
                {TUJUAN_PINJAMAN.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {tujuan === "Lain-lain" && (
              <Input
                value={tujuanLain}
                onChange={(e) => setTujuanLain(e.target.value)}
                placeholder="Nyatakan tujuan anda"
                maxLength={100}
                aria-label="Nyatakan tujuan lain"
              />
            )}
          </div>

          <div className="space-y-4 rounded-xl border border-border bg-muted p-4">
            <p className="text-sm font-semibold">Akaun bank penerima</p>

            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900"
            >
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <p>
                <span className="font-semibold">Penting:</span> nama penerima mesti sama dengan nama
                pada kad pengenalan anda ({namaKp.toUpperCase()}). Wang tidak akan dikeluarkan ke
                akaun atas nama orang lain.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bank">Nama bank</Label>
              <Select value={bank} onValueChange={setBank}>
                <SelectTrigger id="bank" className="bg-background">
                  <SelectValue placeholder="Pilih bank" />
                </SelectTrigger>
                <SelectContent>
                  {SENARAI_BANK.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nama-akaun">Nama pemegang akaun</Label>
              <Input
                id="nama-akaun"
                value={namaAkaun}
                onChange={(e) => setNamaAkaun(e.target.value.toUpperCase())}
                autoComplete="off"
                className="bg-background"
              />
              {namaTidakSepadan && (
                <p className="text-xs font-medium text-destructive">
                  Nama ini tidak sama dengan nama pada kad pengenalan ({namaKp.toUpperCase()}).
                  Permohonan mungkin ditolak.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="no-akaun">Nombor akaun</Label>
              <Input
                id="no-akaun"
                value={noAkaun}
                onChange={(e) => setNoAkaun(e.target.value.replace(/\D/g, "").slice(0, 20))}
                inputMode="numeric"
                autoComplete="off"
                placeholder="Contoh: 1234567890"
                className="bg-background"
              />
            </div>

            <div className="flex items-start gap-2">
              <Checkbox
                id="sah-nama"
                checked={sah}
                onCheckedChange={(c) => setSah(c === true)}
                className="mt-0.5"
              />
              <Label htmlFor="sah-nama" className="text-xs font-normal leading-snug">
                Saya mengesahkan nama pemegang akaun sama dengan nama pada kad pengenalan saya.
              </Label>
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full rounded-xl text-base" disabled={sibuk}>
            {sibuk ? "Menghantar..." : "Hantar Permohonan Pinjaman"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
