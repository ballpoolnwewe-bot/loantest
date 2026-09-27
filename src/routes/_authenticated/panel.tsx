import { useCallback, useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Wallet } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useSesi, useAdakahAdmin } from "@/hooks/use-sesi";
import { LencanaStatus } from "./permohonan-saya";

export const Route = createFileRoute("/_authenticated/panel")({
  head: () => ({
    meta: [
      { title: "Panel Kelulusan — Danaro" },
      { name: "description", content: "Panel pentadbir untuk meluluskan permohonan pinjaman." },
      { property: "og:title", content: "Panel Kelulusan — Danaro" },
      {
        property: "og:description",
        content: "Panel pentadbir untuk meluluskan permohonan pinjaman.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Panel,
});

type Permohonan = {
  id: string;
  nama_penuh: string;
  no_kad_pengenalan: string;
  no_telefon: string;
  emel: string;
  alamat: string;
  pekerjaan: string;
  industri: string;
  pengalaman_tahun: number;
  gaji_bulanan: number;
  jumlah_dipohon: number;
  tempoh_bulan: number;
  foto_kp_path: string;
  foto_selfie_path: string;
  status: string;
  had_kredit: number | null;
  catatan_admin: string | null;
  created_at: string;
};

const ringgit = (n: number) =>
  new Intl.NumberFormat("ms-MY", {
    style: "currency",
    currency: "MYR",
    maximumFractionDigits: 0,
  }).format(n);

function Panel() {
  const { user } = useSesi();
  const adminKah = useAdakahAdmin(user?.id);
  const [senarai, setSenarai] = useState<Permohonan[]>([]);
  const [memuatkan, setMemuatkan] = useState(true);

  const muatSemula = useCallback(async () => {
    const { data } = await supabase
      .from("permohonan")
      .select("*")
      .order("created_at", { ascending: false });
    setSenarai((data as Permohonan[]) ?? []);
    setMemuatkan(false);
  }, []);

  useEffect(() => {
    if (adminKah) void muatSemula();
    if (adminKah === false) setMemuatkan(false);
  }, [adminKah, muatSemula]);

  if (adminKah === null) {
    return <p className="p-8 text-sm text-muted-foreground">Memuatkan...</p>;
  }

  if (!adminKah) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted px-4">
        <div className="max-w-sm rounded-2xl border border-border bg-card p-8 text-center">
          <h1 className="text-lg font-bold">Akses Ditolak</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Halaman ini hanya untuk pentadbir yang dibenarkan.
          </p>
          <Button asChild className="mt-6 rounded-full">
            <Link to="/">Kembali ke Laman Utama</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted pb-16">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Wallet className="size-5" />
            </span>
            <span className="text-lg font-bold tracking-tight">Danaro Panel</span>
          </Link>
          <Link to="/permohonan-saya" className="text-sm font-medium text-primary hover:underline">
            Permohonan Saya
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-2xl font-bold">Panel Kelulusan Permohonan</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Semak maklumat pemohon, luluskan atau tolak, dan tetapkan had kredit.
        </p>

        {memuatkan ? (
          <p className="mt-8 text-sm text-muted-foreground">Memuatkan permohonan...</p>
        ) : senarai.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
            Tiada permohonan setakat ini.
          </div>
        ) : (
          <div className="mt-6 space-y-5">
            {senarai.map((p) => (
              <KadPermohonan key={p.id} p={p} onKemaskini={muatSemula} />
            ))}
          </div>
        )}
      </main>
      <Toaster />
    </div>
  );
}

function KadPermohonan({ p, onKemaskini }: { p: Permohonan; onKemaskini: () => void }) {
  const [had, setHad] = useState(p.had_kredit != null ? String(p.had_kredit) : "");
  const [catatan, setCatatan] = useState(p.catatan_admin ?? "");
  const [sibuk, setSibuk] = useState(false);
  const [foto, setFoto] = useState<{ kp?: string; selfie?: string }>({});

  useEffect(() => {
    let batal = false;
    const ambil = async () => {
      const [kp, selfie] = await Promise.all([
        supabase.storage.from("dokumen-permohonan").createSignedUrl(p.foto_kp_path, 3600),
        supabase.storage.from("dokumen-permohonan").createSignedUrl(p.foto_selfie_path, 3600),
      ]);
      if (!batal) {
        setFoto({
          ...(kp.data?.signedUrl ? { kp: kp.data.signedUrl } : {}),
          ...(selfie.data?.signedUrl ? { selfie: selfie.data.signedUrl } : {}),
        });
      }
    };
    void ambil();
    return () => {
      batal = true;
    };
  }, [p.foto_kp_path, p.foto_selfie_path]);

  const putuskan = async (status: "lulus" | "ditolak") => {
    if (status === "lulus" && (!had || Number(had) <= 0)) {
      toast.error("Sila masukkan had kredit sebelum meluluskan.");
      return;
    }
    setSibuk(true);
    const { error } = await supabase
      .from("permohonan")
      .update({
        status,
        had_kredit: status === "lulus" ? Number(had) : null,
        catatan_admin: catatan || null,
      })
      .eq("id", p.id);
    setSibuk(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(status === "lulus" ? "Permohonan diluluskan." : "Permohonan ditolak.");
    onKemaskini();
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">{p.nama_penuh}</h2>
          <p className="text-xs text-muted-foreground">
            {p.no_kad_pengenalan} · {p.no_telefon} · {p.emel}
          </p>
        </div>
        <LencanaStatus status={p.status} />
      </div>

      <dl className="mt-5 grid gap-3 text-sm md:grid-cols-3">
        <Butiran label="Pekerjaan" nilai={p.pekerjaan} />
        <Butiran label="Industri" nilai={p.industri} />
        <Butiran label="Pengalaman" nilai={`${p.pengalaman_tahun} tahun`} />
        <Butiran label="Gaji Bulanan" nilai={ringgit(p.gaji_bulanan)} />
        <Butiran label="Jumlah Dipohon" nilai={ringgit(p.jumlah_dipohon)} />
        <Butiran label="Tempoh" nilai={`${p.tempoh_bulan} bulan`} />
        <Butiran label="Alamat" nilai={p.alamat} />
      </dl>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {[
          { url: foto.kp, label: "Kad Pengenalan" },
          { url: foto.selfie, label: "Selfie" },
        ].map((f) => (
          <figure key={f.label}>
            {f.url ? (
              <img
                src={f.url}
                alt={`Foto ${f.label} pemohon`}
                className="h-40 w-full rounded-xl object-cover"
              />
            ) : (
              <div className="h-40 w-full rounded-xl bg-muted" />
            )}
            <figcaption className="mt-1 text-xs text-muted-foreground">{f.label}</figcaption>
          </figure>
        ))}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`had-${p.id}`}>Had Kredit (RM)</Label>
          <Input
            id={`had-${p.id}`}
            type="number"
            min="0"
            value={had}
            onChange={(e) => setHad(e.target.value)}
            placeholder="5000"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`catatan-${p.id}`}>Catatan Pentadbir</Label>
          <Textarea
            id={`catatan-${p.id}`}
            rows={2}
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            placeholder="Contoh: dokumen lengkap"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <Button disabled={sibuk} onClick={() => putuskan("lulus")} className="rounded-full">
          Luluskan & Tetapkan Had
        </Button>
        <Button
          disabled={sibuk}
          variant="outline"
          onClick={() => putuskan("ditolak")}
          className="rounded-full"
        >
          Tolak
        </Button>
      </div>
    </div>
  );
}

function Butiran({ label, nilai }: { label: string; nilai: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground">{nilai}</dd>
    </div>
  );
}
