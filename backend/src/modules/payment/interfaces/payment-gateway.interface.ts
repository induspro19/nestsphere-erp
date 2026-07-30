export interface IPaymentOrder {
  id: string;
  amount: number;
  currency: string;
  status: string;
  receipt?: string;
}

export interface IPaymentGateway {
  createOrder(amount: number, receiptId: string, currency?: string): Promise<IPaymentOrder>;
  verifyPayment(orderId: string, paymentId: string, signature: string): boolean;
  verifyWebhookSignature(payload: string, signature: string, secret: string): boolean;
}
