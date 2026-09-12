import { useEffect, useRef, useState } from 'react';

const CATEGORIES = [
  'Desarrollo',
  'Redes Sociales',
  'Trabajo',
  'Estudios',
  'Finanzas',
  'Entretenimiento',
  'Juegos',
  'Compras',
  'Otros',
];

const CLIPBOARD_CLEAR_MS = 25000;

const STRENGTH_LABEL = ['Muy débil', 'Débil', 'Aceptable', 'Fuerte', 'Muy fuerte'];

const STRENGTH_COLOR = ['bg-danger', 'bg-danger', 'bg-warning', 'bg-success', 'bg-success'];

function formFrom(password) {
  return {
    name: password?.name || '',
    categoria: password?.categoria || '',
    correo: password?.correo || '',
    contrasena: password?.contrasena || '',
    url: password?.url || '',
    icono: password?.icono || '',
  };
}

function normalizeUrl(value) {
  if (!value) return '';

  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function generatePassword(length = 16) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*';

  const values = new Uint32Array(length);

  window.crypto.getRandomValues(values);

  return Array.from(values, (value) => chars[value % chars.length]).join('');
}

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

function CopyIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      viewBox="0 0 16 16"
      aria-hidden="true"
    >
      <path d="M0 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2H2a2 2 0 0 1-2-2zm5 10v2a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-2v5a2 2 0 0 1-2 2z" />
    </svg>
  );
}

function EyeIcon({ hidden = false }) {
  if (hidden) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="17"
        height="17"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 3l18 18M10.58 10.58a2 2 0 102.83 2.83M9.88 4.24A10.45 10.45 0 0112 4c5.5 0 9.5 4 10.5 8a11.5 11.5 0 01-3.07 4.83M6.61 6.61C4.85 7.75 3.64 9.42 1.5 12c1 4 5 8 10.5 8 1.17 0 2.26-.18 3.25-.5"
        />
      </svg>
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="17"
      height="17"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"
      />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}

function StarIcon({ filled = false }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3.5l2.63 5.33 5.88.85-4.25 4.14 1 5.85L12 16.9l-5.26 2.77 1-5.85-4.25-4.14 5.88-.85L12 3.5z"
      />
    </svg>
  );
}

