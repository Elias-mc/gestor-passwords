import { useEffect, useMemo, useRef, useState } from 'react';
import { IconCopy, IconRefresh } from '../components/Icon/Navigation_icons';

const STRENGTH_LABEL = ['Muy débil', 'Débil', 'Aceptable', 'Fuerte', 'Muy fuerte'];

const STRENGTH_COLOR = [
  'bg-red-500',
  'bg-red-500',
  'bg-amber-500',
  'bg-emerald-500',
  'bg-emerald-500',
];

const CHAR_SETS = {
  mayusculas: 'ABCDEFGHJKLMNPQRSTUVWXYZ',
  minusculas: 'abcdefghijkmnopqrstuvwxyz',
  numeros: '23456789',
  simbolos: '!@#$%^&*()_-+=?',
};

const CLIPBOARD_CLEAR_MS = 25000;

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500';

// Clase compartida por los botones "cáscara" (borde + hover), igual que en
// el detalle de contraseña. Ya trae "transition" desde donde se usa.
const ghostButton = 'border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-900 ';

function passwordStrength(value) {
  if (!value) return 0;
  let score = 0;
  if (value.length >= 8) score++;
  if (value.length >= 14) score++;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score++;
  if (/\d/.test(value)) score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;
  return Math.min(score, 4);
}

// ========================================
// CHECKBOX PERSONALIZADO
// ========================================
// Componente chico para no repetir el mismo bloque 4 veces: label +
// checkbox + estado deshabilitado si es la última opción activa.
function OptionToggle({ label, checked, onChange, disabled }) {
  return (
    <label
      className={`flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-100 px-4 py-3 text-sm transition dark:border-white/10 dark:bg-black/20 ${
        disabled ? 'opacity-50' : 'cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5'
      }`}
    >
      <span className="text-slate-600 transition-colors duration-300 dark:text-slate-300">
        {label}
      </span>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className={`h-4 w-4 shrink-0 rounded border-slate-300 bg-transparent accent-violet-600 dark:border-white/20 ${focusRing}`}
      />
    </label>
  );
}

