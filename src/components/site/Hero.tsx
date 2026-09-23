import heroImage from "@/assets/hero-finance.jpg";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section id="beranda" className="relative isolate overflow-hidden">
      <img
        src={heroImage}
        alt="Latar teknologi keuangan digital"
        width={1536}
        height={1024}
        className="absolute inset-0 -z-10 size-full object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-[image:var(--gradient-hero)] opacity-85" />

      <div className="mx-auto max-w-3xl px-4 py-20 text-center md:py-28">
        <h1 className="text-3xl font-extrabold leading-tight text-primary-foreground md:text-5xl">
          Pinjaman Cerdas. Pencairan Lebih Cepat.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-sm text-primary-foreground/80 md:text-base">
          Penilaian risiko otomatis dan proses persetujuan yang efisien membuat pengajuan
          pinjaman jadi jauh lebih mudah.
        </p>
        <Button
          size="lg"
          variant="secondary"
          className="mt-8 rounded-full px-8 text-base font-semibold"
          asChild
        >
          <a href="#ajukan">Ajukan Sekarang</a>
        </Button>
      </div>
    </section>
  );
}
