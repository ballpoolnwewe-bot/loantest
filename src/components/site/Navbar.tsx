import { useState } from "react";
import { Menu, X, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

const links = [
  { label: "Laman Utama", href: "#beranda" },
  { label: "Cara Ia Berfungsi", href: "#proses" },
  { label: "Mengapa Kami", href: "#kenapa" },
  { label: "FAQ", href: "#faq" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <a href="#beranda" className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Wallet className="size-5" />
          </span>
          <span className="text-lg font-bold tracking-tight">Danaro</span>
        </a>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button size="sm" className="rounded-full px-5">
             Log Masuk
          </Button>
          <button
            aria-label="Buka menu navigasi"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex size-9 items-center justify-center rounded-md text-foreground md:hidden"
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-border bg-background px-4 py-3 md:hidden">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block rounded-md px-2 py-3 text-sm font-medium text-foreground hover:bg-accent"
            >
              {l.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
