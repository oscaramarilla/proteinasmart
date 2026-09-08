export type Invoice = {
  id: string;
  order_id: string;
  mode: 'manual' | 'electronic';
  status: 'pending_manual' | 'issued' | 'void';
  numero: string | null;
  timbrado: string | null;
  issued_at: string | null;
  issued_by: string | null;
  scan_url: string | null;
  notes: string | null;
};

export interface InvoiceIssuer {
  issue(orderId: string): Promise<Invoice>;
}
