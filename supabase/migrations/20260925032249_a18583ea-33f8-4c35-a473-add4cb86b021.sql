CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nama_penuh TEXT,
  emel TEXT,
  no_telefon TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profil_lihat_sendiri" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profil_kemaskini_sendiri" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "profil_cipta_sendiri" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE TYPE public.app_role AS ENUM ('admin', 'pemohon');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "peranan_lihat_sendiri" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE TABLE public.permohonan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nama_penuh TEXT NOT NULL,
  no_kad_pengenalan TEXT NOT NULL,
  no_telefon TEXT NOT NULL,
  emel TEXT NOT NULL,
  alamat TEXT NOT NULL,
  pekerjaan TEXT NOT NULL,
  industri TEXT NOT NULL,
  pengalaman_tahun NUMERIC NOT NULL DEFAULT 0,
  gaji_bulanan NUMERIC NOT NULL DEFAULT 0,
  jumlah_dipohon NUMERIC NOT NULL DEFAULT 0,
  tempoh_bulan INTEGER NOT NULL DEFAULT 12,
  foto_kp_path TEXT NOT NULL,
  foto_selfie_path TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'menunggu',
  had_kredit NUMERIC,
  catatan_admin TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.permohonan TO authenticated;
GRANT ALL ON public.permohonan TO service_role;
ALTER TABLE public.permohonan ENABLE ROW LEVEL SECURITY;
CREATE POLICY "permohonan_lihat_sendiri" ON public.permohonan FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "permohonan_lihat_admin" ON public.permohonan FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "permohonan_hantar_sendiri" ON public.permohonan FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "permohonan_kemaskini_admin" ON public.permohonan FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
CREATE TRIGGER permohonan_updated_at BEFORE UPDATE ON public.permohonan
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nama_penuh, emel, no_telefon)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'nama_penuh',
    NEW.email,
    NEW.raw_user_meta_data ->> 'no_telefon'
  )
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'pemohon')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();