import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Wallet, Upload } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useSesi } from "@/hooks/use-sesi";

export const Route = createFileRoute("/_authenticated/mohon")({
  head: () => ({
    meta: [
      { title: "Borang Permohonan Pinjaman — FinRinggit" },
      { name: "description", content: "Isi maklumat diri dan pekerjaan untuk memohon pinjaman." },
      { property: "og:title", content: "Borang Permohonan Pinjaman — FinRinggit" },
      {
        property: "og:description",
        content: "Isi maklumat diri dan pekerjaan untuk memohon pinjaman.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BorangMohon,
});

const INDUSTRI = [
  "Perkhidmatan Awam",
  "Pembuatan",
  "Peruncitan & Perdagangan",
  "Pembinaan",
  "Kesihatan",
  "Pendidikan",
  "Teknologi Maklumat",
  "Kewangan & Perbankan",
  "Pengangkutan & Logistik",
  "Perhotelan & Pelancongan",
  "Pertanian",
  "Lain-lain",
];

function BorangMohon() {
  const { user } = useSesi();
  const navigate = useNavigate();
  const [sibuk, setSibuk] = useState(false);
  const [industri, setIndustri] = useState("");
  const [fotoKp, setFotoKp] = useState<File | null>(null);
  const [fotoSelfie, setFotoSelfie] = useState<File | null>(null);

  const muatNaik = async (fail: File, userId: string, label: string) => {
    const sambungan = fail.name.split(".").pop() ?? "jpg";
    const laluan = `${userId}/${label}-${crypto.randomUUID()}.${sambungan}`;
    const { error } = await supabase.storage
      .from("dokumen-permohonan")
      .upload(laluan, fail, { contentType: fail.type });
    if (error) throw error;
    return laluan;
  };

  const hantar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    if (!fotoKp || !fotoSelfie) {
      toast.error("Sila muat naik kedua-dua foto.");
      return;
    }
    if (!industri) {
      toast.error("Sila pilih industri pekerjaan.");
      return;
    }

    const borang = new FormData(e.currentTarget);
    setSibuk(true);
    try {
      const [fotoKpPath, fotoSelfiePath] = await Promise.all([
        muatNaik(fotoKp, user.id, "kad-pengenalan"),
        muatNaik(fotoSelfie, user.id, "selfie"),
      ]);

      const { error } = await supabase.from("permohonan").insert({
        user_id: user.id,
        nama_penuh: String(borang.get("nama_penuh") ?? ""),
        no_kad_pengenalan: String(borang.get("no_kad_pengenalan") ?? ""),
        no_telefon: String(borang.get("no_telefon") ?? ""),
        emel: String(borang.get("emel") ?? ""),
        alamat: String(borang.get("alamat") ?? ""),
        pekerjaan: String(borang.get("pekerjaan") ?? ""),
        industri,
        pengalaman_tahun: Number(borang.get("pengalaman_tahun") ?? 0),
        gaji_bulanan: Number(borang.get("gaji_bulanan") ?? 0),
        jumlah_dipohon: Number(borang.get("jumlah_dipohon") ?? 0),
        tempoh_bulan: Number(borang.get("tempoh_bulan") ?? 12),
        foto_kp_path: fotoKpPath,
        foto_selfie_path: fotoSelfiePath,
      });
      if (error) throw error;

      toast.success("Permohonan berjaya dihantar untuk semakan.");
      navigate({ to: "/permohonan-saya" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Permohonan gagal dihantar.");
    } finally {
      setSibuk(false);
    }
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
          <Link to="/permohonan-saya" className="text-sm font-medium text-primary hover:underline">
            Permohonan Saya
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-bold">Borang Permohonan Pinjaman</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Lengkapkan maklumat di bawah dan muat naik dua (2) foto. Permohonan anda akan disemak oleh
          pasukan kami.
        </p>

        <form onSubmit={hantar} className="mt-8 space-y-8">
          <section className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
            <h2 className="text-base font-bold">Maklumat Diri</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nama_penuh">Nama Penuh</Label>
                <Input id="nama_penuh" name="nama_penuh" required placeholder="Ahmad bin Ali" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="no_kad_pengenalan">No. Kad Pengenalan</Label>
                <Input
                  id="no_kad_pengenalan"
                  name="no_kad_pengenalan"
                  required
                  placeholder="900101-10-5555"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="no_telefon">Nombor Telefon</Label>
                <Input
                  id="no_telefon"
                  name="no_telefon"
                  type="tel"
                  required
                  placeholder="+60 12 345 6789"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emel">E-mel</Label>
                <Input
                  id="emel"
                  name="emel"
                  type="email"
                  required
                  defaultValue={user?.email ?? ""}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="alamat">Alamat Kediaman</Label>
                <Textarea id="alamat" name="alamat" required rows={3} />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
            <h2 className="text-base font-bold">Maklumat Pekerjaan</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pekerjaan">Pekerjaan / Jawatan</Label>
                <Input id="pekerjaan" name="pekerjaan" required placeholder="Eksekutif Jualan" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industri">Industri Pekerjaan</Label>
                <Select value={industri} onValueChange={setIndustri}>
                  <SelectTrigger id="industri">
                    <SelectValue placeholder="Pilih industri" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRI.map((i) => (
                      <SelectItem key={i} value={i}>
                        {i}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pengalaman_tahun">Pengalaman Kerja (tahun)</Label>
                <Input
                  id="pengalaman_tahun"
                  name="pengalaman_tahun"
                  type="number"
                  min="0"
                  step="0.5"
                  required
                  placeholder="3"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gaji_bulanan">Gaji Bulanan (RM)</Label>
                <Input
                  id="gaji_bulanan"
                  name="gaji_bulanan"
                  type="number"
                  min="0"
                  required
                  placeholder="3500"
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
            <h2 className="text-base font-bold">Butiran Pinjaman</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="jumlah_dipohon">Jumlah Dipohon (RM)</Label>
                <Input
                  id="jumlah_dipohon"
                  name="jumlah_dipohon"
                  type="number"
                  min="50"
                  required
                  defaultValue={3000}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tempoh_bulan">Tempoh Bayaran (bulan)</Label>
                <Input
                  id="tempoh_bulan"
                  name="tempoh_bulan"
                  type="number"
                  min="1"
                  max="60"
                  required
                  defaultValue={12}
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
            <h2 className="text-base font-bold">Muat Naik 2 Foto</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Foto kad pengenalan dan foto selfie anda bersama kad pengenalan.
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <KotakFoto
                id="foto_kp"
                label="Foto Kad Pengenalan"
                fail={fotoKp}
                onPilih={setFotoKp}
              />
              <KotakFoto
                id="foto_selfie"
                label="Foto Selfie Bersama KP"
                fail={fotoSelfie}
                onPilih={setFotoSelfie}
              />
            </div>
          </section>

          <Button type="submit" size="lg" className="w-full rounded-xl text-base" disabled={sibuk}>
            {sibuk ? "Menghantar permohonan..." : "Hantar Permohonan"}
          </Button>
        </form>
      </main>
      <Toaster />
    </div>
  );
}

function KotakFoto({
  id,
  label,
  fail,
  onPilih,
}: {
  id: string;
  label: string;
  fail: File | null;
  onPilih: (f: File | null) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <label
        htmlFor={id}
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted px-4 py-8 text-center transition-colors hover:bg-accent"
      >
        <Upload className="size-6 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          {fail ? fail.name : "Ketik untuk pilih atau ambil foto"}
        </span>
      </label>
      <input
        id={id}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onPilih(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}
