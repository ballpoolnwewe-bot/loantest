import { useEffect } from "react";

/**
 * Widget live chat CS (Tawk.to).
 *
 * Cara aktifkan:
 * 1. Daftar percuma di https://www.tawk.to dan cipta "Property" untuk Finringgit.
 * 2. Buka Administration > Channels > Chat Widget. Salin "Direct Chat Link":
 *    https://tawk.to/chat/<PROPERTY_ID>/<WIDGET_ID>
 * 3. Tampal kedua-dua ID di bawah, kemudian push ke GitHub.
 */
const TAWK_PROPERTY_ID = "6abdfcf1aa06053448ab829a";
const TAWK_WIDGET_ID = "1k3r284nh";

const belumDiisi = TAWK_PROPERTY_ID.startsWith("GANTI") || TAWK_WIDGET_ID.startsWith("GANTI");

type TawkWindow = Window & {
  Tawk_API?: Record<string, unknown>;
  Tawk_LoadStart?: Date;
};

export function ChatCs() {
  useEffect(() => {
    if (belumDiisi) return;
    if (document.getElementById("tawk-script")) return;

    const w = window as TawkWindow;
    w.Tawk_API = w.Tawk_API || {};
    w.Tawk_LoadStart = new Date();

    const s = document.createElement("script");
    s.id = "tawk-script";
    s.async = true;
    s.src = `https://embed.tawk.to/${TAWK_PROPERTY_ID}/${TAWK_WIDGET_ID}`;
    s.charset = "UTF-8";
    s.setAttribute("crossorigin", "*");
    document.body.appendChild(s);
  }, []);

  return null;
}
