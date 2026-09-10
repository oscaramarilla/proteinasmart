'use client';

import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    Bancard?: {
      Checkout: {
        createForm: (containerId: string, processId: string, options?: Record<string, unknown>) => void;
      };
    };
  }
}

const CHECKOUT_JS_URL = process.env.NEXT_PUBLIC_BANCARD_CHECKOUT_JS_URL;
const CONTAINER_ID = 'bancard-iframe-container';

type Estado = 'idle' | 'cargando' | 'formulario' | 'error';

// Cobra la Hoja de Ruta (Gs 49.000) vía bancard-checkout-js: los datos de
// tarjeta se ingresan dentro del iframe que monta esta librería, nunca en
// este componente -- así el sitio no toca datos PCI. El pago se confirma en
// el servidor (web/app/api/bancard/confirm); esta vista solo inicia el
// proceso y muestra el iframe.
export default function BancardCheckout() {
  const [phone, setPhone] = useState('');
  const [estado, setEstado] = useState<Estado>('idle');
  const [error, setError] = useState('');
  const [scriptListo, setScriptListo] = useState(false);
  const [processId, setProcessId] = useState<string | null>(null);
  const formMontado = useRef(false);

  useEffect(() => {
    if (scriptListo && processId && !formMontado.current && window.Bancard) {
      window.Bancard.Checkout.createForm(CONTAINER_ID, processId);
      formMontado.current = true;
    }
  }, [scriptListo, processId]);

  async function iniciarPago() {
    if (phone.trim().length < 8) {
      setError('Ingresá un WhatsApp válido.');
      return;
    }
    setError('');
    setEstado('cargando');
    try {
      const respuesta = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim() }),
      });
      const datos = await respuesta.json();
      if (!respuesta.ok) {
        setError(datos.error || 'No pudimos iniciar el pago.');
        setEstado('error');
        return;
      }
      setProcessId(datos.processId);
      setEstado('formulario');
    } catch {
      setError('No pudimos conectar con el servidor de pago.');
      setEstado('error');
    }
  }

  return (
    <div>
      {CHECKOUT_JS_URL && (
        <Script src={CHECKOUT_JS_URL} strategy="afterInteractive" onLoad={() => setScriptListo(true)} />
      )}

      {estado !== 'formulario' && (
        <>
          <label className="quiz-label" htmlFor="bancard-phone">
            <span>WhatsApp</span>
            <input
              id="bancard-phone"
              type="tel"
              value={phone}
              onChange={(evento) => setPhone(evento.target.value)}
              placeholder="0985 864 209"
              className="quiz-input"
            />
          </label>
          {error && <p className="quiz-error">{error}</p>}
          <button
            type="button"
            onClick={iniciarPago}
            disabled={estado === 'cargando'}
            className="quiz-cta"
            style={{ marginTop: '1.5rem' }}
          >
            {estado === 'cargando' ? 'Iniciando pago...' : 'Pagar Gs 49.000'}
          </button>
        </>
      )}

      {estado === 'formulario' && !CHECKOUT_JS_URL && (
        <p className="quiz-error">
          Falta configurar NEXT_PUBLIC_BANCARD_CHECKOUT_JS_URL para mostrar el formulario de pago.
        </p>
      )}

      <div id={CONTAINER_ID} style={{ marginTop: '1.5rem' }} />
    </div>
  );
}