function WinGenerator() {
  const [length, setLength] = useState(16);
  const [useUpper, setUseUpper] = useState(true);
  const [useLower, setUseLower] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [generated, setGenerated] = useState('');
  const [copied, setCopied] = useState(false);
  const clipboardTimer = useRef(null);

  // Cuántas opciones de tipo de caracter están activas. Si solo queda
  // una prendida, la deshabilitamos para que el usuario no pueda apagar
  // todo y quedarse sin ningún set de caracteres para generar.
  const activeCount = [useUpper, useLower, useNumbers, useSymbols].filter(Boolean).length;

  const pool = useMemo(() => {
    let chars = '';
    if (useUpper) chars += CHAR_SETS.mayusculas;
    if (useLower) chars += CHAR_SETS.minusculas;
    if (useNumbers) chars += CHAR_SETS.numeros;
    if (useSymbols) chars += CHAR_SETS.simbolos;
    return chars;
  }, [useUpper, useLower, useNumbers, useSymbols]);

  function generate() {
    if (!pool) return;
    const values = new Uint32Array(length);
    window.crypto.getRandomValues(values);
    const result = Array.from(values, (v) => pool[v % pool.length]).join('');
    setGenerated(result);
    setCopied(false);
  }

  // Generamos una la primera vez y cada vez que cambian longitud u
  // opciones, para que la contraseña mostrada siempre respete la
  // configuración actual en vez de quedar desactualizada.
  useEffect(() => {
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [length, useUpper, useLower, useNumbers, useSymbols]);

  useEffect(() => () => clearTimeout(clipboardTimer.current), []);

  async function handleCopy() {
    if (!generated) return;
    await navigator.clipboard.writeText(generated);
    setCopied(true);
    clearTimeout(clipboardTimer.current);
    clipboardTimer.current = setTimeout(async () => {
      setCopied(false);
      try {
        const current = await navigator.clipboard.readText();
        if (current === generated) await navigator.clipboard.writeText('');
      } catch {
        // Sin permiso de lectura del portapapeles: lo dejamos como está.
      }
    }, CLIPBOARD_CLEAR_MS);
  }

  const strength = passwordStrength(generated);

  return (
    <main className="flex-1 overflow-y-auto bg-background transition-colors duration-300">
      <div className="mx-auto max-w-3xl p-8">
        <header className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-title transition-colors duration-300">
            Generador de contraseñas
          </h2>
          <p className="mt-2 text-sm text-title-secondary transition-colors duration-300">
            Personalizá el largo y los tipos de caracteres para crear una contraseña segura.
          </p>
        </header>

        {/* RESULTADO */}
        <section className="rounded-2xl border border-background-secundary bg-background-secundary p-6 transition-colors duration-300 ">
          <h3 className="mb-3 text-sm font-medium text-text transition-colors duration-300 ">
            Contraseña generada
          </h3>

          <div className="flex items-center gap-3">
            <div className="flex min-h-11 flex-1 items-center overflow-x-auto rounded-lg border border-background bg-background px-4 transition-colors duration-300 ">
              <span className="whitespace-nowrap break-all text-base tracking-wide text-text transition-colors duration-300 ">
                {generated || 'Elegí al menos una opción'}
              </span>
            </div>

            <button
              type="button"
              onClick={generate}
              disabled={!pool}
              title="Generar otra"
              aria-label="Generar otra contraseña"
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border transition disabled:cursor-not-allowed disabled:opacity-40 ${ghostButton} ${focusRing}`}
            >
              <IconRefresh />
            </button>

            <button
              type="button"
              onClick={handleCopy}
              disabled={!generated}
              title="Copiar contraseña"
              aria-label="Copiar contraseña"
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border transition disabled:cursor-not-allowed disabled:opacity-40 ${ghostButton} ${focusRing}`}
            >
              {copied ? (
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  ✓
                </span>
              ) : (
                <IconCopy />
              )}
            </button>
          </div>

          {copied && (
            <p className="mt-2 text-xs text-slate-500">
              Copiada. Se borra sola del portapapeles en {CLIPBOARD_CLEAR_MS / 1000} segundos.
            </p>
          )}

          {generated && (
            <div className="mt-4">
              <div className="flex h-1.5 gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-full transition-colors duration-300 ${
                      i < strength ? STRENGTH_COLOR[strength] : 'bg-slate-200 dark:bg-white/10'
                    }`}
                  />
                ))}
              </div>
              <p className="mt-1.5 text-xs text-slate-500">{STRENGTH_LABEL[strength]}</p>
            </div>
          )}
        </section>

        {/* LONGITUD */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 transition-colors duration-300 dark:border-white/10 dark:bg-[#0b1220]">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-medium text-slate-500 transition-colors duration-300 dark:text-slate-400">
              Longitud
            </h3>
            <span className="rounded-full bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-600 transition-colors duration-300 dark:text-violet-400">
              {length} caracteres
            </span>
          </div>

          <input
            type="range"
            min={8}
            max={64}
            step={1}
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className={`w-full accent-violet-600 ${focusRing}`}
          />

          <div className="mt-1 flex justify-between text-xs text-slate-400 transition-colors duration-300 dark:text-slate-600">
            <span>8</span>
            <span>64</span>
          </div>
        </section>

        {/* TIPOS DE CARACTERES */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 transition-colors duration-300 dark:border-white/10 dark:bg-[#0b1220]">
          <h3 className="mb-3 text-sm font-medium text-slate-500 transition-colors duration-300 dark:text-slate-400">
            Tipos de caracteres
          </h3>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <OptionToggle
              label="Mayúsculas (A-Z)"
              checked={useUpper}
              onChange={setUseUpper}
              disabled={useUpper && activeCount === 1}
            />
            <OptionToggle
              label="Minúsculas (a-z)"
              checked={useLower}
              onChange={setUseLower}
              disabled={useLower && activeCount === 1}
            />
            <OptionToggle
              label="Números (0-9)"
              checked={useNumbers}
              onChange={setUseNumbers}
              disabled={useNumbers && activeCount === 1}
            />
            <OptionToggle
              label="Símbolos (!@#$...)"
              checked={useSymbols}
              onChange={setUseSymbols}
              disabled={useSymbols && activeCount === 1}
            />
          </div>

          {!pool && (
            <p
              className="mt-3 text-xs text-red-600 transition-colors duration-300 dark:text-red-400"
              aria-live="polite"
            >
              Activá al menos un tipo de caracter para poder generar.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}

export default WinGenerator;
