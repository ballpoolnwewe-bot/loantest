-- Tempoh pinjaman dalam hari (14/21/28/35) dengan faedah tetap mengikut tempoh:
-- 14 hari = 50%, kemudian +25% bagi setiap tambahan 7 hari (21 = 75%, 28 = 100%, 35 = 125%).
-- Faedah dikenakan sekali sahaja pada jumlah pokok. Pinjaman lama (kadar_faedah_tetap NULL)
-- kekal dikira dengan kadar harian lama.
ALTER TABLE public.pinjaman
  ADD COLUMN IF NOT EXISTS tempoh_hari INTEGER,
  ADD COLUMN IF NOT EXISTS kadar_faedah_tetap NUMERIC,
  ADD COLUMN IF NOT EXISTS setuju_terma_pada TIMESTAMPTZ;

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

  -- Tempoh (hari) dan kadar faedah tetap ditentukan di pelayan, bukan oleh pelanggan
  NEW.kadar_faedah_tetap := CASE NEW.tempoh_hari
    WHEN 14 THEN 0.50
    WHEN 21 THEN 0.75
    WHEN 28 THEN 1.00
    WHEN 35 THEN 1.25
    ELSE NULL
  END;
  IF NEW.kadar_faedah_tetap IS NULL THEN
    RAISE EXCEPTION 'Tempoh pinjaman tidak sah.';
  END IF;

  IF NEW.setuju_terma_pada IS NULL THEN
    RAISE EXCEPTION 'Anda mesti bersetuju dengan terma dan syarat.';
  END IF;
  NEW.setuju_terma_pada := now();

  NEW.tujuan := btrim(COALESCE(NEW.tujuan, ''));
  NEW.nama_bank := btrim(COALESCE(NEW.nama_bank, ''));
  NEW.nama_pemegang_akaun := upper(btrim(COALESCE(NEW.nama_pemegang_akaun, '')));
  NEW.no_akaun := regexp_replace(COALESCE(NEW.no_akaun, ''), '\D', '', 'g');
  IF NEW.tujuan = '' THEN
    RAISE EXCEPTION 'Tujuan pinjaman wajib diisi.';
  END IF;
  IF NEW.nama_bank = '' THEN
    RAISE EXCEPTION 'Nama bank wajib dipilih.';
  END IF;
  IF length(NEW.nama_pemegang_akaun) < 3 THEN
    RAISE EXCEPTION 'Nama pemegang akaun wajib diisi.';
  END IF;
  IF length(NEW.no_akaun) < 8 OR length(NEW.no_akaun) > 20 THEN
    RAISE EXCEPTION 'Nombor akaun mesti 8 hingga 20 digit.';
  END IF;

  NEW.kadar_faedah_harian := 0.00005;
  NEW.jumlah_dibayar := 0;
  NEW.status := 'menunggu';
  RETURN NEW;
END;
$$;

-- Jumlah tagihan: pokok + faedah tetap (atau kaedah harian lama bagi pinjaman lama)
CREATE OR REPLACE FUNCTION public.jumlah_tagihan(_pinjaman_id UUID)
RETURNS NUMERIC
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ROUND(
    CASE WHEN p.kadar_faedah_tetap IS NOT NULL
      THEN p.jumlah_pokok * (1 + p.kadar_faedah_tetap)
      ELSE p.jumlah_pokok
        + p.jumlah_pokok * p.kadar_faedah_harian
          * GREATEST(0, FLOOR(EXTRACT(EPOCH FROM (COALESCE(p.tarikh_selesai, now()) - COALESCE(p.tarikh_lulus, now()))) / 86400))
    END
  , 2)
  FROM public.pinjaman p
  WHERE p.id = _pinjaman_id
    AND (p.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
$$;
REVOKE EXECUTE ON FUNCTION public.jumlah_tagihan(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.jumlah_tagihan(uuid) TO authenticated, service_role;

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
    CASE WHEN p.kadar_faedah_tetap IS NOT NULL
      THEN p.jumlah_pokok * (1 + p.kadar_faedah_tetap)
      ELSE p.jumlah_pokok
        + p.jumlah_pokok * p.kadar_faedah_harian
          * GREATEST(0, FLOOR(EXTRACT(EPOCH FROM (COALESCE(p.tarikh_selesai, now()) - COALESCE(p.tarikh_lulus, now()))) / 86400))
    END
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
