export type ShippingMethodCode =
  | 'pickup'
  | 'delivery_metro'
  | 'encomienda_puerta'
  | 'encomienda_agencia';

export const SHIPPING_METHOD_CODES: ShippingMethodCode[] = [
  'pickup',
  'delivery_metro',
  'encomienda_puerta',
  'encomienda_agencia',
];

export function esShippingMethodCode(valor: unknown): valor is ShippingMethodCode {
  return typeof valor === 'string' && SHIPPING_METHOD_CODES.includes(valor as ShippingMethodCode);
}

export type CampoEntrega =
  | 'third_party_name'
  | 'third_party_ci'
  | 'address'
  | 'city'
  | 'reference'
  | 'department'
  | 'destination_city_agency'
  | 'recipient_ci'
  | 'courier_company_id';

// Campos de delivery_details obligatorios segun el metodo elegido, tal como
// figuran en la tabla de CLAUDE.md. pickup no tiene campos obligatorios
// propios (los datos de tercero son opcionales).
export const CAMPOS_REQUERIDOS_POR_METODO: Record<ShippingMethodCode, CampoEntrega[]> = {
  pickup: [],
  delivery_metro: ['address', 'city', 'reference'],
  encomienda_puerta: ['recipient_ci', 'address', 'city', 'department', 'courier_company_id'],
  encomienda_agencia: ['recipient_ci', 'city', 'destination_city_agency', 'courier_company_id'],
};

export const ES_METODO_ENCOMIENDA: Record<ShippingMethodCode, boolean> = {
  pickup: false,
  delivery_metro: false,
  encomienda_puerta: true,
  encomienda_agencia: true,
};

export const FLETE_DISCLAIMER =
  'Flete a cargo del cliente, se abona al retirar o al recibir.';

export const TIPOS_DOCUMENTO = ['RUC', 'CI'] as const;
export type TipoDocumento = (typeof TIPOS_DOCUMENTO)[number];

export const ETIQUETAS_CAMPO: Record<CampoEntrega, string> = {
  third_party_name: 'Nombre de quien retira',
  third_party_ci: 'CI de quien retira',
  address: 'Dirección',
  city: 'Ciudad',
  reference: 'Referencia de ubicación',
  department: 'Departamento',
  destination_city_agency: 'Ciudad / agencia de destino',
  recipient_ci: 'CI del destinatario',
  courier_company_id: 'Empresa de encomienda',
};
