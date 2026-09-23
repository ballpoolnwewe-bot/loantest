import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Bagaimana cara mengajukan pinjaman?",
    a: "Isi jumlah pinjaman dan nomor telepon di formulir, lalu tim kami akan menghubungi Anda untuk verifikasi.",
  },
  {
    q: "Apa saja syarat pengajuan?",
    a: "KTP, usia minimal 21 tahun, dan bukti penghasilan atau rekening aktif.",
  },
  {
    q: "Berapa lama proses pencairannya?",
    a: "Setelah dokumen lengkap dan disetujui, dana biasanya cair dalam 1x24 jam kerja.",
  },
  {
    q: "Berapa jumlah yang bisa saya pinjam?",
    a: "Mulai dari Rp500.000 hingga Rp25.000.000 tergantung hasil penilaian kredit.",
  },
  {
    q: "Bagaimana cara membayar cicilan?",
    a: "Melalui transfer bank atau dompet digital sesuai jadwal angsuran pada perjanjian.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="bg-brand-soft py-16">
      <div className="mx-auto max-w-3xl px-4">
        <div className="rounded-2xl bg-[image:var(--gradient-hero)] px-6 py-6">
          <h2 className="text-2xl font-bold text-primary-foreground md:text-4xl">Soalan Umum</h2>
        </div>

        <Accordion type="single" collapsible className="mt-6">
          {faqs.map((f) => (
            <AccordionItem key={f.q} value={f.q}>
              <AccordionTrigger className="text-left text-base font-semibold">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
