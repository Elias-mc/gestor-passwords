import { useState } from 'react';

import { decryptPack } from '../lib/crypto';
import { downloadPack } from '../lib/passPackApi';

const inputClass =
  'w-full rounded-lg border border-button-hover bg-background px-3 py-2.5 text-sm text-text outline-none transition-colors duration-200 placeholder:text-text-secondary focus:border-button';

const labelClass =
  'mb-2 block text-sm font-medium text-text-secondary transition-colors duration-300';

function SyncImportModal({ isOpen, onClose, onImport }) {
  const [step, setStep] = useState('form');
  const [code, setCode] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pendingPasswords, setPendingPasswords] = useState(null);

  function resetForm() {
    setStep('form');
    setCode('');
    setPassphrase('');
    setShowPassphrase(false);
    setLoading(false);
    setError('');
    setPendingPasswords(null);
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setError('');

    try {
      const { data } = await downloadPack(code.trim());
      const decrypted = await decryptPack(data, passphrase);
      const parsed = JSON.parse(decrypted);

      if (!Array.isArray(parsed)) {
        throw new Error('El contenido del pack no es válido.');
      }

      setPendingPasswords(parsed);
      setStep('preview');
    } catch (err) {
      setError(err.message || 'No se pudo importar el pack.');
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
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-border bg-background-secundary p-6 shadow-2xl transition-colors duration-300">
        {/* Encabezado */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-title transition-colors duration-300">
              {step === 'form' ? 'Importar contraseñas' : 'Confirmar importación'}
            </h2>

            <p className="mt-1 text-sm text-text-secondary transition-colors duration-300">
              {step === 'form'
                ? 'Ingresá el código y la frase que usaste para sincronizar.'
                : 'Esto va a reemplazar las contraseñas de este dispositivo.'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Cerrar"
            className="text-2xl text-text-secondary transition-colors duration-200 hover:text-text"
          >
            ×
          </button>
        </div>

        {step === 'form' ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Código */}
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

            {/* Frase */}
            <div>
              <label htmlFor="import-passphrase" className={labelClass}>
                Frase de seguridad
              </label>

              <div className="relative">
                <input
                  id="import-passphrase"
                  type={showPassphrase ? 'text' : 'password'}
                  value={passphrase}
                  onChange={(event) => setPassphrase(event.target.value)}
                  required
                  className={`${inputClass} pr-12`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassphrase((current) => !current)}
                  title={showPassphrase ? 'Ocultar' : 'Mostrar'}
                  aria-label={showPassphrase ? 'Ocultar frase' : 'Mostrar frase'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary transition-colors duration-200 hover:text-text"
                >
                  {showPassphrase ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p
                className="text-sm text-button-hover transition-colors duration-300"
                aria-live="polite"
              >
                {error}
              </p>
            )}

            {/* Botones */}
            <div className="mt-1 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg border border-button-secundary bg-button-secundary px-4 py-2 text-sm text-textButton-secundary transition-colors duration-200 hover:bg-button-secundary-hover"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={loading}
                className="rounded-lg border border-button bg-button px-5 py-2 text-sm font-semibold text-textButton transition-colors duration-200 hover:bg-button-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Buscando…' : 'Buscar pack'}
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Aviso */}
            <div className="rounded-lg border border-button-hover bg-button-secundary p-4 text-sm text-text transition-colors duration-300">
              Se encontraron{' '}
              <strong className="text-title">
                {pendingPasswords.length} contraseña
                {pendingPasswords.length === 1 ? '' : 's'}
              </strong>{' '}
              en el pack. Si confirmás, van a reemplazar las que tenés cargadas ahora en este
              dispositivo.
            </div>

            {/* Botones */}
            <div className="mt-1 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setStep('form')}
                className="rounded-lg border border-button-secundary bg-button-secundary px-4 py-2 text-sm text-textButton-secundary transition-colors duration-200 hover:bg-button-secundary-hover"
              >
                Volver
              </button>

              <button
                type="button"
                onClick={handleConfirmImport}
                className="rounded-lg border border-button bg-button px-5 py-2 text-sm font-semibold text-textButton transition-colors duration-200 hover:bg-button-hover"
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
