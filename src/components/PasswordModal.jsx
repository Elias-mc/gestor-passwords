import { useState } from 'react';
import { IconLock, IconEyeFill, IconEyeSlashFill } from './Icon/Navigation_icons';

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

const MAX_ICON_FILE_BYTES = 1.5 * 1024 * 1024;

const inputClass =
  'w-full rounded-xl border border-button-border bg-background px-3.5 py-3 text-sm text-text outline-none transition-all duration-200 placeholder:text-text-secondary focus:border-button focus:ring-2 focus:ring-button/15';

const labelClass = 'mb-1.5 block text-sm font-medium text-text';

const optionalClass = 'ml-1 font-normal text-text-secondary';

function normalizeUrl(value) {
  if (!value) return '';

  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);

    reader.readAsDataURL(file);
  });
}

function PasswordModal({ isOpen, onClose, onAddPassword }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [url, setUrl] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [iconMode, setIconMode] = useState('link');
  const [icon, setIcon] = useState('');
  const [iconError, setIconError] = useState('');
  const [fileInputKey, setFileInputKey] = useState(0);

  function resetForm() {
    setName('');
    setCategory('');
    setCorreo('');
    setPassword('');
    setUrl('');
    setShowPassword(false);

    setIconMode('link');
    setIcon('');
    setIconError('');

    setFileInputKey((current) => current + 1);
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function handleIconModeChange(mode) {
    setIconMode(mode);
    setIcon('');
    setIconError('');
    setFileInputKey((current) => current + 1);
  }

  async function handleIconFile(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setIconError('Elegí un archivo de imagen.');
      return;
    }

    if (file.size > MAX_ICON_FILE_BYTES) {
      setIconError('La imagen pesa demasiado (máximo 1.5 MB).');
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);

      setIcon(dataUrl);
      setIconError('');
    } catch {
      setIconError('No se pudo leer el archivo. Probá con otro.');
    }
  }

  function handleSubmit(event) {
    event.preventDefault();

    const newPassword = {
      id: Date.now(),
      name: name.trim(),
      categoria: category,
      correo: correo.trim(),
      contrasena: password,
      url: normalizeUrl(url.trim()),
      icono: icon,
      favorito: false,
    };

    onAddPassword(newPassword);
    handleClose();
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex min-h-screen items-center justify-center bg-black/60 p-3 backdrop-blur-[2px] sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
    >
      <div className="flex max-h-[calc(100vh-1.5rem)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-background-secundary shadow-2xl transition-colors duration-300 sm:max-h-[90vh]">
        <div className="shrink-0 border-b border-border px-5 py-4 sm:px-6 sm:py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-title sm:text-xl">Agregar contraseña</h2>

              <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                Guardá una nueva cuenta de forma rápida y segura.
              </p>
            </div>

            <button
              type="button"
              onClick={handleClose}
              aria-label="Cerrar"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-2xl leading-none text-text-secondary transition-colors duration-200 hover:bg-button-secundary hover:text-text focus:outline-none focus:ring-2 focus:ring-button/30"
            >
              ×
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
          <form id="password-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
            <section>
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-title">Información de la cuenta</h3>

                <p className="mt-0.5 text-xs text-text-secondary">
                  Identificá fácilmente esta contraseña.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Nombre */}
                <div className="sm:col-span-2">
                  <label htmlFor="password-name" className={labelClass}>
                    Nombre
                  </label>

                  <input
                    id="password-name"
                    type="text"
                    placeholder="Ej: GitHub"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                    autoFocus
                    autoComplete="off"
                    className={inputClass}
                  />
                </div>

                {/* Categoría */}
                <div className="sm:col-span-2">
                  <label htmlFor="password-category" className={labelClass}>
                    Categoría
                  </label>

                  <select
                    id="password-category"
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    required
                    className={`${inputClass} cursor-pointer`}
                  >
                    <option value="" disabled className="bg-background text-text">
                      Seleccioná una categoría
                    </option>

                    {CATEGORIES.map((item) => (
                      <option key={item} value={item} className="bg-background text-text">
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            <section>
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-title">Datos de acceso</h3>

                <p className="mt-0.5 text-xs text-text-secondary">
                  Podés dejar el usuario vacío si no lo necesitás.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Usuario / correo */}
                <div className="sm:col-span-2">
                  <label htmlFor="password-correo" className={labelClass}>
                    Usuario o correo
                    <span className={optionalClass}>(opcional)</span>
                  </label>

                  <input
                    id="password-correo"
                    type="text"
                    placeholder="usuario@example.com"
                    value={correo}
                    onChange={(event) => setCorreo(event.target.value)}
                    autoComplete="username"
                    className={inputClass}
                  />
                </div>

                {/* Contraseña */}
                <div className="sm:col-span-2">
                  <label htmlFor="password-value" className={labelClass}>
                    Contraseña
                  </label>

                  <div className="relative">
                    <input
                      id="password-value"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Ingresá tu contraseña"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                      autoComplete="new-password"
                      className={`${inputClass} pr-12`}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-text-secondary transition-colors duration-200 hover:bg-button-secundary hover:text-text focus:outline-none focus:ring-2 focus:ring-button/30"
                    >
                      {showPassword ? <IconEyeSlashFill /> : <IconEyeFill />}
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-title">Sitio web</h3>

                <p className="mt-0.5 text-xs text-text-secondary">
                  El enlace te permitirá acceder rápidamente al sitio.
                </p>
              </div>

              <label htmlFor="password-url" className={labelClass}>
                Link de la página
                <span className={optionalClass}>(opcional)</span>
              </label>

              <input
                id="password-url"
                type="text"
                inputMode="url"
                placeholder="github.com"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                autoComplete="url"
                className={inputClass}
              />
            </section>

            <section>
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-title">
                  Icono
                  <span className={optionalClass}>(opcional)</span>
                </h3>

                <p className="mt-0.5 text-xs text-text-secondary">
                  Usá una imagen para reconocer la cuenta más fácilmente.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-background p-3 transition-colors duration-300">
                {/* Selector de modo */}
                <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                  {/* Preview */}
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-background-secundary">
                    {icon ? (
                      <img src={icon} alt="" className="h-9 w-9 object-contain" />
                    ) : (
                      <span className="text-xl">
                        <IconLock />
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-text">Elegí cómo agregarlo</p>

                    <p className="mt-0.5 text-xs text-text-secondary">
                      Podés usar un enlace o subir una imagen.
                    </p>
                  </div>
                </div>

                {/* Tabs */}
                <div className="grid grid-cols-2 gap-1 rounded-lg border border-border bg-background-secundary p-1">
                  <button
                    type="button"
                    onClick={() => handleIconModeChange('link')}
                    className={`min-h-10 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-button/30 ${
                      iconMode === 'link'
                        ? 'bg-button text-textButton hover:bg-button-hover'
                        : 'text-text-secondary hover:bg-button-secundary hover:text-text'
                    }`}
                  >
                    Enlace
                  </button>

                  <button
                    type="button"
                    onClick={() => handleIconModeChange('file')}
                    className={`min-h-10 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-button/30 ${
                      iconMode === 'file'
                        ? 'bg-button text-textButton hover:bg-button-hover'
                        : 'text-text-secondary hover:bg-button-secundary hover:text-text'
                    }`}
                  >
                    Subir imagen
                  </button>
                </div>

                {/* Input */}
                <div className="mt-3">
                  {iconMode === 'link' ? (
                    <input
                      type="url"
                      inputMode="url"
                      placeholder="https://ejemplo.com/icon.png"
                      value={icon}
                      onChange={(event) => setIcon(event.target.value)}
                      className={inputClass}
                    />
                  ) : (
                    <input
                      key={fileInputKey}
                      type="file"
                      accept="image/*"
                      onChange={handleIconFile}
                      className="block min-h-11 w-full cursor-pointer rounded-xl border border-button-border bg-background text-sm text-text-secondary transition-colors duration-200 file:mr-3 file:cursor-pointer file:border-0 file:bg-button file:px-4 file:py-3 file:text-xs file:font-semibold file:text-textButton hover:file:bg-button-hover"
                    />
                  )}
                </div>

                {iconMode === 'file' && !iconError && (
                  <p className="mt-2 text-xs text-text-secondary">
                    PNG, JPG, WEBP u otra imagen compatible. Máximo 1.5 MB.
                  </p>
                )}

                {iconError && (
                  <p className="mt-2 text-xs text-button-hover" aria-live="polite">
                    {iconError}
                  </p>
                )}
              </div>
            </section>
          </form>
        </div>

        <div className="shrink-0 border-t border-border bg-background-secundary px-5 py-4 sm:px-6">
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="min-h-11 rounded-xl border border-button-secundary bg-button-secundary px-5 py-2.5 text-sm font-medium text-textButton-secundary transition-colors duration-200 hover:bg-button-secundary-hover focus:outline-none focus:ring-2 focus:ring-button/30 sm:min-w-24"
            >
              Cancelar
            </button>

            <button
              type="submit"
              form="password-form"
              className="min-h-11 rounded-xl border border-button-border bg-button px-5 py-2.5 text-sm font-semibold text-textButton transition-colors duration-200 hover:bg-button-hover focus:outline-none focus:ring-2 focus:ring-button/30 sm:min-w-28"
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PasswordModal;
