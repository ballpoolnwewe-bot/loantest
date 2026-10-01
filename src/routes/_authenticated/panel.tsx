import { useCallback, useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Wallet, Info } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useSesi, useAdakahAdmin } from "@/hooks/use-sesi";
import { LencanaStatus } from "./permohonan-saya";
import {
  bakiTagihan,
  hariBerjalan,
  jumlahFaedah,
  jumlahTagihan,
  labelStatusPinjaman,
  pilihanJumlah,
  ringgit,
} from "@/lib/pinjaman";

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

function Panel() {
  const { user } = useSesi();
  const adminKah = useAdakahAdmin(user?.id);
  const [senarai, setSenarai] = useState<Permohonan[]>([]);
  const [pinjaman, setPinjaman] = useState<Pinjaman[]>([]);
  const [memuatkan, setMemuatkan] = useState(true);

  const muatSemula = useCallback(async () => {
    const [permohonanRes, pinjamanRes] = await Promise.all([
      supabase.from("permohonan").select("*").order("created_at", { ascending: false }),
      supabase.from("pinjaman").select("*").order("created_at", { ascending: false }),
    ]);
    setSenarai((permohonanRes.data as Permohonan[]) ?? []);
    setPinjaman((pinjamanRes.data as Pinjaman[]) ?? []);
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
          Semak maklumat pemohon, tetapkan had kredit, luluskan permintaan pinjaman dan rekod
          bayaran pelanggan.
        </p>
        <p className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
          <Info className="mt-0.5 size-3.5 shrink-0" />
          Semua pinjaman dikenakan faedah harian 0.005% daripada jumlah pokok.
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
              <KadPermohonan
                key={p.id}
                p={p}
                pinjaman={pinjaman.filter((x) => x.permohonan_id === p.id)}
                adminId={user?.id}
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
  adminId,
  onKemaskini,
}: {
  p: Permohonan;
  pinjaman: Pinjaman[];
  adminId: string | undefined;
  onKemaskini: () => void;
}) {
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

  const pilihan = pilihanJumlah(Number(had) || 0);

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
          {pilihan.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Pelanggan akan nampak pilihan: {pilihan.map((n) => ringgit(n)).join(" · ")}
            </p>
          )}
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

      {pinjaman.length > 0 && (
        <div className="mt-6 border-t border-border pt-5">
          <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
            Pinjaman Pelanggan
          </h3>
          <div className="mt-3 space-y-3">
            {pinjaman.map((pj) => (
              <BarisPinjaman key={pj.id} pj={pj} adminId={adminId} onKemaskini={onKemaskini} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BarisPinjaman({
  pj,
  adminId,
  onKemaskini,
}: {
  pj: Pinjaman;
  adminId: string | undefined;
  onKemaskini: () => void;
}) {
  const [bayar, setBayar] = useState("");
  const [nota, setNota] = useState("");
  const [sibuk, setSibuk] = useState(false);
  const total = jumlahTagihan(pj);
  const baki = bakiTagihan(pj);

  const putuskan = async (status: "aktif" | "ditolak") => {
    setSibuk(true);
    const { error } = await supabase
      .from("pinjaman")
      .update({
        status,
        tarikh_lulus: status === "aktif" ? new Date().toISOString() : null,
      })
      .eq("id", pj.id);
    setSibuk(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(status === "aktif" ? "Pinjaman diluluskan." : "Permintaan pinjaman ditolak.");
    onKemaskini();
  };

  const rekodBayaran = async () => {
    const jumlah = Number(bayar);
    if (!adminId) return;
    if (!jumlah || jumlah <= 0) {
      toast.error("Masukkan jumlah bayaran yang sah.");
      return;
    }
    setSibuk(true);
    const { error } = await supabase.from("pembayaran").insert({
      pinjaman_id: pj.id,
      jumlah,
      catatan: nota || null,
      direkod_oleh: adminId,
    });
    setSibuk(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setBayar("");
    setNota("");
    toast.success("Bayaran direkodkan. Baki tagihan dikemaskini.");
    onKemaskini();
  };

  return (
    <div className="rounded-xl border border-border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold">
          Pokok {ringgit(pj.jumlah_pokok)} ·{" "}
          <span className="font-normal text-muted-foreground">
            {new Date(pj.created_at).toLocaleDateString("ms-MY")}
          </span>
        </p>
        <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
          {labelStatusPinjaman(pj.status)}
        </span>
      </div>

      {pj.status === "menunggu" ? (
        <div className="mt-3 flex flex-wrap gap-3">
          <Button size="sm" className="rounded-full" disabled={sibuk} onClick={() => putuskan("aktif")}>
            Luluskan Pinjaman
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="rounded-full"
            disabled={sibuk}
            onClick={() => putuskan("ditolak")}
          >
            Tolak
          </Button>
        </div>
      ) : pj.status === "ditolak" ? (
        <p className="mt-2 text-xs text-muted-foreground">Permintaan pinjaman ini ditolak.</p>
      ) : (
        <>
          <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-4">
            <Butiran label={`Faedah (${hariBerjalan(pj)} hari)`} nilai={ringgit(jumlahFaedah(pj))} />
            <Butiran label="Jumlah tagihan" nilai={ringgit(total)} />
            <Butiran label="Sudah dibayar" nilai={ringgit(pj.jumlah_dibayar)} />
            <div>
              <dt className="text-xs text-muted-foreground">Baki tagihan</dt>
              <dd className="font-bold text-primary">{ringgit(baki)}</dd>
            </div>
          </dl>

          {pj.status === "aktif" && (
            <div className="mt-4 grid gap-3 sm:grid-cols-[160px_1fr_auto] sm:items-end">
              <div className="space-y-1.5">
                <Label htmlFor={`bayar-${pj.id}`}>Bayaran diterima (RM)</Label>
                <Input
                  id={`bayar-${pj.id}`}
                  type="number"
                  min="0"
                  step="0.01"
                  value={bayar}
                  onChange={(e) => setBayar(e.target.value)}
                  placeholder="500"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`nota-${pj.id}`}>Catatan bayaran</Label>
                <Input
                  id={`nota-${pj.id}`}
                  value={nota}
                  onChange={(e) => setNota(e.target.value)}
                  placeholder="Contoh: pindahan bank"
                />
              </div>
              <Button className="rounded-full" disabled={sibuk} onClick={rekodBayaran}>
                Tolak Tagihan
              </Button>
            </div>
          )}
        </>
      )}
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
