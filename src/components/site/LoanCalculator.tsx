import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

const MIN = 500;
const MAX = 25000;
const TENORS = [3, 6, 12, 24];
const RATE = 0.015; // kadar faedah bulanan (contoh simulasi)

const ringgit = (n: number) =>
  new Intl.NumberFormat("ms-MY", { style: "currency", currency: "MYR", maximumFractionDigits: 0 }).format(n);

const PANTAS = [1000, 3000, 5000, 10000];

export function LoanCalculator() {
  const [amount, setAmount] = useState(3_000);
  const [tenor, setTenor] = useState(6);
  const navigate = useNavigate();

  const faedah = Math.round(amount * RATE * tenor);
  const jumlah = amount + faedah;
  const bulanan = Math.round(jumlah / tenor);

  return (
    <section id="ajukan" className="mx-auto max-w-2xl px-4 py-14">
      <div className="overflow-hidden rounded-3xl border border-border shadow-[var(--shadow-card)]">
        <div className="bg-[image:var(--gradient-hero)] px-6 py-8 text-center">
          <h2 className="text-2xl font-bold text-primary-foreground md:text-3xl">Kira Pinjaman Anda</h2>
          <p className="mt-1 text-sm text-primary-foreground/80">Pilih jumlah dan tempoh — lihat ansuran serta-merta</p>
        </div>

        <div className="space-y-7 bg-card px-6 py-8">
          <div>
            <div className="flex items-baseline justify-between">
              <p className="text-sm font-medium">1. Jumlah pinjaman</p>
              <p className="text-3xl font-extrabold text-primary">{ringgit(amount)}</p>
            </div>
            <Slider className="mt-4" value={[amount]} min={MIN} max={MAX} step={500} onValueChange={(v) => setAmount(v[0] ?? MIN)} />
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>{ringgit(MIN)}</span>
              <span>{ringgit(MAX)}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {PANTAS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setAmount(p)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${amount === p ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary"}`}
                >
                  {ringgit(p)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium">2. Tempoh bayaran balik</p>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {TENORS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTenor(t)}
                  className={`rounded-xl border py-3 text-sm font-semibold transition-colors ${tenor === t ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary"}`}
                >
                  {t} bln
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 rounded-2xl bg-muted p-4 text-center">
            <div>
              <p className="text-xs text-muted-foreground">Ansuran / bulan</p>
              <p className="mt-1 text-lg font-bold text-primary">{ringgit(bulanan)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Jumlah faedah</p>
              <p className="mt-1 text-lg font-bold">{ringgit(faedah)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Jumlah bayaran</p>
              <p className="mt-1 text-lg font-bold">{ringgit(jumlah)}</p>
            </div>
          </div>
          <p className="-mt-4 text-center text-xs text-muted-foreground">
            Simulasi pada kadar {(RATE * 100).toFixed(1)}% sebulan. Kadar sebenar bergantung pada penilaian.
          </p>

          <Button size="lg" className="w-full rounded-xl text-base font-semibold" onClick={() => navigate({ to: "/mohon" })}>
            Mohon {ringgit(amount)} Sekarang
          </Button>
        </div>
      </div>
    </section>
  );
}
