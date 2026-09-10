// Vive aca y no en app/checkout/actions.ts porque un archivo 'use server' solo
// puede exportar funciones async -- exportar este tipo/constante desde ahi
// rompe el submit en runtime ("A 'use server' file can only export async
// functions"), aunque `next build` no lo detecte.
export type CheckoutState = {
  status: 'idle' | 'error' | 'success';
  errors: Record<string, string>;
  whatsappUrl?: string;
};

export const estadoInicialCheckout: CheckoutState = { status: 'idle', errors: {} };
