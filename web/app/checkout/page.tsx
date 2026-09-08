import { getSupabaseAnonClient } from '../../lib/supabasePublic';
import CheckoutForm, { type CourierCompanyOption, type ShippingMethodOption } from '../../components/CheckoutForm';

export const dynamic = 'force-dynamic';

async function obtenerConfigEntrega(): Promise<{
  metodos: ShippingMethodOption[];
  ciudades: string[];
  empresas: CourierCompanyOption[];
}> {
  const supabase = getSupabaseAnonClient();
  if (!supabase) {
    return { metodos: [], ciudades: [], empresas: [] };
  }

  const [metodosRes, ciudadesRes, empresasRes] = await Promise.all([
    supabase
      .from('shipping_methods')
      .select('code,label,copy')
      .eq('enabled', true)
      .order('sort_order'),
    supabase.from('metro_cities').select('name').eq('active', true).order('name'),
    supabase
      .from('courier_companies')
      .select('id,name')
      .eq('active', true)
      .order('sort_order')
      .order('name'),
  ]);

  return {
    metodos: (metodosRes.data as ShippingMethodOption[]) ?? [],
    ciudades: (ciudadesRes.data as { name: string }[] | null)?.map((c) => c.name) ?? [],
    empresas: (empresasRes.data as CourierCompanyOption[]) ?? [],
  };
}

export default async function CheckoutPage() {
  const { metodos, ciudades, empresas } = await obtenerConfigEntrega();
  // Generada una vez por request (force-dynamic): el mismo valor viaja en
  // el HTML servido, así que la hidratación en el cliente no lo recalcula.
  const idempotencyKey = crypto.randomUUID();

  return (
    <main className="min-h-screen bg-[#f4f7f2] px-4 py-10 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Finalizar pedido</h1>
        <p className="mt-2 text-slate-600">
          Completá tus datos y elegí cómo querés recibir tu pedido.
        </p>
        <div className="mt-8">
          <CheckoutForm
            metodos={metodos}
            ciudades={ciudades}
            empresas={empresas}
            idempotencyKey={idempotencyKey}
          />
        </div>
      </div>
    </main>
  );
}
