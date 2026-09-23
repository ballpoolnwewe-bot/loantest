import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

const MIN = 50;
const MAX = 5000;
const TENOR = 1;
const RATE = 0.3; // kadar faedah bulanan (contoh)

const ringgit = (n: number) =>
  new Intl.NumberFormat("ms-MY", { style: "currency", currency: "MYR", maximumFractionDigits: 0 }).format(n);

export function LoanCalculator() {
  const [amount, setAmount] = useState(3_000);
  const [phone, setPhone] = useState("");

  const monthly = Math.round(amount / TENOR + amount * RATE);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.replace(/\D/g, "").length < 9) {
      toast.error("Masukkan nombor telefon yang sah");
      return;
    }
    toast.success("Permohonan diterima! Pasukan kami akan menghubungi anda.");
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
            <p className="mt-1 text-4xl font-extrabold text-primary">{ringgit(amount)}</p>
          </div>

          <div>
            <Slider
              value={[amount]}
              min={MIN}
              max={MAX}
              step={500}
              onValueChange={(v) => setAmount(v[0] ?? MIN)}
            />
            <div className="mt-2 flex justify-between text-xs font-semibold text-muted-foreground">
              <span>{ringgit(MIN)}</span>
              <span>{ringgit(MAX)}</span>
            </div>
          </div>

          <div className="rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground">
            Anggaran ansuran{" "}
            <span className="font-semibold text-foreground">{ringgit(monthly)}</span> / bulan
            selama {TENOR} bulan (simulasi).
          </div>

          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium">
              Nombor Telefon
            </label>
            <Input
              id="phone"
              type="tel"
              inputMode="tel"
              placeholder="+60 12 345 6789"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <Button type="submit" size="lg" className="w-full rounded-xl text-base font-semibold">
            Mohon Sekarang
          </Button>
        </form>
      </div>
    </section>
  );
}
