import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export function useSesi() {
  const [user, setUser] = useState<User | null>(null);
  const [memuatkan, setMemuatkan] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setMemuatkan(false);
    });

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setMemuatkan(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  return { user, memuatkan };
}

export function useAdakahAdmin(userId: string | undefined) {
  const [adminKah, setAdminKah] = useState<boolean | null>(null);

  useEffect(() => {
    let batal = false;
    if (!userId) {
      setAdminKah(null);
      return;
    }
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle()
      .then(({ data }) => {
        if (!batal) setAdminKah(Boolean(data));
      });
    return () => {
      batal = true;
    };
  }, [userId]);

  return adminKah;
}

/** Semak sama ada pengguna ialah admin (untuk logik pengalihan sebelum halaman dimuatkan). */
export async function semakAdmin(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  return Boolean(data);
}
