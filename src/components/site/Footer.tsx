import { Wallet, Instagram, Facebook, Send, Youtube } from "lucide-react";

const links = [
  "Beranda",
  "Cara Pembayaran",
  "Tentang Kami",
  "FAQ",
  "Kirim Keluhan",
  "Syarat dan Ketentuan",
];

export function Footer() {
  return (
    <footer className="bg-[image:var(--gradient-hero)] py-14 text-primary-foreground">
      <div className="mx-auto max-w-5xl px-4">
        <div className="flex items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-xl bg-background text-primary">
            <Wallet className="size-6" />
          </span>
          <span className="text-3xl font-bold">Danaro</span>
        </div>

        <p className="mt-6 text-lg">021-27409849</p>

        <ul className="mt-6 space-y-4">
          {links.map((l) => (
            <li key={l}>
              <a href="#beranda" className="text-primary-foreground/85 hover:text-primary-foreground">
                {l}
              </a>
            </li>
          ))}
        </ul>

        <p className="mt-8 font-medium">Ikuti Kami</p>
        <div className="mt-3 flex gap-5">
          <Instagram className="size-6" />
          <Facebook className="size-6" />
          <Send className="size-6" />
          <Youtube className="size-6" />
        </div>

        <hr className="my-8 border-primary-foreground/25" />
        <p className="text-sm text-primary-foreground/75">
          PT FINRINGGIT FINTEK NUSANTARA — Tel: 021-27409849
        </p>
        <p className="mt-2 text-xs text-primary-foreground/60">
          Contoh situs untuk tujuan pembelajaran. Bukan layanan keuangan sungguhan.
        </p>
      </div>
    </footer>
  );
}