function WinModulePassword({ password, onBack, onEdit, onDelete }) {
  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(() => formFrom(password));
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [copied, setCopied] = useState(null);

  const clipboardTimer = useRef(null);

  useEffect(() => {
    setForm(formFrom(password));
    setIsEditing(false);
    setShowPassword(false);
    setConfirmingDelete(false);
    setSaveError('');
    setCopied(null);
  }, [password?.id]);

  useEffect(() => {
    return () => clearTimeout(clipboardTimer.current);
  }, []);

  if (!password) {
    return (
      <main className="flex min-h-0 flex-1 items-center justify-center bg-background px-6 transition-colors duration-300">
        <div className="max-w-sm text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-background-secundary text-2xl">
            🔐
          </div>

          <h2 className="text-xl font-semibold text-title">
            No hay ninguna contraseña seleccionada
          </h2>

          <p className="mt-2 text-sm leading-6 text-text-secondary">
            Seleccioná una contraseña para ver sus datos.
          </p>
        </div>
      </main>
    );
  }

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleStartEdit() {
    setForm(formFrom(password));
    setSaveError('');
    setIsEditing(true);
  }

  function handleCancelEdit() {
    setForm(formFrom(password));
    setSaveError('');
    setIsEditing(false);
  }

  async function handleSave(event) {
    event?.preventDefault();

    if (!form.name.trim()) {
      setSaveError('Ponéle un nombre a la cuenta antes de guardar.');
      return;
    }

    setSaving(true);
    setSaveError('');

    try {
      await onEdit({
        ...password,
        name: form.name.trim(),
        categoria: form.categoria,
        correo: form.correo.trim(),
        contrasena: form.contrasena,
        url: normalizeUrl(form.url.trim()),
        icono: form.icono.trim(),
      });

      setIsEditing(false);
    } catch {
      setSaveError('No se pudo guardar. Probá de nuevo.');
    } finally {
      setSaving(false);
    }
  }

  function handleGenerate() {
    updateField('contrasena', generatePassword());
    setShowPassword(true);
  }

  function toggleFavorite() {
    onEdit({
      ...password,
      favorito: !password.favorito,
    });
  }

  async function copyValue(field, value) {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);

      setCopied(field);

      clearTimeout(clipboardTimer.current);

      clipboardTimer.current = setTimeout(async () => {
        setCopied(null);

        try {
          const current = await navigator.clipboard.readText();

          if (current === value) {
            await navigator.clipboard.writeText('');
          }
        } catch {
          // Algunos navegadores bloquean la lectura del portapapeles.
        }
      }, CLIPBOARD_CLEAR_MS);
    } catch {
      setSaveError('No se pudo copiar al portapapeles.');
    }
  }

  const strength = passwordStrength(form.contrasena);

  const inputClass =
    'w-full rounded-xl border border-button-border bg-background px-4 py-3 text-sm text-text outline-none transition-all duration-200 placeholder:text-text-secondary focus:border-button focus:ring-2 focus:ring-button/15';

  const ghostButton =
    'border-border bg-transparent text-text-secondary hover:border-button-border-hover hover:bg-button-secundary hover:text-text';

  const focusRing =
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-button focus-visible:ring-offset-2 focus-visible:ring-offset-background-secundary';

  return (
    <main className="min-h-0 flex-1 overflow-y-auto bg-background transition-colors duration-300">
      <div className="mx-auto w-full max-w-5xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
        {/* Navegación */}
        <button
          type="button"
          onClick={onBack}
          className={`mb-6 inline-flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-medium transition-all duration-200 sm:mb-8 ${ghostButton} ${focusRing}`}
        >
          <ArrowLeftIcon />
          <span>Volver</span>
        </button>

        {/* Cabecera */}
        <header className="mb-6 flex flex-col gap-5 sm:mb-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-center gap-4 sm:gap-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-background-secundary sm:h-16 sm:w-16">
              {isEditing ? (
                <input
                  type="url"
                  value={form.icono}
                  onChange={(event) => updateField('icono', event.target.value)}
                  placeholder="URL"
                  aria-label="URL del icono"
                  className="w-full bg-transparent px-2 text-center text-xs text-text outline-none placeholder:text-text-secondary"
                />
              ) : password.icono ? (
                <img
                  src={password.icono}
                  alt=""
                  className="h-10 w-10 object-contain sm:h-11 sm:w-11"
                />
              ) : (
                <span className="text-2xl">🔐</span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) => updateField('name', event.target.value)}
                  aria-label="Nombre de la cuenta"
                  className={`${inputClass} max-w-md px-3 py-2.5 text-xl font-bold sm:text-2xl`}
                />
              ) : (
                <h1 className="break-words text-2xl font-bold tracking-tight text-title sm:text-3xl">
                  {password.name}
                </h1>
              )}

              {isEditing ? (
                <select
                  value={form.categoria}
                  onChange={(event) => updateField('categoria', event.target.value)}
                  aria-label="Categoría"
                  className={`${inputClass} mt-2 max-w-xs cursor-pointer py-2.5`}
                >
                  <option value="">Seleccioná una categoría</option>

                  {CATEGORIES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="mt-2 inline-flex rounded-full border border-button-border bg-button-secundary px-3 py-1 text-xs font-medium text-textButton-secundary">
                  {password.categoria || 'Sin categoría'}
                </span>
              )}
            </div>
          </div>

          {!isEditing && (
            <button
              type="button"
              onClick={toggleFavorite}
              title={password.favorito ? 'Quitar de favoritos' : 'Marcar como favorito'}
              aria-label={password.favorito ? 'Quitar de favoritos' : 'Marcar como favorito'}
              aria-pressed={Boolean(password.favorito)}
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-all duration-200 ${
                password.favorito ? 'border-button bg-button text-textButton' : ghostButton
              } ${focusRing}`}
            >
              <StarIcon filled={Boolean(password.favorito)} />
            </button>
          )}
        </header>

        {/* Información */}
        <section className="overflow-hidden rounded-2xl border border-border bg-background-secundary shadow-sm transition-colors duration-300">
          {/* Correo */}
          <div className="border-b border-border p-5 sm:p-6">
            <h2 className="text-sm font-medium text-text-secondary">Usuario o correo</h2>

            {isEditing ? (
              <input
                type="text"
                value={form.correo}
                onChange={(event) => updateField('correo', event.target.value)}
                placeholder="usuario@example.com"
                autoComplete="username"
                className={`${inputClass} mt-3`}
              />
            ) : (
              <div className="mt-3 flex items-center gap-3">
                <span className="min-w-0 flex-1 break-all text-sm text-text">
                  {password.correo || <span className="text-text-secondary">No especificado</span>}
                </span>

                {password.correo && (
                  <button
                    type="button"
                    onClick={() => copyValue('correo', password.correo)}
                    title="Copiar usuario o correo"
                    aria-label="Copiar usuario o correo"
                    className={`flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border px-3 transition-all duration-200 ${ghostButton} ${focusRing}`}
                  >
                    {copied === 'correo' ? (
                      <span className="text-xs font-medium text-text">Copiado</span>
                    ) : (
                      <CopyIcon />
                    )}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Contraseña */}
          <div className="border-b border-border p-5 sm:p-6">
            <h2 className="mb-3 text-sm font-medium text-text-secondary">Contraseña</h2>

            {isEditing ? (
              <>
                <div className="flex flex-col gap-2.5 sm:flex-row">
                  <div className="flex min-w-0 flex-1 gap-2.5">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={form.contrasena}
                      onChange={(event) => updateField('contrasena', event.target.value)}
                      autoComplete="new-password"
                      className={`${inputClass} min-h-11`}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${ghostButton} ${focusRing}`}
                    >
                      <EyeIcon hidden={showPassword} />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleGenerate}
                    className={`min-h-11 rounded-xl border px-4 text-sm font-medium transition-all duration-200 ${ghostButton} ${focusRing}`}
                  >
                    Generar
                  </button>
                </div>

                {form.contrasena && (
                  <div className="mt-4">
                    <div className="flex h-1.5 gap-1">
                      {[0, 1, 2, 3].map((index) => (
                        <div
                          key={index}
                          className={`flex-1 rounded-full transition-colors duration-300 ${
                            index < strength ? STRENGTH_COLOR[strength] : 'bg-border'
                          }`}
                        />
                      ))}
                    </div>

                    <p className="mt-2 text-xs text-text-secondary">
                      Seguridad:{' '}
                      <span className="font-medium text-text">{STRENGTH_LABEL[strength]}</span>
                    </p>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="flex items-center gap-2.5">
                  <div className="flex min-h-11 min-w-0 flex-1 items-center overflow-hidden rounded-xl border border-border bg-background px-4">
                    {showPassword ? (
                      <span className="break-all text-sm text-text">{password.contrasena}</span>
                    ) : (
                      <span className="truncate text-sm tracking-[0.3em] text-text-secondary">
                        ••••••••••••
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    onClick={() => setShowPassword((current) => !current)}
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${ghostButton} ${focusRing}`}
                  >
                    <EyeIcon hidden={showPassword} />
                  </button>

                  <button
                    type="button"
                    onClick={() => copyValue('contrasena', password.contrasena)}
                    title="Copiar contraseña"
                    aria-label="Copiar contraseña"
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${ghostButton} ${focusRing}`}
                  >
                    {copied === 'contrasena' ? (
                      <span className="text-sm font-semibold text-text">✓</span>
                    ) : (
                      <CopyIcon />
                    )}
                  </button>
                </div>

                {copied === 'contrasena' && (
                  <p className="mt-2 text-xs leading-5 text-text-secondary">
                    Copiada. Se borra sola del portapapeles en {CLIPBOARD_CLEAR_MS / 1000} segundos.
                  </p>
                )}
              </>
            )}
          </div>

          {/* URL */}
          <div className="p-5 sm:p-6">
            <h2 className="mb-3 text-sm font-medium text-text-secondary">Sitio web</h2>

            {isEditing ? (
              <input
                type="url"
                value={form.url}
                onChange={(event) => updateField('url', event.target.value)}
                placeholder="https://github.com"
                autoComplete="url"
                className={inputClass}
              />
            ) : password.url ? (
              <a
                href={password.url}
                target="_blank"
                rel="noreferrer"
                className={`inline-block max-w-full break-all rounded text-sm font-medium text-text underline-offset-4 transition hover:text-title hover:underline ${focusRing}`}
              >
                {password.url}
              </a>
            ) : (
              <span className="text-sm text-text-secondary">No especificada</span>
            )}
          </div>
        </section>

        {/* Error */}
        {saveError && (
          <div
            className="mt-4 rounded-xl border border-danger bg-danger/10 px-4 py-3 text-sm text-danger"
            aria-live="polite"
          >
            {saveError}
          </div>
        )}

        {/* Acciones */}
        <div className="mt-5 flex flex-col gap-3 sm:mt-6 sm:flex-row sm:items-center sm:justify-end">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={saving}
                className={`order-2 rounded-xl border px-5 py-2.5 text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 sm:order-1 ${ghostButton} ${focusRing}`}
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className={`order-1 rounded-xl bg-button px-5 py-2.5 text-sm font-semibold text-textButton shadow-sm transition-all duration-200 hover:bg-button-hover disabled:cursor-not-allowed disabled:opacity-60 sm:order-2 ${focusRing}`}
              >
                {saving ? 'Guardando…' : 'Guardar cambios'}
              </button>
            </>
          ) : confirmingDelete ? (
            <>
              <div className="mr-auto text-sm text-text-secondary">¿Eliminar esta contraseña?</div>

              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                className={`rounded-xl border px-5 py-2.5 text-sm font-medium transition-all duration-200 ${ghostButton} ${focusRing}`}
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={() => onDelete(password.id)}
                className={`rounded-xl bg-danger px-5 py-2.5 text-sm font-semibold text-danger-foreground transition-all duration-200 hover:bg-danger-hover ${focusRing}`}
              >
                Sí, eliminar
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleStartEdit}
                className={`rounded-xl border px-5 py-2.5 text-sm font-medium transition-all duration-200 ${ghostButton} ${focusRing}`}
              >
                Editar
              </button>

              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                className={`rounded-xl border border-danger bg-danger/10 px-5 py-2.5 text-sm font-medium text-danger transition-all duration-200 hover:bg-danger hover:text-danger-foreground ${focusRing}`}
              >
                Eliminar
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

export default WinModulePassword;
