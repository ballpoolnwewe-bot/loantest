import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Bagaimanakah cara memohon pinjaman?",
    a: "Isi jumlah pinjaman dan nombor telefon dalam borang, kemudian pasukan kami akan menghubungi anda untuk pengesahan.",
  },
  {
    q: "Apakah syarat permohonan?",
    a: "MyKad, berumur sekurang-kurangnya 21 tahun, serta bukti pendapatan atau akaun bank yang aktif.",
  },
  {
    q: "Berapa lamakah proses pembayaran dana?",
    a: "Selepas dokumen lengkap dan diluluskan, dana biasanya dibayar dalam tempoh satu hari bekerja.",
  },
  {
    q: "Berapakah jumlah yang boleh saya pinjam?",
    a: "Daripada RM500 hingga RM25,000, bergantung pada hasil penilaian kredit.",
  },
  {
    q: "Bagaimanakah cara membayar ansuran?",
    a: "Melalui pindahan bank atau dompet digital mengikut jadual ansuran dalam perjanjian.",
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
