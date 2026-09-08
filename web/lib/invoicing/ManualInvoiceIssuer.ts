import { supabaseAdminRequest } from '../supabaseAdmin';
import type { Invoice, InvoiceIssuer } from './InvoiceIssuer';

// Modo manual: crea el registro pending_manual y no llama a ningun servicio
// externo. Cuando se agregue facturacion electronica, SifenInvoiceIssuer se
// suma aca sin tocar el Server Action de checkout que la invoca.
export class ManualInvoiceIssuer implements InvoiceIssuer {
  async issue(orderId: string): Promise<Invoice> {
    const [invoice] = await supabaseAdminRequest<Invoice[]>('invoices', {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({
        order_id: orderId,
        mode: 'manual',
        status: 'pending_manual',
      }),
    });
    return invoice;
  }
}
