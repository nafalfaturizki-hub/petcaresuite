import React, { useEffect, useMemo, useState } from 'react';
import { Search, ShoppingCart, Receipt } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Button, Card, Input, RadioGroup, RadioGroupItem } from '@/components/ui';
import { useDebounce } from '@/hooks/useDebounce';
import { posService } from '../pos.service';
import useCartStore from '../stores/cart.store';
import ReceiptModal from '../components/ReceiptModal';
import { formatCurrency } from '@/lib/utils';
import type { CartItem } from '../pos.types';

export default function PosPage() {
  const [tab, setTab] = useState<'products' | 'services'>('products');
  const [query, setQuery] = useState('');
  const debounced = useDebounce(query, 300);
  const [results, setResults] = useState<any[]>([]);
  const addItem = useCartStore((s) => s.addItem);
  const cart = useCartStore((s) => s.cart);
  const paymentData = useCartStore((s) => s.paymentData);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const setItemDiscount = useCartStore((s) => s.setItemDiscount);
  const setPaymentMethod = useCartStore((s) => s.setPaymentMethod);
  const setPaidAmount = useCartStore((s) => s.setPaidAmount);
  const clearCart = useCartStore((s) => s.clearCart);

  const [receiptOpen, setReceiptOpen] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState('');

  useEffect(() => {
    let mounted = true;
    async function search() {
      if (!debounced) {
        setResults([]);
        return;
      }
      try {
        const res = tab === 'products' ? await posService.searchProducts(debounced) : await posService.searchServices(debounced);
        if (mounted) setResults(res);
      } catch (err) {
        console.error(err);
      }
    }
    search();
    return () => { mounted = false; };
  }, [debounced, tab]);

  const addResultToCart = (r: any) => {
    const item: Omit<CartItem, 'id' | 'total'> = {
      name: r.name,
      itemType: tab === 'products' ? 'product' : 'service',
      referenceId: r.id,
      unitPrice: r.price,
      quantity: 1,
      discountAmount: 0
    };
    addItem(item);
  };

  const subtotal = cart.subtotal;

  const checkout = async () => {
    if (!cart.items.length) return;
    // build invoice payload
    const payload = {
      subtotal: cart.subtotal,
      discount_amount: cart.discountTotal,
      loyalty_points_used: cart.loyaltyPointsToRedeem || 0,
      loyalty_discount_amount: cart.loyaltyDiscount,
      total: cart.total,
      payment_method: paymentData.method,
      paid_amount: paymentData.paidAmount,
      change_amount: paymentData.changeAmount,
      status: 'paid',
      notes: null,
      items: cart.items.map((it) => ({ item_type: it.itemType, reference_id: it.referenceId, name: it.name, quantity: it.quantity, unit_price: it.unitPrice, discount: it.discountAmount, total: it.total }))
    };

    try {
      const invoice = await posService.createInvoice(payload as any);
      setInvoiceNumber(invoice.invoice_number || invoice.id);
      setReceiptOpen(true);
      clearCart();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Point of Sale" description="Create invoices and process payments." />

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-[1fr,1fr,420px]">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <RadioGroup value={tab} onValueChange={(v) => setTab(v as any)} className="flex gap-2">
              <label className="inline-flex items-center gap-2">
                <RadioGroupItem value="products" /> Products
              </label>
              <label className="inline-flex items-center gap-2">
                <RadioGroupItem value="services" /> Services
              </label>
            </RadioGroup>
            <div className="ml-auto flex items-center gap-2">
              <Input placeholder="Search" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
          </div>

          <Card className="p-4">
            <div className="space-y-2">
              {results.map((r) => (
                <div key={r.id} className="flex items-center justify-between border-b py-2">
                  <div>
                    <div className="font-medium">{r.name}</div>
                    <div className="text-sm text-slate-500">{formatCurrency(r.price)}</div>
                  </div>
                  <div>
                    <Button onClick={() => addResultToCart(r)}><ShoppingCart className="w-4 h-4 mr-2"/>Add</Button>
                  </div>
                </div>
              ))}
              {!results.length && <div className="text-sm text-slate-500">No results</div>}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold">Cart</h3>
            <div className="mt-3 space-y-2">
              {cart.items.length ? cart.items.map((it) => (
                <div key={it.id} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{it.name}</div>
                    <div className="text-sm text-slate-500">{formatCurrency(it.unitPrice)}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity(it.id, Math.max(1, it.quantity - 1))}>-</button>
                    <div>{it.quantity}</div>
                    <button onClick={() => updateQuantity(it.id, it.quantity + 1)}>+</button>
                    <input className="w-20" type="number" defaultValue={it.discountAmount} onBlur={(e) => setItemDiscount(it.id, Number(e.target.value || 0))} />
                    <Button variant="ghost" onClick={() => removeItem(it.id)}>Remove</Button>
                  </div>
                </div>
              )) : <div className="text-sm text-slate-500">Cart is empty</div>}
            </div>

            <div className="mt-4 text-right space-y-1">
              <div>Subtotal: {formatCurrency(subtotal)}</div>
              <div className="text-lg font-semibold">Total: {formatCurrency(cart.total)}</div>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold">Payment</h3>
            <div className="mt-3 space-y-3">
              <div>
                <div className="text-sm text-slate-500">Method</div>
                <div className="flex gap-2 mt-2">
                  <Button variant={paymentData.method === 'cash' ? 'default' : 'outline'} onClick={() => setPaymentMethod('cash')}>Cash</Button>
                  <Button variant={paymentData.method === 'card' ? 'default' : 'outline'} onClick={() => setPaymentMethod('card')}>Card</Button>
                </div>
              </div>

              <div>
                <label className="block text-sm">Paid amount</label>
                <Input type="number" value={paymentData.paidAmount} onChange={(e) => setPaidAmount(Number(e.target.value || 0))} />
              </div>

              <div className="text-right mt-2">
                <div>Change: <span className="font-semibold">{formatCurrency(paymentData.changeAmount)}</span></div>
              </div>

              <div className="mt-3">
                <Button onClick={checkout} disabled={!cart.items.length}><Receipt className="w-4 h-4 mr-2"/>Checkout</Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <ReceiptModal open={receiptOpen} onClose={() => setReceiptOpen(false)} invoiceNumber={invoiceNumber} cart={cart} paymentInfo={{}} />
    </div>
  );
}
