import { useState } from "react";

const CATEGORIES = [
  "Desarrollo",
  "Redes Sociales",
  "Trabajo",
  "Estudios",
  "Finanzas",
  "Entretenimiento",
  "Juegos",
  "Compras",
  "Otros",
];

const MAX_ICON_FILE_BYTES = 1.5 * 1024 * 1024; // 1.5 MB

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors duration-200 placeholder:text-slate-400 focus:border-violet-500 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-600";

const labelClass =
  "mb-2 block text-sm font-medium text-slate-600 transition-colors duration-300 dark:text-slate-300";

function normalizeUrl(value) {
  if (!value) return "";
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
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [url, setUrl] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // ========================================
  // ÍCONO: LINK O ARCHIVO
  // ========================================
  // "icon" siempre termina siendo un string (URL normal o data URL en base64
  // si viene de un archivo); lo único que cambia según el modo es de dónde
  // sale ese string. Guardamos un "fileInputKey" aparte porque los <input
  // type="file"> no se pueden limpiar seteando su value por código: hay que
  // forzar que React lo vuelva a montar cambiando su key.
  const [iconMode, setIconMode] = useState("link");
  const [icon, setIcon] = useState("");
  const [iconError, setIconError] = useState("");
  const [fileInputKey, setFileInputKey] = useState(0);

  function resetForm() {
    setName("");
    setCategory("");
    setCorreo("");
    setPassword("");
    setUrl("");
    setShowPassword(false);
    setIconMode("link");
    setIcon("");
    setIconError("");
    setFileInputKey((current) => current + 1);
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function handleIconModeChange(mode) {
    setIconMode(mode);
    setIcon("");
    setIconError("");
    setFileInputKey((current) => current + 1);
  }

  async function handleIconFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setIconError("Elegí un archivo de imagen.");
      return;
    }

    if (file.size > MAX_ICON_FILE_BYTES) {
      setIconError("La imagen pesa demasiado (máximo 1.5 MB).");
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setIcon(dataUrl);
      setIconError("");
    } catch {
      setIconError("No se pudo leer el archivo. Probá con otro.");
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
    >
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl transition-colors duration-300 dark:border-white/10 dark:bg-[#0b1220]">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 transition-colors duration-300 dark:text-white">
              Agregar contraseña
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Agrega una nueva cuenta
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

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Nombre */}
          <div>
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
              className={inputClass}
            />
          </div>

          {/* Categoría */}
          <div>
            <label htmlFor="password-category" className={labelClass}>
              Categoría
            </label>

            <select
              id="password-category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              required
              className="w-full cursor-pointer rounded-lg border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              <option value="" disabled>
                Seleccioná una categoría
              </option>

              {CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {/* Usuario o correo */}
          <div>
            <label htmlFor="password-correo" className={labelClass}>
              Usuario o correo{" "}
              <span className="font-normal text-slate-500">(opcional)</span>
            </label>

            <input
              id="password-correo"
              type="text"
              placeholder="usuario@example.com"
              value={correo}
              onChange={(event) => setCorreo(event.target.value)}
              className={inputClass}
            />
          </div>

          {/* Contraseña */}
          <div>
            <label htmlFor="password-value" className={labelClass}>
              Contraseña
            </label>

            <div className="relative">
              <input
                id="password-value"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className={`${inputClass} pr-12`}
              />

              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                title={
                  showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
                aria-label={
                  showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-900 dark:text-slate-500 dark:hover:text-white"
              >
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          {/* URL del sitio */}
          <div>
            <label htmlFor="password-url" className={labelClass}>
              Link de la página{" "}
              <span className="font-normal text-slate-500">(opcional)</span>
            </label>

            <input
              id="password-url"
              type="text"
              placeholder="github.com"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              className={inputClass}
            />
          </div>

          {/* Icono */}
          <div>
            <span className={labelClass}>
              Icono{" "}
              <span className="font-normal text-slate-500">(opcional)</span>
            </span>

            <div className="flex items-center gap-3">
              {/* Vista previa */}
              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-100 transition-colors duration-300 dark:border-white/10 dark:bg-black/20">
                {icon ? (
                  <img src={icon} alt="" className="h-8 w-8 object-contain" />
                ) : (
                  <span className="text-lg">🔐</span>
                )}
              </div>

              {/* Selector de modo */}
              <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-1 text-xs font-medium transition-colors duration-300 dark:border-white/10 dark:bg-black/20">
                <button
                  type="button"
                  onClick={() => handleIconModeChange("link")}
                  className={`rounded-md px-3 py-1.5 transition ${
                    iconMode === "link"
                      ? "bg-violet-600 text-white"
                      : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  Enlace
                </button>
                <button
                  type="button"
                  onClick={() => handleIconModeChange("file")}
                  className={`rounded-md px-3 py-1.5 transition ${
                    iconMode === "file"
                      ? "bg-violet-600 text-white"
                      : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  Subir archivo
                </button>
              </div>
            </div>

            <div className="mt-3">
              {iconMode === "link" ? (
                <input
                  type="url"
                  placeholder="https://..."
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
                  className="block w-full text-sm text-slate-500 transition-colors duration-300 file:mr-3 file:rounded-lg file:border-0 file:bg-violet-600 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-violet-500 dark:text-slate-400"
                />
              )}
            </div>

            {iconError && (
              <p
                className="mt-2 text-xs text-red-600 transition-colors duration-300 dark:text-red-400"
                aria-live="polite"
              >
                {iconError}
              </p>
            )}
          </div>

          {/* Botones */}
          <div className="mt-3 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg px-4 py-2 text-sm text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="rounded-lg bg-violet-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-violet-500"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PasswordModal;
