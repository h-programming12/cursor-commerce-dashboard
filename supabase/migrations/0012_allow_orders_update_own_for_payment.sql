-- 결제 승인/실패 시 주문 소유자가 해당 주문의 status, payment_status, paid_at 을 업데이트할 수 있도록 허용
CREATE POLICY "orders_update_own_for_payment"
  ON public.orders
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
