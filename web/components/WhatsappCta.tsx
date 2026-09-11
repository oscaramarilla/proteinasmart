import { whatsappUrl } from "../lib/negocio";

type Props = {
  /** Mensaje contextual. Nunca debe incluir datos clínicos ni de contacto. */
  message: string;
  label: string;
  variant?: "primary" | "secondary";
  hint?: string;
};

const styles = {
  primary: "bg-emerald-800 text-white hover:bg-emerald-900",
  secondary: "border border-emerald-800 text-emerald-900 hover:bg-emerald-50",
} as const;

export default function WhatsappCta({ message, label, variant = "primary", hint }: Props) {
  return (
    <span className="inline-flex flex-col gap-1">
      <a
        href={whatsappUrl(message)}
        target="_blank"
        rel="noreferrer"
        className={`inline-flex items-center justify-center rounded-xl px-5 py-3 font-semibold transition ${styles[variant]}`}
      >
        {label}
      </a>
      {hint ? <span className="text-sm text-slate-500">{hint}</span> : null}
    </span>
  );
}
