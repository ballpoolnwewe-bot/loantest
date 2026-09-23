import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

const MIN = 500_000;
const MAX = 25_000_000;
const TENOR = 12;
const RATE = 0.015; // bunga per bulan (contoh)

const rupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

export function LoanCalculator() {
  const [amount, setAmount] = useState(3_000_000);
  const [phone, setPhone] = useState("");

  const monthly = Math.round(amount / TENOR + amount * RATE);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.replace(/\D/g, "").length < 9) {
      toast.error("Masukkan nomor telepon yang valid");
      return;
    }
    toast.success("Pengajuan diterima! Tim kami akan menghubungi Anda.");
    setPhone("");
  };

  return (
    <section id="ajukan" className="mx-auto max-w-2xl px-4 py-14">
      <div className="overflow-hidden rounded-3xl border border-border shadow-[var(--shadow-card)]">
        <div className="bg-[image:var(--gradient-hero)] px-6 py-8 text-center">
          <h2 className="text-2xl font-bold text-primary-foreground md:text-3xl">
            Dapatkan Dana Sekarang
          </h2>
        </div>

        <form onSubmit={submit} className="space-y-6 bg-card px-6 py-8">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Jumlah Pinjaman</p>
            <p className="mt-1 text-4xl font-extrabold text-primary">{rupiah(amount)}</p>
          </div>

          <div>
            <Slider
              value={[amount]}
              min={MIN}
              max={MAX}
              step={500_000}
              onValueChange={(v) => setAmount(v[0] ?? MIN)}
            />
            <div className="mt-2 flex justify-between text-xs font-semibold text-muted-foreground">
              <span>{rupiah(MIN)}</span>
              <span>{rupiah(MAX)}</span>
            </div>
          </div>

          <div className="rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground">
            Estimasi angsuran{" "}
            <span className="font-semibold text-foreground">{rupiah(monthly)}</span> / bulan
            selama {TENOR} bulan (simulasi).
          </div>

          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium">
              Nomor Telepon
            </label>
            <Input
              id="phone"
              type="tel"
              inputMode="tel"
              placeholder="+62 812 3456 7890"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <Button type="submit" size="lg" className="w-full rounded-xl text-base font-semibold">
            Ajukan Sekarang
          </Button>
        </form>
      </div>
    </section>
  );
}
