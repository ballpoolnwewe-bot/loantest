import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const reasons = [
  { title: "Cepat & Efisien", desc: "Pengajuan singkat dan persetujuan segera." },
  { title: "Transparan", desc: "Syarat jelas tanpa biaya tersembunyi." },
  { title: "Aman & Patuh Aturan", desc: "Data Anda terlindungi sepenuhnya." },
  { title: "Skoring Kredit Cerdas", desc: "Keputusan adil berbasis data." },
  { title: "Fokus pada Nasabah", desc: "Dukungan sesuai kebutuhan Anda." },
];

export function WhyUs() {
  return (
    <section id="kenapa" className="mx-auto max-w-3xl px-4 py-16">
      <div className="overflow-hidden rounded-3xl border border-border shadow-[var(--shadow-card)]">
        <div className="bg-card px-6 py-8">
          <h2 className="text-2xl font-bold md:text-3xl">Kenapa Pilih Kami?</h2>
          <p className="mt-2 text-sm font-semibold text-muted-foreground">
            Tanda penyedia pinjaman yang bisa dipercaya
          </p>
        </div>
        <div className="h-2 bg-[image:var(--gradient-band)]" />

        <div className="space-y-4 bg-card px-6 py-8">
          {reasons.map((r) => (
            <div key={r.title} className="rounded-2xl border border-border p-4">
              <div className="flex items-center gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-accent text-primary">
                  <Check className="size-4" />
                </span>
                <h3 className="text-base font-bold">{r.title}</h3>
              </div>
              <p className="mt-2 pl-9 text-sm text-muted-foreground">{r.desc}</p>
            </div>
          ))}

          <Button asChild size="lg" className="w-full rounded-xl text-base font-semibold">
            <a href="#ajukan">Ajukan Sekarang</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
