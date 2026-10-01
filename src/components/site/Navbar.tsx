import { useState } from "react";
import { Menu, X, Wallet } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useSesi, useAdakahAdmin } from "@/hooks/use-sesi";

const links = [
  { label: "Laman Utama", href: "#beranda" },
  { label: "Cara Ia Berfungsi", href: "#proses" },
  { label: "Mengapa Kami", href: "#kenapa" },
  { label: "FAQ", href: "#faq" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, memuatkan } = useSesi();
  const adminKah = useAdakahAdmin(user?.id);
  const navigate = useNavigate();

  const logKeluar = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <a href="#beranda" className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Wallet className="size-5" />
          </span>
          <span className="text-lg font-bold tracking-tight">Finringgit</span>
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
          {memuatkan ? null : user ? (
            <>
              <Button asChild size="sm" variant="ghost" className="hidden rounded-full sm:flex">
                {adminKah ? (
                  <Link to="/panel">Panel Admin</Link>
                ) : (
                  <Link to="/permohonan-saya">Permohonan Saya</Link>
                )}
              </Button>
              <Button size="sm" variant="outline" className="rounded-full px-5" onClick={logKeluar}>
                Log Keluar
              </Button>
            </>
          ) : (
            <Button asChild size="sm" className="rounded-full px-5">
              <Link to="/auth" search={{ redirect: "/mohon" }}>
                Log Masuk
              </Link>
            </Button>
          )}
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
          {user && (
            <Link
              to={adminKah ? "/panel" : "/permohonan-saya"}
              onClick={() => setOpen(false)}
              className="block rounded-md px-2 py-3 text-sm font-medium text-foreground hover:bg-accent"
            >
              {adminKah ? "Panel Admin" : "Permohonan Saya"}
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
