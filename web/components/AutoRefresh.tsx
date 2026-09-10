'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// Refresca un Server Component (router.refresh) despues de N segundos.
// Se usa en /ruta/[token] mientras status === 'pending': la confirmacion de
// Bancard llega por webhook server-to-server y puede tardar unos segundos
// mas que el redirect del navegador al return_url.
export default function AutoRefresh({ segundos }: { segundos: number }) {
  const router = useRouter();

  useEffect(() => {
    const id = setTimeout(() => router.refresh(), segundos * 1000);
    return () => clearTimeout(id);
  }, [segundos, router]);

  return null;
}
