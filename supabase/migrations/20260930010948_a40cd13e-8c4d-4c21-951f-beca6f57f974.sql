-- Kadar faedah harian tetap 0.005% = 0.00005
CREATE TABLE public.pinjaman (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permohonan_id UUID NOT NULL REFERENCES public.permohonan(id) ON DELETE CASCADE,
  jumlah_pokok NUMERIC NOT NULL,
  kadar_faedah_harian NUMERIC NOT NULL DEFAULT 0.00005,
  status TEXT NOT NULL DEFAULT 'menunggu',
  jumlah_dibayar NUMERIC NOT NULL DEFAULT 0,
  tarikh_lulus TIMESTAMPTZ,
  tarikh_selesai TIMESTAMPTZ,
  catatan_admin TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.pinjaman TO authenticated;
GRANT ALL ON public.pinjaman TO service_role;
ALTER TABLE public.pinjaman ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pinjaman_lihat_sendiri" ON public.pinjaman FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "pinjaman_lihat_admin" ON public.pinjaman FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "pinjaman_mohon_sendiri" ON public.pinjaman FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND status = 'menunggu');
CREATE POLICY "pinjaman_kemaskini_admin" ON public.pinjaman FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER pinjaman_updated_at BEFORE UPDATE ON public.pinjaman
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Sahkan permintaan pinjaman terhadap had kredit yang diluluskan
CREATE OR REPLACE FUNCTION public.sah_pinjaman()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rekod public.permohonan%ROWTYPE;
BEGIN
  SELECT * INTO rekod FROM public.permohonan WHERE id = NEW.permohonan_id;
  IF rekod.id IS NULL OR rekod.user_id <> NEW.user_id THEN
    RAISE EXCEPTION 'Permohonan tidak sah.';
  END IF;
  IF rekod.status <> 'lulus' OR COALESCE(rekod.had_kredit, 0) <= 0 THEN
    RAISE EXCEPTION 'Had kredit belum diluluskan.';
  END IF;
  IF NEW.jumlah_pokok <= 0 OR NEW.jumlah_pokok > rekod.had_kredit THEN
    RAISE EXCEPTION 'Jumlah melebihi had kredit.';
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.pinjaman
    WHERE permohonan_id = NEW.permohonan_id AND status IN ('menunggu', 'aktif')
  ) THEN
    RAISE EXCEPTION 'Masih ada pinjaman yang belum selesai.';
  END IF;
  NEW.kadar_faedah_harian := 0.00005;
  NEW.jumlah_dibayar := 0;
  NEW.status := 'menunggu';
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.sah_pinjaman() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER pinjaman_sah BEFORE INSERT ON public.pinjaman
FOR EACH ROW EXECUTE FUNCTION public.sah_pinjaman();

-- Pembayaran yang direkod oleh pentadbir
CREATE TABLE public.pembayaran (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pinjaman_id UUID NOT NULL REFERENCES public.pinjaman(id) ON DELETE CASCADE,
  jumlah NUMERIC NOT NULL,
  catatan TEXT,
  direkod_oleh UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.pembayaran TO authenticated;
GRANT ALL ON public.pembayaran TO service_role;
ALTER TABLE public.pembayaran ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bayaran_lihat_sendiri" ON public.pembayaran FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.pinjaman p WHERE p.id = pinjaman_id AND p.user_id = auth.uid()));
CREATE POLICY "bayaran_lihat_admin" ON public.pembayaran FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "bayaran_rekod_admin" ON public.pembayaran FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin') AND direkod_oleh = auth.uid());

-- Jumlah tagihan semasa: pokok + faedah harian sehingga hari ini
CREATE OR REPLACE FUNCTION public.jumlah_tagihan(_pinjaman_id UUID)
RETURNS NUMERIC
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ROUND(
    p.jumlah_pokok
    + p.jumlah_pokok * p.kadar_faedah_harian
      * GREATEST(0, FLOOR(EXTRACT(EPOCH FROM (COALESCE(p.tarikh_selesai, now()) - COALESCE(p.tarikh_lulus, now()))) / 86400))
  , 2)
  FROM public.pinjaman p
  WHERE p.id = _pinjaman_id
    AND (p.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
$$;
REVOKE EXECUTE ON FUNCTION public.jumlah_tagihan(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.jumlah_tagihan(uuid) TO authenticated, service_role;

-- Kemaskini baki selepas pembayaran direkod
CREATE OR REPLACE FUNCTION public.selepas_pembayaran()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  jumlah_kini NUMERIC;
  dibayar NUMERIC;
BEGIN
  IF NEW.jumlah <= 0 THEN
    RAISE EXCEPTION 'Jumlah bayaran mesti lebih besar daripada sifar.';
  END IF;

  SELECT ROUND(
    p.jumlah_pokok
    + p.jumlah_pokok * p.kadar_faedah_harian
      * GREATEST(0, FLOOR(EXTRACT(EPOCH FROM (COALESCE(p.tarikh_selesai, now()) - COALESCE(p.tarikh_lulus, now()))) / 86400))
  , 2), p.jumlah_dibayar
  INTO jumlah_kini, dibayar
  FROM public.pinjaman p WHERE p.id = NEW.pinjaman_id;

  dibayar := dibayar + NEW.jumlah;

  UPDATE public.pinjaman
  SET jumlah_dibayar = dibayar,
      status = CASE WHEN dibayar >= jumlah_kini THEN 'selesai' ELSE status END,
      tarikh_selesai = CASE WHEN dibayar >= jumlah_kini THEN now() ELSE tarikh_selesai END
  WHERE id = NEW.pinjaman_id;

  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.selepas_pembayaran() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER pembayaran_kemaskini_baki AFTER INSERT ON public.pembayaran
FOR EACH ROW EXECUTE FUNCTION public.selepas_pembayaran();