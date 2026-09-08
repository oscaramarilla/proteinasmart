function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      'Faltan NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.',
    );
  }

  return { url, key };
}

async function supabaseAdminRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const { url, key } = getSupabaseConfig();
  const headers = {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    ...init.headers,
  };

  const response = await fetch(`${url}/rest/v1/${path}`, { ...init, headers });

  if (!response.ok) {
    const detalle = await response.text().catch(() => '');
    throw new Error(
      `Supabase REST ${init.method ?? 'GET'} ${path} falló (${response.status}): ${detalle}`,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export { getSupabaseConfig, supabaseAdminRequest };
