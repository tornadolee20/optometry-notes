-- Allow admin (and super_admin) to view and update bank transfer submissions
-- Note: insert privileges remain with store owners (existing policy unchanged)

-- Admin can read all bank transfer submissions
CREATE POLICY "admins_can_view_transfer_submissions"
ON public.bank_transfer_submissions
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'super_admin'::app_role)
);

-- Admin can update (approve/reject) bank transfer submissions
CREATE POLICY "admins_can_update_transfer_submissions"
ON public.bank_transfer_submissions
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'super_admin'::app_role)
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'super_admin'::app_role)
);