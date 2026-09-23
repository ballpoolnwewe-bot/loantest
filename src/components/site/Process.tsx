import { Globe, ScanLine, BadgeCheck, Banknote, Landmark } from "lucide-react";

const steps = [
  { icon: Globe, title: "Mohon Dalam Talian", desc: "Dokumen minimum" },
  { icon: ScanLine, title: "Penilaian Bijak", desc: "Pemarkahan kredit automatik" },
  { icon: BadgeCheck, title: "Kelulusan Pantas", desc: "Keputusan pantas dan telus" },
  { icon: Banknote, title: "Pembayaran Dana", desc: "Dana diterima dalam beberapa jam" },
  { icon: Landmark, title: "Ansuran Fleksibel", desc: "Tempoh bayaran boleh disesuaikan" },
];

export function Process() {
  return (
    <section id="proses" className="bg-[image:var(--gradient-hero)] py-16">
      <div className="mx-auto max-w-5xl px-4">
        <h2 className="text-center text-2xl font-bold text-primary-foreground md:text-4xl">
          Proses Pinjaman Kami
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="overflow-hidden rounded-2xl bg-card shadow-[var(--shadow-card)]"
            >
              <div className="flex flex-col items-center gap-3 px-6 py-8 text-center">
                <span className="flex size-12 items-center justify-center rounded-full bg-accent text-primary">
                  <Icon className="size-6" />
                </span>
                <h3 className="text-lg font-bold">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
              <div className="h-2 bg-[image:var(--gradient-band)]" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
