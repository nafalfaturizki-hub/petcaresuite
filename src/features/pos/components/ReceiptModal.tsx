import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import type { Cart } from '../pos.types';

interface ReceiptModalProps {
  open: boolean;
  onClose: () => void;
  invoiceNumber: string;
  cashier?: string;
  customerName?: string | null;
  cart: Cart;
  paymentInfo?: any;
}

export function ReceiptModal({ open, onClose, invoiceNumber, cashier, customerName, cart, paymentInfo }: ReceiptModalProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const handlePrint = useReactToPrint({ content: () => ref.current });

  const sendWhatsApp = async (number?: string) => {
    if (!number) return;
    try {
      await supabase.functions.invoke('send-whatsapp', { body: { number, message: `Invoice ${invoiceNumber} - Total: ${formatCurrency(cart.total)}` } } as any);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Receipt - {invoiceNumber}</DialogTitle>
        </DialogHeader>
        <div ref={ref} className="space-y-4 p-4">
          <div className="text-sm">
            <div>Cashier: {cashier || 'Unknown'}</div>
            <div>Customer: {customerName || 'Walk-in'}</div>
            <div>Date: {new Date().toLocaleString()}</div>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left">Item</th>
                <th className="text-right">Qty</th>
                <th className="text-right">Price</th>
                <th className="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {cart.items.map((it) => (
                <tr key={it.id}>
                  <td>{it.name}</td>
                  <td className="text-right">{it.quantity}</td>
                  <td className="text-right">{formatCurrency(it.unitPrice)}</td>
                  <td className="text-right">{formatCurrency(it.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-right">
            <div>Subtotal: {formatCurrency(cart.subtotal)}</div>
            <div>Discount: {formatCurrency(cart.discountTotal)}</div>
            <div>Loyalty: {formatCurrency(cart.loyaltyDiscount)}</div>
            <div className="text-xl font-semibold">Total: {formatCurrency(cart.total)}</div>
          </div>
        </div>
        <DialogFooter>
          <div className="flex gap-2">
            <Button onClick={() => handlePrint()}>Print</Button>
            <Button onClick={() => sendWhatsApp(paymentInfo?.phone)}>Send WhatsApp</Button>
            <Button variant="secondary" onClick={onClose}>Close</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ReceiptModal;
