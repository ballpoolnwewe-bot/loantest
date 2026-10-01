-- Butiran permintaan pinjaman: tempoh (tenor), tujuan dan akaun bank penerima.
-- Lajur dibiarkan boleh-null supaya rekod lama kekal sah; pinjaman baharu wajib mengisinya (lihat sah_pinjaman).
ALTER TABLE public.pinjaman
  ADD COLUMN IF NOT EXISTS tempoh_bulan INTEGER,
  ADD COLUMN IF NOT EXISTS tujuan TEXT,
  ADD COLUMN IF NOT EXISTS nama_bank TEXT,
  ADD COLUMN IF NOT EXISTS nama_pemegang_akaun TEXT,
  ADD COLUMN IF NOT EXISTS no_akaun TEXT;

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

  -- Tempoh, tujuan dan akaun penerima wajib diisi
  IF NEW.tempoh_bulan IS NULL OR NEW.tempoh_bulan NOT IN (1, 3, 6, 12) THEN
    RAISE EXCEPTION 'Tempoh pinjaman tidak sah.';
  END IF;
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
