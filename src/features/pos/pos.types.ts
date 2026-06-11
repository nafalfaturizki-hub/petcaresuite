export type ItemType = 'product' | 'service';

export interface CartItem {
  id: string;
  name: string;
  itemType: ItemType;
  referenceId?: string | null;
  unitPrice: number;
  quantity: number;
  discountAmount: number;
  total: number;
}

export interface Cart {
  items: CartItem[];
  customerId?: string | null;
  customerName?: string | null;
  loyaltyPointsAvailable?: number;
  loyaltyPointsToRedeem?: number;
  subtotal: number;
  discountTotal: number;
  loyaltyDiscount: number;
  total: number;
}

export type PaymentMethod = 'cash' | 'card' | 'bank-transfer' | 'e-wallet';

export interface PaymentData {
  method: PaymentMethod;
  methodSecondary?: PaymentMethod | null;
  paidAmount: number;
  paidAmountSecondary?: number | null;
  changeAmount: number;
  splitEnabled: boolean;
  reference?: string | null;
}

export interface InvoiceCreatePayload {
  invoice_number?: string;
  customer_id?: string | null;
  appointment_id?: string | null;
  inpatient_record_id?: string | null;
  subtotal: number;
  discount_amount: number;
  loyalty_points_used: number;
  loyalty_discount_amount: number;
  total: number;
  payment_method: PaymentMethod;
  payment_method_secondary?: PaymentMethod | null;
  paid_amount: number;
  change_amount: number;
  status: string;
  notes?: string | null;
  created_by?: string | null;
  items: Array<{
    item_type: ItemType | string;
    reference_id?: string | null;
    name: string;
    quantity: number;
    unit_price: number;
    discount: number;
    total: number;
  }>;
}

export interface InvoiceQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  dateFrom?: string | null;
  dateTo?: string | null;
  paymentMethod?: PaymentMethod | null;
}
