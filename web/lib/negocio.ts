export const negocio = {
  marca: 'ProteinaSmart',
  dominio: 'https://www.proteinasmart.com',
  claim: 'Proteina inteligente',
  descripcion:
    'Marketplace de proteinas y suplementos para la salud, la belleza y la longevidad, con asesoramiento real en Paraguay.',
  contacto: {
    responsable: 'Oscar Amarilla',
    telefonoLocal: '0985 864 209',
    whatsapp: '595985864209',
    email: 'hola@proteinasmart.com',
    ruc: '4499507-5',
    ciudad: 'Asuncion, Paraguay',
  },
  operacion: {
    envioAsuncion: 'Envío en el día en Asunción y Gran Asunción',
    envioInterior: 'Envío al interior por encomienda (24–72 h)',
    pagos: 'Transferencia bancaria, Tigo Money, Personal Pay y efectivo',
    facturacion: 'Factura legal con RUC en todos los pedidos',
    horario: 'Lunes a sábado, 08:00 a 19:00',
  },
  legal: {
    disclaimer:
      'Los suplementos alimenticios no son medicamentos y no reemplazan una alimentación variada ni el consejo de un profesional de la salud. Consultá a tu médico ante cualquier condición preexistente, embarazo, lactancia o tratamiento farmacológico.',
  },
  faq: [
    {
      pregunta: '¿Cómo reservo en ProteínaSmart?',
      respuesta:
        'Elegís el producto, lo agregás a tu reserva y completás tus datos. Confirmamos disponibilidad, precio final y plazo por WhatsApp antes de traerlo.',
    },
    {
      pregunta: '¿Hacen envíos al interior del país?',
      respuesta:
        'Envío en el día en Asunción y Gran Asunción. Envío al interior por encomienda, con entrega estimada de 24 a 72 horas.',
    },
    {
      pregunta: '¿Qué proteína me conviene si quiero bajar grasa?',
      respuesta:
        'En general, una proteína aislada o vegetal de bajo carbohidrato, sostenida con un plan low carb y suficiente saciedad. Escribinos para ajustar la recomendación a tu nivel de actividad.',
    },
    {
      pregunta: '¿Los productos son originales?',
      respuesta:
        'Trabajamos con productos originales y verificamos lote y vencimiento antes de entregar. Si algo llega mal, se cambia.',
    },
    {
      pregunta: '¿Emiten factura legal?',
      respuesta:
        'Sí, las reservas confirmadas se facturan. RUC 4499507-5, a nombre de Oscar Amarilla.',
    },
    {
      pregunta: '¿Los suplementos reemplazan una consulta médica?',
      respuesta:
        'No. La suplementación complementa una alimentación y un entrenamiento; no sustituye el diagnóstico ni el tratamiento de un profesional de la salud.',
    },
  ],
} as const;

export function whatsappUrl(mensaje: string) {
  return `https://wa.me/${negocio.contacto.whatsapp}?text=${encodeURIComponent(mensaje)}`;
}
