import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Wallet, LogOut } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useSesi, useAdakahAdmin } from "@/hooks/use-sesi";

export const Route = createFileRoute("/_authenticated/permohonan-saya")({
  head: () => ({
    meta: [
      { title: "Permohonan Saya — Danaro" },
      { name: "description", content: "Semak status permohonan pinjaman dan had kredit anda." },
      { property: "og:title", content: "Permohonan Saya — Danaro" },
      {
        property: "og:description",
        content: "Semak status permohonan pinjaman dan had kredit anda.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PermohonanSaya,
});

type Permohonan = {
  id: string;
  jumlah_dipohon: number;
  tempoh_bulan: number;
  status: string;
  had_kredit: number | null;
  catatan_admin: string | null;
  created_at: string;
  pekerjaan: string;
};

const ringgit = (n: number) =>
  new Intl.NumberFormat("ms-MY", {
    style: "currency",
    currency: "MYR",
    maximumFractionDigits: 0,
  }).format(n);

export function LencanaStatus({ status }: { status: string }) {
  const gaya =
    status === "lulus"
      ? "bg-primary/10 text-primary"
      : status === "ditolak"
        ? "bg-destructive/10 text-destructive"
        : "bg-secondary text-secondary-foreground";
  const teks = status === "lulus" ? "Diluluskan" : status === "ditolak" ? "Ditolak" : "Menunggu";
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${gaya}`}>{teks}</span>
  );
}

function PermohonanSaya() {
  const { user } = useSesi();
  const adminKah = useAdakahAdmin(user?.id);
  const navigate = useNavigate();
  const [senarai, setSenarai] = useState<Permohonan[]>([]);
  const [memuatkan, setMemuatkan] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("permohonan")
      .select("id, jumlah_dipohon, tempoh_bulan, status, had_kredit, catatan_admin, created_at, pekerjaan")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setSenarai((data as Permohonan[]) ?? []);
        setMemuatkan(false);
      });
  }, [user]);

  const logKeluar = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  };

  return (
    <div className="min-h-screen bg-muted pb-16">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Wallet className="size-5" />
            </span>
            <span className="text-lg font-bold tracking-tight">Danaro</span>
          </Link>
          <div className="flex items-center gap-3">
            {adminKah && (
              <Link to="/panel" className="text-sm font-medium text-primary hover:underline">
                Panel Admin
              </Link>
            )}
            <Button variant="ghost" size="sm" onClick={logKeluar}>
              <LogOut className="size-4" /> Log Keluar
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold">Permohonan Saya</h1>
          <Button asChild className="rounded-full">
            <Link to="/mohon">Mohon Baharu</Link>
          </Button>
        </div>

        {memuatkan ? (
          <p className="mt-8 text-sm text-muted-foreground">Memuatkan...</p>
        ) : senarai.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-border bg-card p-10 text-center">
            <p className="text-sm text-muted-foreground">
              Anda belum menghantar sebarang permohonan.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {senarai.map((p) => (
              <div
                key={p.id}
                className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-bold text-primary">{ringgit(p.jumlah_dipohon)}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.tempoh_bulan} bulan · {p.pekerjaan} ·{" "}
                      {new Date(p.created_at).toLocaleDateString("ms-MY")}
                    </p>
                  </div>
                  <LencanaStatus status={p.status} />
                </div>
                {p.had_kredit != null && (
                  <div className="mt-4 rounded-xl bg-muted px-4 py-3 text-sm">
                    Had kredit diluluskan:{" "}
                    <span className="font-bold text-foreground">{ringgit(p.had_kredit)}</span>
                  </div>
                )}
                {p.catatan_admin && (
                  <p className="mt-3 text-sm text-muted-foreground">Catatan: {p.catatan_admin}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
      <Toaster />
    </div>
  );
}
