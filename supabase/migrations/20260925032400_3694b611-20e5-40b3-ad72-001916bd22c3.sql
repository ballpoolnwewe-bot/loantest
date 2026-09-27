CREATE POLICY "dokumen_muat_naik_sendiri" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'dokumen-permohonan' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "dokumen_lihat_sendiri" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'dokumen-permohonan' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "dokumen_lihat_admin" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'dokumen-permohonan' AND public.has_role(auth.uid(), 'admin'));