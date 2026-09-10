import { getSupabaseConfig } from './supabaseAdmin';

const BUCKET = 'hoja-de-ruta';
const OBJETO = 'hoja-de-ruta-90-dias.pdf';
const TTL_SEGUNDOS = 300;

// Genera una URL firmada de corta duracion para el PDF de la Hoja de Ruta,
// guardado en un bucket PRIVADO de Supabase Storage (no en web/public: una
// ruta publica seria adivinable y se saltearia el control de pago). Esta
// funcion solo debe llamarse despues de confirmar status === 'paid' en
// /ruta/[token].
//
// Requiere crear el bucket "hoja-de-ruta" (privado) en Supabase Storage y
// subir el PDF como "hoja-de-ruta-90-dias.pdf" -- eso no se puede hacer
// desde una migracion SQL, es un paso manual en el dashboard de Supabase.
export async function obtenerUrlFirmadaHojaDeRuta(): Promise<string | null> {
  const { url, key } = getSupabaseConfig();

  const response = await fetch(`${url}/storage/v1/object/sign/${BUCKET}/${OBJETO}`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ expiresIn: TTL_SEGUNDOS }),
  });

  if (!response.ok) {
    return null;
  }

  const datos = (await response.json().catch(() => null)) as { signedURL?: string } | null;
  if (!datos?.signedURL) {
    return null;
  }

  return `${url}/storage/v1${datos.signedURL}`;
}
