import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { semakAdmin } from "@/hooks/use-sesi";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw redirect({ to: "/auth", search: { redirect: location.href } });
    }
    // Akaun admin sentiasa dihalakan ke panel.
    const admin = await semakAdmin(data.user.id);
    if (admin && !location.pathname.startsWith("/panel")) {
      throw redirect({ to: "/panel", replace: true });
    }
    return { user: data.user, admin };
  },
  component: () => <Outlet />,
});
