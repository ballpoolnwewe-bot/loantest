import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { BadgeCheck, Clock, FileText, Lock, MessageCircle, ShieldCheck, Star, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TrustBar() {
  const items = [
    { icon: Users, label: "50,000+ pelanggan" },
    { icon: Clock, label: "Keputusan dalam 5 minit" },
    { icon: Lock, label: "Data disulitkan SSL" },
    { icon: BadgeCheck, label: "Tiada caj tersembunyi" },
  ];
  return (
    <section className="border-b border-border bg-card">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 py-5 md:grid-cols-4">
        {items.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-2 text-sm font-medium">
            <Icon className="size-5 shrink-0 text-primary" /> {label}
          </div>
        ))}
      </div>
    </section>
  );
}

export function EligibilityCheck() {
  const [umur, setUmur] = useState("");
  const [gaji, setGaji] = useState("");
  const [warga, setWarga] = useState<boolean | null>(null);
  const [hasil, setHasil] = useState<null | { ok: boolean; had: number; msg: string }>(null);

  const semak = () => {
    const u = Number(umur), g = Number(gaji);
    if (!u || !g || warga === null) {
      setHasil({ ok: false, had: 0, msg: "Sila lengkapkan semua soalan." });
      return;
    }
    if (u < 21 || u > 60) return setHasil({ ok: false, had: 0, msg: "Umur mesti antara 21 hingga 60 tahun." });
    if (!warga) return setHasil({ ok: false, had: 0, msg: "Hanya warganegara Malaysia layak memohon." });
    if (g < 1500) return setHasil({ ok: false, had: 0, msg: "Pendapatan minimum ialah RM1,500 sebulan." });
    const had = Math.min(25000, Math.round((g * 4) / 500) * 500);
    setHasil({ ok: true, had, msg: "Tahniah! Anda berkemungkinan layak." });
  };

  return (
    <section id="kelayakan" className="mx-auto max-w-2xl px-4 py-14">
      <div className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-card)] md:p-8">
        <h2 className="text-2xl font-bold">Semak Kelayakan dalam 30 Saat</h2>
        <p className="mt-1 text-sm text-muted-foreground">Tidak menjejaskan skor kredit anda.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium">
            Umur
            <input type="number" inputMode="numeric" value={umur} onChange={(e) => setUmur(e.target.value)} placeholder="cth. 30" className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2.5" />
          </label>
          <label className="text-sm font-medium">
            Gaji bulanan (RM)
            <input type="number" inputMode="numeric" value={gaji} onChange={(e) => setGaji(e.target.value)} placeholder="cth. 3500" className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2.5" />
          </label>
        </div>
        <p className="mt-4 text-sm font-medium">Warganegara Malaysia?</p>
        <div className="mt-2 flex gap-2">
          {[true, false].map((v) => (
            <button key={String(v)} type="button" onClick={() => setWarga(v)} className={`flex-1 rounded-xl border py-2.5 text-sm font-semibold ${warga === v ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>
              {v ? "Ya" : "Tidak"}
            </button>
          ))}
        </div>
        <Button className="mt-6 w-full rounded-xl" size="lg" onClick={semak}>Semak Sekarang</Button>
        {hasil && (
          <div className={`mt-5 rounded-2xl p-4 text-sm ${hasil.ok ? "bg-primary/10" : "bg-destructive/10 text-destructive"}`}>
            <p className="font-semibold">{hasil.msg}</p>
            {hasil.ok && (
              <>
                <p className="mt-1">Anggaran had pinjaman: <b>RM{hasil.had.toLocaleString("ms-MY")}</b></p>
                <Button asChild size="sm" className="mt-3 rounded-full"><Link to="/mohon">Teruskan Permohonan</Link></Button>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export function Documents() {
  const docs = ["Salinan MyKad (depan & belakang)", "Slip gaji 3 bulan terkini", "Penyata bank 3 bulan terkini", "Nombor telefon & e-mel aktif"];
  return (
    <section className="mx-auto max-w-3xl px-4 py-14">
      <h2 className="text-center text-2xl font-bold md:text-3xl">Dokumen Yang Diperlukan</h2>
      <p className="mt-2 text-center text-sm text-muted-foreground">Sediakan dokumen ini supaya permohonan lebih cepat.</p>
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {docs.map((d) => (
          <div key={d} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
            <FileText className="size-5 shrink-0 text-primary" /> <span className="text-sm font-medium">{d}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Testimonials() {
  const t = [
    { n: "Aisyah, Shah Alam", q: "Proses sangat mudah, duit masuk hari yang sama. Ansuran pun jelas dari awal." },
    { n: "Ravi, Pulau Pinang", q: "Kalkulator membantu saya pilih tempoh yang sesuai dengan gaji. Tiada kejutan." },
    { n: "Mei Ling, Johor Bahru", q: "Khidmat pelanggan responsif melalui WhatsApp. Sangat disyorkan!" },
  ];
  return (
    <section className="bg-muted/50 py-16">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center text-2xl font-bold md:text-3xl">Apa Kata Pelanggan Kami</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {t.map((x) => (
            <figure key={x.n} className="rounded-2xl border border-border bg-card p-6">
              <div className="flex gap-0.5 text-primary">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="size-4 fill-current" />)}</div>
              <blockquote className="mt-3 text-sm">"{x.q}"</blockquote>
              <figcaption className="mt-4 text-xs font-semibold text-muted-foreground">{x.n}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SecurityNote() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex gap-4 rounded-2xl border border-border bg-card p-5">
        <ShieldCheck className="size-8 shrink-0 text-primary" />
        <div className="text-sm">
          <p className="font-semibold">Waspada penipuan</p>
          <p className="mt-1 text-muted-foreground">FinRinggit tidak akan sekali-kali meminta bayaran pendahuluan sebelum pinjaman dikeluarkan. Laporkan sebarang mesej mencurigakan kepada kami.</p>
        </div>
      </div>
    </section>
  );
}

export function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/60327409849?text=Hai%20FinRinggit%2C%20saya%20ingin%20bertanya%20tentang%20pinjaman"
      target="_blank"
      rel="noreferrer"
      aria-label="Hubungi kami di WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-transform hover:scale-105"
    >
      <MessageCircle className="size-5" /> <span className="hidden sm:inline">Bantuan</span>
    </a>
  );
}
