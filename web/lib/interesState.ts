// Vive aca y no en app/intereses/actions.ts por la misma razon que
// checkoutState.ts: un archivo 'use server' solo puede exportar funciones
// async.
export type InterestState = { status: 'idle' | 'success' | 'error'; message: string };

export const estadoInicialInteres: InterestState = { status: 'idle', message: '' };
