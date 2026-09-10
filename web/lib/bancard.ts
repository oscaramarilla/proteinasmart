import crypto from 'node:crypto';

// Formulas de token y endpoints segun el manual oficial de Bancard
// "Integracion con eCommerce Bancard Compra Simple" (vPOS API 0.3.1). El
// orden de concatenacion de cada token es exacto segun ese manual -- no
// inventar variantes.
const BASE_URL_PRODUCCION = 'https://vpos.infonet.com.py';
const BASE_URL_STAGING = 'https://vpos.infonet.com.py:8888';
const CURRENCY = 'PYG';

function config() {
  const publicKey = process.env.BANCARD_PUBLIC_KEY;
  const privateKey = process.env.BANCARD_PRIVATE_KEY;

  if (!publicKey || !privateKey) {
    throw new Error('Faltan BANCARD_PUBLIC_KEY y BANCARD_PRIVATE_KEY.');
  }

  const baseUrl =
    process.env.BANCARD_ENVIRONMENT === 'production' ? BASE_URL_PRODUCCION : BASE_URL_STAGING;

  return { publicKey, privateKey, baseUrl };
}

function md5(valor: string): string {
  return crypto.createHash('md5').update(valor).digest('hex');
}

// Bancard exige el importe como string con dos decimales y "." como
// separador (ej: "49000.00"), aunque en guaranies no existan centavos.
export function formatearMonto(amount: number): string {
  return amount.toFixed(2);
}

function tokenSingleBuy(
  privateKey: string,
  shopProcessId: number,
  amount: string,
  currency: string,
): string {
  return md5(`${privateKey}${shopProcessId}${amount}${currency}`);
}

function tokenConfirm(
  privateKey: string,
  shopProcessId: number | string,
  amount: string,
  currency: string,
): string {
  return md5(`${privateKey}${shopProcessId}confirm${amount}${currency}`);
}

function tokenRollback(privateKey: string, shopProcessId: number | string): string {
  return md5(`${privateKey}${shopProcessId}rollback0.00`);
}

export type SingleBuyResult = { ok: true; processId: string } | { ok: false; error: string };

// "single_buy": inicia el proceso de pago y devuelve un process_id temporal
// que el frontend usa para montar el iframe de bancard-checkout-js.
export async function crearSingleBuy(params: {
  shopProcessId: number;
  amount: number;
  description: string;
  returnUrl: string;
  cancelUrl: string;
}): Promise<SingleBuyResult> {
  const { publicKey, privateKey, baseUrl } = config();
  const amountStr = formatearMonto(params.amount);
  const token = tokenSingleBuy(privateKey, params.shopProcessId, amountStr, CURRENCY);

  let response: Response;
  try {
    response = await fetch(`${baseUrl}/vpos/api/0.3/single_buy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        public_key: publicKey,
        operation: {
          token,
          shop_process_id: params.shopProcessId,
          currency: CURRENCY,
          amount: amountStr,
          description: params.description,
          return_url: params.returnUrl,
          cancel_url: params.cancelUrl,
        },
      }),
    });
  } catch {
    return { ok: false, error: 'No se pudo contactar a Bancard.' };
  }

  const data = await response.json().catch(() => null);

  if (!response.ok || !data || data.status !== 'success' || !data.process_id) {
    return { ok: false, error: (data && JSON.stringify(data)) || `Bancard respondió ${response.status}` };
  }

  return { ok: true, processId: data.process_id as string };
}

// Cancela un single_buy que no llego a confirmarse (usuario abandono el
// pago, o el comercio no recibio confirmacion dentro del tiempo esperado).
export async function rollbackSingleBuy(shopProcessId: number): Promise<boolean> {
  const { publicKey, privateKey, baseUrl } = config();
  const token = tokenRollback(privateKey, shopProcessId);

  const response = await fetch(`${baseUrl}/vpos/api/0.3/single_buy/rollback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      public_key: publicKey,
      operation: { token, shop_process_id: shopProcessId },
    }),
  });

  const data = await response.json().catch(() => null);
  return Boolean(data && data.status === 'success');
}

// Verifica el token que Bancard manda en la confirmacion server-to-server
// (POST a web/app/api/bancard/confirm). Segun el manual, esta confirmacion
// es "el unico medio por el cual el portal tendra la certeza de que el
// usuario completo satisfactoriamente una transaccion" -- nunca tratar el
// return_url del navegador como prueba de pago, solo esto.
export function verificarTokenConfirmacion(params: {
  shopProcessId: number | string;
  amount: string;
  tokenRecibido: string;
}): boolean {
  const { privateKey } = config();
  const esperado = tokenConfirm(privateKey, params.shopProcessId, params.amount, CURRENCY);
  return esperado === params.tokenRecibido;
}
