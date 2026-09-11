import { useState } from "react";

import { decryptPack } from "../lib/crypto";
import { downloadPack } from "../lib/passPackApi";

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors duration-200 placeholder:text-slate-400 focus:border-violet-500 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-600";

const labelClass =
  "mb-2 block text-sm font-medium text-slate-600 transition-colors duration-300 dark:text-slate-300";

function SyncImportModal({ isOpen, onClose, onImport }) {
  // ========================================
  // PASOS: "form" (código + frase) -> "preview" (confirmar reemplazo)
  // ========================================
  // El paso intermedio evita que un click de más borre sin querer las
  // contraseñas que ya tenías cargadas en este dispositivo: primero se
  // descifra en memoria y se muestra cuántas entradas se encontraron,
  // recién ahí el usuario confirma el reemplazo.
  const [step, setStep] = useState("form");
  const [code, setCode] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pendingPasswords, setPendingPasswords] = useState(null);

  function resetForm() {
    setStep("form");
    setCode("");
    setPassphrase("");
    setShowPassphrase(false);
    setLoading(false);
    setError("");
    setPendingPasswords(null);
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setError("");
    try {
      const { data } = await downloadPack(code.trim());
      const decrypted = await decryptPack(data, passphrase);
      const parsed = JSON.parse(decrypted);

      if (!Array.isArray(parsed)) {
        throw new Error("El contenido del pack no es válido.");
      }

      setPendingPasswords(parsed);
      setStep("preview");
    } catch (err) {
      // No distinguimos entre "código inválido" y "frase incorrecta" en
      // la mayoría de los casos: dar esa pista de más facilitaría probar
      // combinaciones al tanteo.
      setError(err.message || "No se pudo importar el pack.");
    } finally {
      setLoading(false);
    }
  }

  function handleConfirmImport() {
    onImport(pendingPasswords);
    handleClose();
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
              {step === "form" ? "Importar contraseñas" : "Confirmar importación"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {step === "form"
                ? "Ingresá el código y la frase que usaste para sincronizar."
                : "Esto va a reemplazar las contraseñas de este dispositivo."}
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
            <div>
              <label htmlFor="import-code" className={labelClass}>
                Código
              </label>
              <input
                id="import-code"
                type="text"
                placeholder="Ej: VSM7A8Z2"
                value={code}
                onChange={(event) => setCode(event.target.value.toUpperCase())}
                required
                autoFocus
                autoCapitalize="characters"
                autoComplete="off"
                spellCheck={false}
                className={`${inputClass} font-mono tracking-widest`}
              />
            </div>

            <div>
              <label htmlFor="import-passphrase" className={labelClass}>
                Frase de seguridad
              </label>
              <div className="relative">
                <input
                  id="import-passphrase"
                  type={showPassphrase ? "text" : "password"}
                  value={passphrase}
                  onChange={(event) => setPassphrase(event.target.value)}
                  required
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
                {loading ? "Buscando…" : "Buscar pack"}
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-slate-700 transition-colors duration-300 dark:text-slate-200">
              Se encontraron{" "}
              <strong>
                {pendingPasswords.length} contraseña
                {pendingPasswords.length === 1 ? "" : "s"}
              </strong>{" "}
              en el pack. Si confirmás, van a reemplazar las que tenés
              cargadas ahora en este dispositivo.
            </div>

            <div className="mt-1 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setStep("form")}
                className="rounded-lg px-4 py-2 text-sm text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
              >
                Volver
              </button>
              <button
                type="button"
                onClick={handleConfirmImport}
                className="rounded-lg bg-violet-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-violet-500"
              >
                Reemplazar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SyncImportModal;
