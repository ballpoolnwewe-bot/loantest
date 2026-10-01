import { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Wallet } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { semakAdmin } from "@/hooks/use-sesi";

const title = "Log Masuk — Finringgit";
const description = "Log masuk atau daftar akaun Finringgit untuk memohon pinjaman dalam talian.";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search['redirect'] === "string" ? (search['redirect'] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HalamanAuth,
});

function laluanSelamat(nilai: string | undefined) {
  if (!nilai || !nilai.startsWith("/") || nilai.startsWith("//")) return "/mohon";
  return nilai;
}

function HalamanAuth() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const [mod, setMod] = useState<"masuk" | "daftar">("masuk");
  const [nama, setNama] = useState("");
  const [emel, setEmel] = useState("");
  const [kataLaluan, setKataLaluan] = useState("");
  const [sibuk, setSibuk] = useState(false);

  const hantar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (kataLaluan.length < 6) {
      toast.error("Kata laluan mesti sekurang-kurangnya 6 aksara.");
      return;
    }
    setSibuk(true);
    try {
      if (mod === "daftar") {
        const { error } = await supabase.auth.signUp({
          email: emel.trim(),
          password: kataLaluan,
          options: {
            emailRedirectTo: window.location.origin,
            data: { nama_penuh: nama.trim() },
          },
        });
        if (error) throw error;
        toast.success("Akaun berjaya didaftarkan.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: emel.trim(),
          password: kataLaluan,
        });
        if (error) throw error;
        toast.success("Selamat kembali!");
      }
      // Admin terus ke panel; pengguna biasa ke halaman yang dituju.
      const { data: sesi } = await supabase.auth.getUser();
      if (sesi.user && (await semakAdmin(sesi.user.id))) {
        await navigate({ to: "/panel", replace: true });
        return;
      }
      const tujuan = laluanSelamat(redirect);
      await navigate({ href: tujuan, replace: true });
    } catch (err) {
      const mesej = err instanceof Error ? err.message : "Ralat tidak diketahui";
      toast.error(
        mesej.includes("Invalid login credentials")
          ? "E-mel atau kata laluan tidak betul."
          : mesej.includes("already registered")
            ? "E-mel ini sudah didaftarkan. Sila log masuk."
            : mesej,
      );
    } finally {
      setSibuk(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted px-4 py-12">
      <Link to="/" className="mb-6 flex items-center gap-2">
        <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Wallet className="size-5" />
        </span>
        <span className="text-lg font-bold tracking-tight">Finringgit</span>
      </Link>

      <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
        <h1 className="text-xl font-bold">
          {mod === "masuk" ? "Log Masuk Akaun" : "Daftar Akaun Baharu"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {mod === "masuk"
            ? "Log masuk untuk meneruskan permohonan pinjaman anda."
            : "Daftar percuma dalam masa kurang seminit."}
        </p>

        <form onSubmit={hantar} className="mt-6 space-y-4">
          {mod === "daftar" && (
            <div className="space-y-2">
              <Label htmlFor="nama">Nama Penuh</Label>
              <Input
                id="nama"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Ahmad bin Ali"
                required
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="emel">E-mel</Label>
            <Input
              id="emel"
              type="email"
              value={emel}
              onChange={(e) => setEmel(e.target.value)}
              placeholder="nama@emel.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="kata-laluan">Kata Laluan</Label>
            <Input
              id="kata-laluan"
              type="password"
              value={kataLaluan}
              onChange={(e) => setKataLaluan(e.target.value)}
              placeholder="Sekurang-kurangnya 6 aksara"
              required
            />
          </div>

          <Button type="submit" size="lg" className="w-full rounded-xl" disabled={sibuk}>
            {sibuk ? "Sila tunggu..." : mod === "masuk" ? "Log Masuk" : "Daftar Sekarang"}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          {mod === "masuk" ? "Belum ada akaun?" : "Sudah ada akaun?"}{" "}
          <button
            type="button"
            onClick={() => setMod(mod === "masuk" ? "daftar" : "masuk")}
            className="font-semibold text-primary hover:underline"
          >
            {mod === "masuk" ? "Daftar di sini" : "Log masuk di sini"}
          </button>
        </p>
      </div>
      <Toaster />
    </div>
  );
}
