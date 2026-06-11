import { useEffect, useState } from 'react';
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Input } from '@/components/ui';

interface RefundModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (amount: number, reason: string) => Promise<void>;
  invoiceTotal: number;
  isLoading?: boolean;
}

export function RefundModal({ open, onClose, onSubmit, invoiceTotal, isLoading = false }: RefundModalProps) {
  const [amount, setAmount] = useState(invoiceTotal);
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (open) {
      setAmount(invoiceTotal);
      setReason('');
    }
  }, [invoiceTotal, open]);

  const canSubmit = amount > 0 && amount <= invoiceTotal && reason.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={(value) => { if (!value) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Issue refund</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid gap-2">
            <label className="text-sm text-slate-600">Refund amount</label>
            <Input
              type="number"
              value={amount}
              onChange={(event) => setAmount(Number(event.target.value || 0))}
              min={1}
              max={invoiceTotal}
            />
            <p className="text-xs text-slate-500">Maximum refund amount is {invoiceTotal}.</p>
          </div>

          <div className="grid gap-2">
            <label className="text-sm text-slate-600">Reason</label>
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={4}
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>
        </div>

        <DialogFooter>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button disabled={!canSubmit || isLoading} onClick={() => onSubmit(amount, reason)}>
              {isLoading ? 'Processing...' : 'Submit refund'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default RefundModal;
