import { useState } from "react";

import { encryptPack } from "../lib/crypto";
import { uploadPack } from "../lib/passPackApi";

const MIN_PASSPHRASE_LENGTH = 8;

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors duration-200 placeholder:text-slate-400 focus:border-violet-500 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-600";

const labelClass =
  "mb-2 block text-sm font-medium text-slate-600 transition-colors duration-300 dark:text-slate-300";

function formatExpiry(isoString) {
  return new Date(isoString).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function SyncExportModal({ isOpen, onClose, passwords }) {
  // ========================================
  // PASOS: "form" (pedir frase) -> "result" (mostrar código)
  // ========================================
  const [step, setStep] = useState("form");
  const [passphrase, setPassphrase] = useState("");
  const [confirmPassphrase, setConfirmPassphrase] = useState("");
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null); // { code, expiresAt }
  const [copied, setCopied] = useState(false);

  function resetForm() {
    setStep("form");
    setPassphrase("");
    setConfirmPassphrase("");
    setShowPassphrase(false);
    setLoading(false);
    setError("");
    setResult(null);
    setCopied(false);
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (passphrase.length < MIN_PASSPHRASE_LENGTH) {
      setError(`La frase tiene que tener al menos ${MIN_PASSPHRASE_LENGTH} caracteres.`);
      return;
    }
    if (passphrase !== confirmPassphrase) {
      setError("Las frases no coinciden.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const blob = await encryptPack(JSON.stringify(passwords), passphrase);
      const { code, expires_at } = await uploadPack(blob);
      setResult({ code, expiresAt: expires_at });
      setStep("result");
    } catch {
      setError("No se pudo subir el pack. Revisá tu conexión y probá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopyCode() {
    if (!result) return;
    await navigator.clipboard.writeText(result.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
    >
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl transition-colors duration-300 dark:border-white/10 dark:bg-[#0b1220]">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 transition-colors duration-300 dark:text-white">
              {step === "form" ? "Sincronizar contraseñas" : "Código listo"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {step === "form"
                ? `Vas a poder usarlas en otra computadora durante 30 días.`
                : "Usalo en la otra computadora antes de que venza."}
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="text-2xl text-slate-400 transition hover:text-slate-900 dark:text-slate-500 dark:hover:text-white"
          >
            ×
          </button>
        </div>

        {step === "form" ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="rounded-lg border border-violet-500/20 bg-violet-500/5 p-3 text-xs text-slate-600 transition-colors duration-300 dark:text-slate-400">
              Vamos a cifrar tus {passwords.length} contraseña
              {passwords.length === 1 ? "" : "s"} con esta frase antes de
              subirlas. Nadie puede leerlas sin ella — ni siquiera nosotros,
              así que si te la olvidás, no hay forma de recuperarlas.
            </div>

            <div>
              <label htmlFor="export-passphrase" className={labelClass}>
                Frase de seguridad
              </label>
              <div className="relative">
                <input
                  id="export-passphrase"
                  type={showPassphrase ? "text" : "password"}
                  placeholder="Mínimo 8 caracteres"
                  value={passphrase}
                  onChange={(event) => setPassphrase(event.target.value)}
                  required
                  autoFocus
                  className={`${inputClass} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassphrase((current) => !current)}
                  title={showPassphrase ? "Ocultar" : "Mostrar"}
                  aria-label={showPassphrase ? "Ocultar frase" : "Mostrar frase"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-900 dark:text-slate-500 dark:hover:text-white"
                >
                  {showPassphrase ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="export-passphrase-confirm" className={labelClass}>
                Repetí la frase
              </label>
              <input
                id="export-passphrase-confirm"
                type={showPassphrase ? "text" : "password"}
                value={confirmPassphrase}
                onChange={(event) => setConfirmPassphrase(event.target.value)}
                required
                className={inputClass}
              />
            </div>

            {error && (
              <p
                className="text-sm text-red-600 transition-colors duration-300 dark:text-red-400"
                aria-live="polite"
              >
                {error}
              </p>
            )}

            <div className="mt-1 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg px-4 py-2 text-sm text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-violet-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:opacity-60"
              >
                {loading ? "Subiendo…" : "Generar código"}
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-100 px-4 py-3 text-center transition-colors duration-300 dark:border-white/10 dark:bg-black/20">
                <span className="break-all font-mono text-2xl tracking-[0.15em] text-slate-900 transition-colors duration-300 dark:text-white">
                  {result.code}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyCode}
                title="Copiar código"
                aria-label="Copiar código"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
              >
                {copied ? "✓" : "⧉"}
              </button>
            </div>

            <p className="text-sm text-slate-500 transition-colors duration-300 dark:text-slate-400">
              Vence el <strong>{formatExpiry(result.expiresAt)}</strong>. En la
              otra computadora vas a necesitar este código{" "}
              <strong>y</strong> la frase de seguridad que elegiste — anotalos
              en un lugar seguro, distinto entre sí.
            </p>

            <div className="mt-1 flex justify-end">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg bg-violet-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-violet-500"
              >
                Listo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SyncExportModal;
