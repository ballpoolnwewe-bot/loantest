-- Slip gaji (foto) dan 5 kenalan kecemasan wajib bagi permohonan baharu.
-- Lajur lama dibiarkan nullable / berlalai supaya rekod sedia ada kekal sah.
ALTER TABLE public.permohonan
  ADD COLUMN IF NOT EXISTS foto_slip_gaji_path TEXT,
  ADD COLUMN IF NOT EXISTS kenalan_kecemasan JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.permohonan
  DROP CONSTRAINT IF EXISTS permohonan_kenalan_kecemasan_tatasusunan;
ALTER TABLE public.permohonan
  ADD CONSTRAINT permohonan_kenalan_kecemasan_tatasusunan
  CHECK (jsonb_typeof(kenalan_kecemasan) = 'array');

-- Permohonan baharu mesti ada slip gaji dan tepat 5 kenalan kecemasan.
DROP POLICY IF EXISTS "permohonan_hantar_sendiri" ON public.permohonan;
CREATE POLICY "permohonan_hantar_sendiri" ON public.permohonan
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND foto_slip_gaji_path IS NOT NULL
    AND jsonb_array_length(kenalan_kecemasan) = 5
  );
