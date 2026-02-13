-- 주문 생성 시 결제자 본인이 해당 주문에 대한 payments 행을 INSERT할 수 있도록 허용
CREATE POLICY "payments_insert_own_order"
  ON public.payments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = payments.order_id
      AND o.user_id = auth.uid()
    )
  );
