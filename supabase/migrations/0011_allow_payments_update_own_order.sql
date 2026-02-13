-- 결제 승인/실패 시 주문 소유자가 해당 주문의 payments 행을 UPDATE할 수 있도록 허용
CREATE POLICY "payments_update_own_order"
  ON public.payments
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = payments.order_id
      AND o.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = payments.order_id
      AND o.user_id = auth.uid()
    )
  );
