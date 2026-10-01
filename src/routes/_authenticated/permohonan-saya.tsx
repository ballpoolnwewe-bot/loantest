import { useCallback, useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Wallet, LogOut, Info } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useSesi, useAdakahAdmin } from "@/hooks/use-sesi";
import {
  bakiTagihan,
  hariBerjalan,
  jumlahFaedah,
  jumlahTagihan,
  labelStatusPinjaman,
  pilihanJumlah,
  ringgit,
} from "@/lib/pinjaman";

export const Route = createFileRoute("/_authenticated/permohonan-saya")({
  head: () => ({
    meta: [
      { title: "Permohonan Saya — FinRinggit" },
      { name: "description", content: "Semak status permohonan pinjaman dan had kredit anda." },
      { property: "og:title", content: "Permohonan Saya — FinRinggit" },
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

type Pinjaman = {
  id: string;
  permohonan_id: string;
  jumlah_pokok: number;
  kadar_faedah_harian: number;
  jumlah_dibayar: number;
  status: string;
  tarikh_lulus: string | null;
  tarikh_selesai: string | null;
  catatan_admin: string | null;
  created_at: string;
};

export function LencanaStatus({ status }: { status: string }) {
  const gaya =
    status === "lulus"
      ? "bg-primary/10 text-primary"
      : status === "ditolak"
        ? "bg-destructive/10 text-destructive"
        : "bg-secondary text-secondary-foreground";
  const teks = status === "lulus" ? "Diluluskan" : status === "ditolak" ? "Ditolak" : "Menunggu";
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${gaya}`}>{teks}</span>;
}

function PermohonanSaya() {
  const { user } = useSesi();
  const adminKah = useAdakahAdmin(user?.id);
  const navigate = useNavigate();
  const [senarai, setSenarai] = useState<Permohonan[]>([]);
  const [pinjaman, setPinjaman] = useState<Pinjaman[]>([]);
  const [memuatkan, setMemuatkan] = useState(true);

  const muatSemula = useCallback(async () => {
    const [permohonanRes, pinjamanRes] = await Promise.all([
      supabase
        .from("permohonan")
        .select(
          "id, jumlah_dipohon, tempoh_bulan, status, had_kredit, catatan_admin, created_at, pekerjaan",
        )
        .order("created_at", { ascending: false }),
      supabase.from("pinjaman").select("*").order("created_at", { ascending: false }),
    ]);
    setSenarai((permohonanRes.data as Permohonan[]) ?? []);
    setPinjaman((pinjamanRes.data as Pinjaman[]) ?? []);
    setMemuatkan(false);
  }, []);

  useEffect(() => {
    if (!user) return;
    void muatSemula();
  }, [user, muatSemula]);

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
            <span className="text-lg font-bold tracking-tight">FinRinggit</span>
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
              <KadPermohonan
                key={p.id}
                p={p}
                pinjaman={pinjaman.filter((x) => x.permohonan_id === p.id)}
                userId={user?.id}
                onKemaskini={muatSemula}
              />
            ))}
          </div>
        )}
      </main>
      <Toaster />
    </div>
  );
}

function KadPermohonan({
  p,
  pinjaman,
  userId,
  onKemaskini,
}: {
  p: Permohonan;
  pinjaman: Pinjaman[];
  userId: string | undefined;
  onKemaskini: () => void;
}) {
  const [sibuk, setSibuk] = useState<number | null>(null);
  const had = p.had_kredit ?? 0;
  const pilihan = pilihanJumlah(had);
  const adaBerjalan = pinjaman.some((x) => x.status === "menunggu" || x.status === "aktif");

  const mohonPinjaman = async (jumlah: number) => {
    if (!userId) return;
    setSibuk(jumlah);
    const { error } = await supabase.from("pinjaman").insert({
      user_id: userId,
      permohonan_id: p.id,
      jumlah_pokok: jumlah,
    });
    setSibuk(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Permintaan pinjaman dihantar. Menunggu kelulusan pentadbir.");
    onKemaskini();
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
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

      {p.status === "lulus" && had > 0 && (
        <div className="mt-4 rounded-xl border border-border bg-muted p-4">
          <p className="text-sm">
            Had kredit anda:{" "}
            <span className="text-base font-bold text-foreground">{ringgit(had)}</span>
          </p>
          <p className="mt-1 flex items-start gap-1.5 text-xs text-muted-foreground">
            <Info className="mt-0.5 size-3.5 shrink-0" />
            Kadar faedah harian 0.005% daripada jumlah pokok, dikira setiap hari bermula dari
            tarikh kelulusan pinjaman.
          </p>

          {adaBerjalan ? (
            <p className="mt-3 text-xs text-muted-foreground">
              Anda mempunyai pinjaman yang belum selesai. Selesaikan dahulu sebelum memohon lagi.
            </p>
          ) : (
            <>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Pilih jumlah pinjaman
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {pilihan.map((jumlah) => (
                  <Button
                    key={jumlah}
                    className="rounded-full"
                    disabled={sibuk !== null}
                    onClick={() => mohonPinjaman(jumlah)}
                  >
                    {ringgit(jumlah)}
                  </Button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {pinjaman.length > 0 && (
        <div className="mt-4 space-y-3">
          {pinjaman.map((pj) => (
            <KadPinjaman key={pj.id} pj={pj} />
          ))}
        </div>
      )}

      {p.catatan_admin && (
        <p className="mt-3 text-sm text-muted-foreground">Catatan: {p.catatan_admin}</p>
      )}
    </div>
  );
}

function KadPinjaman({ pj }: { pj: Pinjaman }) {
  const total = jumlahTagihan(pj);
  const baki = bakiTagihan(pj);

  return (
    <div className="rounded-xl border border-border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold">Pinjaman {ringgit(pj.jumlah_pokok)}</p>
        <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
          {labelStatusPinjaman(pj.status)}
        </span>
      </div>

      {pj.status === "menunggu" && (
        <p className="mt-2 text-xs text-muted-foreground">
          Permintaan anda sedang disemak oleh pentadbir.
        </p>
      )}

      {(pj.status === "aktif" || pj.status === "selesai") && (
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <Baris label="Pokok" nilai={ringgit(pj.jumlah_pokok)} />
          <Baris label={`Faedah (${hariBerjalan(pj)} hari)`} nilai={ringgit(jumlahFaedah(pj))} />
          <Baris label="Jumlah tagihan" nilai={ringgit(total)} />
          <Baris label="Sudah dibayar" nilai={ringgit(pj.jumlah_dibayar)} />
          <div className="sm:col-span-2 rounded-lg bg-primary/10 px-3 py-2">
            <dt className="text-xs text-muted-foreground">Baki perlu dibayar</dt>
            <dd className="text-lg font-bold text-primary">{ringgit(baki)}</dd>
          </div>
        </dl>
      )}

      {pj.catatan_admin && (
        <p className="mt-2 text-xs text-muted-foreground">Catatan: {pj.catatan_admin}</p>
      )}
    </div>
  );
}

function Baris({ label, nilai }: { label: string; nilai: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground">{nilai}</dd>
    </div>
  );
}
