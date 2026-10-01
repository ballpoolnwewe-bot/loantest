import { useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AlertTriangle, ChevronDown, Copy, Info, LogOut, Search, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useSesi, useAdakahAdmin } from "@/hooks/use-sesi";
import { LencanaStatus } from "@/components/site/LencanaStatus";
import {
  bakiTagihan,
  hariBerjalan,
  jumlahFaedah,
  jumlahTagihan,
  labelStatusPinjaman,
  namaSama,
  pilihanJumlah,
  peratus,
  ringgit,
  tarikhJatuhTempo,
} from "@/lib/pinjaman";

export const Route = createFileRoute("/_authenticated/panel")({
  head: () => ({
    meta: [
      { title: "Panel Admin — Danaro" },
      { name: "description", content: "Panel pentadbir untuk meluluskan permohonan pinjaman." },
      { property: "og:title", content: "Panel Admin — Danaro" },
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
  tempoh_bulan: number | null;
  tempoh_hari: number | null;
  kadar_faedah_tetap: number | null;
  tujuan: string | null;
  nama_bank: string | null;
  nama_pemegang_akaun: string | null;
  no_akaun: string | null;
};

type Tab = "tindakan" | "aktif" | "semua";

const perluTindakan = (p: Permohonan, pj: Pinjaman[]) =>
  p.status === "menunggu" || pj.some((x) => x.status === "menunggu");

function Panel() {
  const { user } = useSesi();
  const adminKah = useAdakahAdmin(user?.id);
  const navigate = useNavigate();
  const [senarai, setSenarai] = useState<Permohonan[]>([]);
  const [pinjaman, setPinjaman] = useState<Pinjaman[]>([]);
  const [memuatkan, setMemuatkan] = useState(true);
  const [tab, setTab] = useState<Tab>("tindakan");
  const [carian, setCarian] = useState("");

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

  const logKeluar = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  };

  const ringkasan = useMemo(() => {
    const ikut = (id: string) => pinjaman.filter((x) => x.permohonan_id === id);
    return {
      permohonanBaharu: senarai.filter((p) => p.status === "menunggu").length,
      pinjamanMenunggu: pinjaman.filter((x) => x.status === "menunggu").length,
      pinjamanAktif: pinjaman.filter((x) => x.status === "aktif").length,
      tindakan: senarai.filter((p) => perluTindakan(p, ikut(p.id))).length,
      aktif: senarai.filter((p) => ikut(p.id).some((x) => x.status === "aktif")).length,
    };
  }, [senarai, pinjaman]);

  const dipapar = useMemo(() => {
    const kata = carian.trim().toLowerCase();
    return senarai.filter((p) => {
      const pj = pinjaman.filter((x) => x.permohonan_id === p.id);
      if (tab === "tindakan" && !perluTindakan(p, pj)) return false;
      if (tab === "aktif" && !pj.some((x) => x.status === "aktif")) return false;
      if (!kata) return true;
      return [p.nama_penuh, p.no_kad_pengenalan, p.no_telefon, p.emel].some((v) =>
        v.toLowerCase().includes(kata),
      );
    });
  }, [senarai, pinjaman, tab, carian]);

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

  const tabs: { id: Tab; label: string; bilangan: number }[] = [
    { id: "tindakan", label: "Perlu tindakan", bilangan: ringkasan.tindakan },
    { id: "aktif", label: "Pinjaman aktif", bilangan: ringkasan.aktif },
    { id: "semua", label: "Semua", bilangan: senarai.length },
  ];

  return (
    <div className="min-h-screen bg-muted pb-16">
      <header className="sticky top-0 z-30 border-b border-border bg-background">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Wallet className="size-5" />
            </span>
            <span className="text-lg font-bold tracking-tight">Danaro Admin</span>
          </div>
          <div className="flex items-center gap-1">
            <Button asChild variant="ghost" size="sm">
              <Link to="/">Lihat laman</Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={logKeluar}>
              <LogOut className="size-4" /> Log Keluar
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        <div className="grid grid-cols-3 gap-3">
          <Statistik label="Permohonan baharu" nilai={ringkasan.permohonanBaharu} />
          <Statistik label="Pinjaman menunggu" nilai={ringkasan.pinjamanMenunggu} />
          <Statistik label="Pinjaman aktif" nilai={ringkasan.pinjamanAktif} />
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div role="tablist" className="flex gap-1 overflow-x-auto rounded-xl bg-background p-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  tab === t.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent"
                }`}
              >
                {t.label} ({t.bilangan})
              </button>
            ))}
          </div>
          <div className="relative sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={carian}
              onChange={(e) => setCarian(e.target.value)}
              placeholder="Cari nama, no. KP atau telefon"
              className="bg-background pl-9"
              aria-label="Cari pemohon"
            />
          </div>
        </div>

        <p className="mt-3 flex items-start gap-1.5 text-xs text-muted-foreground">
          <Info className="mt-0.5 size-3.5 shrink-0" />
          Faedah tetap mengikut tempoh: 14 hari 50%, 21 hari 75%, 28 hari 100%, 35 hari 125%.
        </p>

        {memuatkan ? (
          <p className="mt-8 text-sm text-muted-foreground">Memuatkan permohonan...</p>
        ) : dipapar.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
            {carian
              ? "Tiada pemohon sepadan dengan carian anda."
              : tab === "tindakan"
                ? "Tiada apa yang perlu ditindak sekarang."
                : "Tiada rekod."}
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {dipapar.map((p) => (
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

function Statistik({ label, nilai }: { label: string; nilai: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-2xl font-extrabold text-primary">{nilai}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
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
  const perlu = perluTindakan(p, pinjaman);
  const [terbuka, setTerbuka] = useState(perlu);
  const [had, setHad] = useState(p.had_kredit != null ? String(p.had_kredit) : "");
  const [catatan, setCatatan] = useState(p.catatan_admin ?? "");
  const [sibuk, setSibuk] = useState(false);
  const [foto, setFoto] = useState<{ kp?: string; selfie?: string }>({});

  useEffect(() => {
    if (!terbuka) return;
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
  }, [terbuka, p.foto_kp_path, p.foto_selfie_path]);

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
  const pinjamanMenunggu = pinjaman.filter((x) => x.status === "menunggu").length;
  const pinjamanAktif = pinjaman.filter((x) => x.status === "aktif").length;

  return (
    <div className="rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
      <button
        type="button"
        onClick={() => setTerbuka((v) => !v)}
        aria-expanded={terbuka}
        className="flex w-full items-start justify-between gap-3 p-5 text-left"
      >
        <div className="min-w-0">
          <h2 className="truncate text-base font-bold">{p.nama_penuh}</h2>
          <p className="text-xs text-muted-foreground">
            {p.no_kad_pengenalan} · {p.no_telefon}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-primary">{ringgit(p.jumlah_dipohon)}</span>
            {pinjamanMenunggu > 0 && (
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-900">
                {pinjamanMenunggu} permintaan pinjaman
              </span>
            )}
            {pinjamanAktif > 0 && (
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                {pinjamanAktif} aktif
              </span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <LencanaStatus status={p.status} />
          <ChevronDown
            className={`size-4 text-muted-foreground transition-transform ${terbuka ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {terbuka && (
        <div className="border-t border-border p-5">
          <dl className="grid gap-3 text-sm sm:grid-cols-3">
            <Butiran label="E-mel" nilai={p.emel} />
            <Butiran label="Pekerjaan" nilai={p.pekerjaan} />
            <Butiran label="Industri" nilai={p.industri} />
            <Butiran label="Pengalaman" nilai={`${p.pengalaman_tahun} tahun`} />
            <Butiran label="Gaji bulanan" nilai={ringgit(p.gaji_bulanan)} />
            <div className="sm:col-span-3">
              <Butiran label="Alamat" nilai={p.alamat} />
            </div>
          </dl>

          <div className="mt-5 grid grid-cols-2 gap-3">
            {[
              { url: foto.kp, label: "Kad Pengenalan" },
              { url: foto.selfie, label: "Selfie bersama KP" },
            ].map((f) => (
              <figure key={f.label}>
                {f.url ? (
                  <a href={f.url} target="_blank" rel="noreferrer">
                    <img
                      src={f.url}
                      alt={`Foto ${f.label} pemohon`}
                      className="h-40 w-full rounded-xl object-cover"
                    />
                  </a>
                ) : (
                  <div className="h-40 w-full animate-pulse rounded-xl bg-muted" />
                )}
                <figcaption className="mt-1 text-xs text-muted-foreground">{f.label}</figcaption>
              </figure>
            ))}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`had-${p.id}`}>Had kredit (RM)</Label>
              <Input
                id={`had-${p.id}`}
                type="number"
                min="0"
                inputMode="numeric"
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
              <Label htmlFor={`catatan-${p.id}`}>Catatan pentadbir</Label>
              <Textarea
                id={`catatan-${p.id}`}
                rows={2}
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Contoh: dokumen lengkap"
              />
            </div>
          </div>

          {p.status === "menunggu" ? (
            <div className="mt-4 flex flex-wrap gap-3">
              <Button disabled={sibuk} onClick={() => putuskan("lulus")} className="rounded-full">
                Luluskan & tetapkan had
              </Button>
              <Button
                disabled={sibuk}
                variant="outline"
                onClick={() => putuskan("ditolak")}
                className="rounded-full"
              >
                Tolak permohonan
              </Button>
            </div>
          ) : (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button
                disabled={sibuk}
                variant="outline"
                size="sm"
                onClick={() => putuskan(p.status === "lulus" ? "lulus" : "ditolak")}
                className="rounded-full"
              >
                Simpan perubahan
              </Button>
              <span className="text-xs text-muted-foreground">
                Permohonan sudah {p.status === "lulus" ? "diluluskan" : "ditolak"}.
              </span>
            </div>
          )}

          {pinjaman.length > 0 && (
            <div className="mt-6 border-t border-border pt-5">
              <h3 className="text-sm font-bold">Pinjaman pelanggan</h3>
              <div className="mt-3 space-y-3">
                {pinjaman.map((pj) => (
                  <BarisPinjaman
                    key={pj.id}
                    pj={pj}
                    namaKp={p.nama_penuh}
                    adminId={adminId}
                    onKemaskini={onKemaskini}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function BarisPinjaman({
  pj,
  namaKp,
  adminId,
  onKemaskini,
}: {
  pj: Pinjaman;
  namaKp: string;
  adminId: string | undefined;
  onKemaskini: () => void;
}) {
  const [bayar, setBayar] = useState("");
  const [nota, setNota] = useState("");
  const [sibuk, setSibuk] = useState(false);
  const total = jumlahTagihan(pj);
  const baki = bakiTagihan(pj);
  const adaAkaun = Boolean(pj.no_akaun);
  const sepadan = namaSama(pj.nama_pemegang_akaun, namaKp);

  const salinNoAkaun = async () => {
    if (!pj.no_akaun) return;
    try {
      await navigator.clipboard.writeText(pj.no_akaun);
      toast.success("Nombor akaun disalin.");
    } catch {
      toast.error("Tidak dapat menyalin. Salin secara manual.");
    }
  };

  const putuskan = async (status: "aktif" | "ditolak") => {
    if (
      status === "aktif" &&
      adaAkaun &&
      !sepadan &&
      !window.confirm(
        `Nama akaun (${pj.nama_pemegang_akaun}) tidak sama dengan nama KP (${namaKp}). Teruskan meluluskan?`,
      )
    ) {
      return;
    }
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
    toast.success("Bayaran direkodkan. Baki perlu dibayar dikemaskini.");
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

      {adaAkaun && (
        <div className="mt-3 rounded-lg bg-muted p-3 text-sm">
          <dl className="grid gap-2 sm:grid-cols-3">
            <Butiran label="Tempoh" nilai={pj.tempoh_hari ? `${pj.tempoh_hari} hari` : "-"} />
            <div className="sm:col-span-2">
              <Butiran label="Tujuan" nilai={pj.tujuan ?? "-"} />
            </div>
            <Butiran label="Bank" nilai={pj.nama_bank ?? "-"} />
            <Butiran label="Nama pemegang akaun" nilai={pj.nama_pemegang_akaun ?? "-"} />
            <div>
              <dt className="text-xs text-muted-foreground">Nombor akaun</dt>
              <dd className="flex items-center gap-2 font-medium text-foreground">
                {pj.no_akaun}
                <button
                  type="button"
                  onClick={salinNoAkaun}
                  aria-label="Salin nombor akaun"
                  className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <Copy className="size-3.5" />
                </button>
              </dd>
            </div>
          </dl>
          {sepadan ? (
            <p className="mt-2 text-xs font-medium text-primary">
              Nama akaun sepadan dengan nama pada KP.
            </p>
          ) : (
            <p className="mt-2 flex items-start gap-1.5 text-xs font-semibold text-destructive">
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
              Nama akaun tidak sama dengan nama pada KP ({namaKp}). Semak sebelum meluluskan.
            </p>
          )}
        </div>
      )}

      {pj.status === "menunggu" ? (
        <div className="mt-3 flex flex-wrap gap-3">
          <Button size="sm" className="rounded-full" disabled={sibuk} onClick={() => putuskan("aktif")}>
            Luluskan pinjaman
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
            <Butiran
              label={
                pj.kadar_faedah_tetap != null
                  ? `Faedah tetap (${peratus(pj.kadar_faedah_tetap)})`
                  : `Faedah (${hariBerjalan(pj)} hari)`
              }
              nilai={ringgit(jumlahFaedah(pj))}
            />
            <Butiran label="Jumlah keseluruhan" nilai={ringgit(total)} />
            <Butiran label="Sudah dibayar" nilai={ringgit(pj.jumlah_dibayar)} />
            <div>
              <dt className="text-xs text-muted-foreground">Baki perlu dibayar</dt>
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
                Rekod bayaran
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
