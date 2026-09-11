import { useEffect, useRef, useState } from "react";

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

const CLIPBOARD_CLEAR_MS = 25000;
const STRENGTH_LABEL = [
  "Muy débil",
  "Débil",
  "Aceptable",
  "Fuerte",
  "Muy fuerte",
];

const STRENGTH_COLOR = [
  "bg-red-500",
  "bg-red-500",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-emerald-500",
];

function formFrom(password) {
  return {
    name: password?.name || "",
    categoria: password?.categoria || "",
    correo: password?.correo || "",
    contrasena: password?.contrasena || "",
    url: password?.url || "",
    icono: password?.icono || "",
  };
}

function normalizeUrl(value) {
  if (!value) return "";
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function generatePassword(length = 16) {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*";
  const values = new Uint32Array(length);
  window.crypto.getRandomValues(values);
  return Array.from(values, (v) => chars[v % chars.length]).join("");
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
    >
      <path d="M0 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2H2a2 2 0 0 1-2-2zm5 10v2a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-2v5a2 2 0 0 1-2 2z" />
    </svg>
  );
}

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500";

// Clase compartida por los botones "cáscara" (borde + hover), que se
// repite en Volver, mostrar/ocultar, copiar, generar y cancelar. Ya trae
// "transition" (color + fondo) desde donde se usa.
const ghostButton =
  "border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white";

function WinModulePassword({ password, onBack, onEdit, onDelete }) {
  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(() => formFrom(password));
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [copied, setCopied] = useState(null); // "correo" | "contrasena" | null
  const clipboardTimer = useRef(null);

  // Cada vez que cambia la entrada seleccionada (el usuario clickeó otra
  // fila de la lista), reseteamos todo el estado local. Sin esto, si
  // estabas editando una contraseña y elegías otra desde la lista,
  // quedabas "editando" la entrada nueva con los datos de la vieja.
  useEffect(() => {
    setForm(formFrom(password));
    setIsEditing(false);
    setShowPassword(false);
    setConfirmingDelete(false);
    setSaveError("");
  }, [password?.id]);

  useEffect(() => () => clearTimeout(clipboardTimer.current), []);

  if (!password) {
    return (
      <main className="flex flex-1 items-center justify-center bg-slate-50 transition-colors duration-300 dark:bg-[#070d1a]">
        <div className="text-center">
          <div className="mb-4 text-5xl">🔐</div>
          <h2 className="text-xl font-semibold text-slate-900 transition-colors duration-300 dark:text-white">
            No hay ninguna contraseña seleccionada
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Seleccioná una contraseña para ver sus datos.
          </p>
        </div>
      </main>
    );
  }

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleStartEdit() {
    setForm(formFrom(password));
    setSaveError("");
    setIsEditing(true);
  }

  function handleCancelEdit() {
    setForm(formFrom(password));
    setSaveError("");
    setIsEditing(false);
  }

  async function handleSave(event) {
    event?.preventDefault();
    if (!form.name.trim()) {
      setSaveError("Ponele un nombre a la cuenta antes de guardar.");
      return;
    }
    setSaving(true);
    setSaveError("");
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
      setSaveError("No se pudo guardar. Probá de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  function handleGenerate() {
    updateField("contrasena", generatePassword());
    setShowPassword(true);
  }

  function toggleFavorite() {
    onEdit({ ...password, favorito: !password.favorito });
  }

  async function copyValue(field, value) {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(field);
    clearTimeout(clipboardTimer.current);
    clipboardTimer.current = setTimeout(async () => {
      setCopied(null);
      try {
        // Solo borramos el portapapeles si todavía tiene lo que copiamos;
        // si el usuario ya copió otra cosa mientras tanto, no la pisamos.
        const current = await navigator.clipboard.readText();
        if (current === value) await navigator.clipboard.writeText("");
      } catch {
        // Sin permiso de lectura del portapapeles: lo dejamos como está.
      }
    }, CLIPBOARD_CLEAR_MS);
  }

  const strength = passwordStrength(form.contrasena);

  return (
    <main className="flex-1 overflow-y-auto bg-slate-50 transition-colors duration-300 dark:bg-[#070d1a]">
      <div className="mx-auto max-w-5xl p-8">
        <button
          type="button"
          onClick={onBack}
          className={`mb-8 flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${ghostButton} ${focusRing}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path
              fillRule="evenodd"
              d="M15 8a.5.5 0 0 1-.5.5H2.707l4.147 4.146a.5.5 0 0 1-.708.708l-5-5a.5.5 0 0 1 0-.708l5-5a.5.5 0 0 1 .708.708L2.707 7.5H14.5A.5.5 0 0 1 15 8"
            />
          </svg>
          <span>Volver</span>
        </button>

        <header className="mb-8 flex items-start justify-between gap-4">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 transition-colors duration-300 dark:border-white/10 dark:bg-white/5">
              {isEditing ? (
                <input
                  type="url"
                  value={form.icono}
                  onChange={(e) => updateField("icono", e.target.value)}
                  placeholder="URL del icono"
                  className="w-full bg-transparent px-2 text-xs text-slate-900 outline-none transition-colors duration-300 dark:text-white"
                />
              ) : password.icono ? (
                <img
                  src={password.icono}
                  alt=""
                  className="h-10 w-10 object-contain"
                />
              ) : (
                <span className="text-2xl">🔐</span>
              )}
            </div>

            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className="w-full max-w-md rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-2xl font-bold text-slate-900 outline-none transition-colors duration-200 focus:border-violet-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              ) : (
                <h1 className="text-3xl font-bold text-slate-900 transition-colors duration-300 dark:text-white">
                  {password.name}
                </h1>
              )}

              {isEditing ? (
                <select
                  value={form.categoria}
                  onChange={(e) => updateField("categoria", e.target.value)}
                  className="mt-2 cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-colors duration-200 focus:border-violet-500 dark:border-white/10 dark:bg-[#0b1220] dark:text-white"
                >
                  <option value="">Seleccioná una categoría</option>
                  {CATEGORIES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="mt-2 inline-flex rounded-full bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-600 transition-colors duration-300 dark:text-violet-400">
                  {password.categoria || "Sin categoría"}
                </span>
              )}
            </div>
          </div>

          {!isEditing && (
            <button
              type="button"
              onClick={toggleFavorite}
              title={
                password.favorito
                  ? "Quitar de favoritos"
                  : "Marcar como favorito"
              }
              aria-pressed={Boolean(password.favorito)}
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border text-lg transition ${focusRing} ${
                password.favorito
                  ? "border-amber-400/30 bg-amber-400/10 text-amber-400"
                  : ghostButton
              }`}
            >
              ★
            </button>
          )}
        </header>

        <section className="divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white transition-colors duration-300 dark:divide-white/10 dark:border-white/10 dark:bg-[#0b1220]">
          <div className="p-6">
            <h2 className="text-sm font-medium text-slate-500 transition-colors duration-300 dark:text-slate-400">
              Usuario o correo
            </h2>
            {isEditing ? (
              <input
                type="text"
                value={form.correo}
                onChange={(e) => updateField("correo", e.target.value)}
                placeholder="usuario@example.com"
                className="mt-3 w-full rounded-lg border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900 outline-none transition-colors duration-200 placeholder:text-slate-400 focus:border-violet-500 dark:border-white/10 dark:bg-black/20 dark:text-white dark:placeholder:text-slate-600"
              />
            ) : (
              <div className="mt-2 flex items-center justify-between gap-4">
                <span className="min-w-0 flex-1 break-all text-sm text-slate-600 transition-colors duration-300 dark:text-zinc-400">
                  {password.correo || "No especificado"}
                </span>
                {password.correo && (
                  <button
                    type="button"
                    onClick={() => copyValue("correo", password.correo)}
                    title="Copiar usuario o correo"
                    aria-label="Copiar usuario o correo"
                    className={`flex shrink-0 items-center justify-center rounded-lg border px-3 py-2 transition ${ghostButton} ${focusRing}`}
                  >
                    {copied === "correo" ? (
                      <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        Copiado
                      </span>
                    ) : (
                      <CopyIcon />
                    )}
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="p-6">
            <h2 className="mb-3 text-sm font-medium text-slate-500 transition-colors duration-300 dark:text-slate-400">
              Contraseña
            </h2>
            {isEditing ? (
              <>
                <div className="flex items-center gap-3">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.contrasena}
                    onChange={(e) => updateField("contrasena", e.target.value)}
                    className="min-h-11 flex-1 rounded-lg border border-slate-200 bg-slate-100 px-4 text-sm text-slate-900 outline-none transition-colors duration-200 focus:border-violet-500 dark:border-white/10 dark:bg-black/20 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((c) => !c)}
                    title={
                      showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                    aria-label={
                      showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border transition ${ghostButton} ${focusRing}`}
                  >
                    {showPassword ? "🙈" : "👁"}
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerate}
                    className={`whitespace-nowrap rounded-lg border px-3 py-2.5 text-xs font-medium transition ${ghostButton} ${focusRing}`}
                  >
                    Generar
                  </button>
                </div>

                {form.contrasena && (
                  <div className="mt-3">
                    <div className="flex h-1.5 gap-1">
                      {[0, 1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`flex-1 rounded-full transition-colors duration-300 ${
                            i < strength
                              ? STRENGTH_COLOR[strength]
                              : "bg-slate-200 dark:bg-white/10"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="mt-1.5 text-xs text-slate-500">
                      {STRENGTH_LABEL[strength]}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <div className="flex min-h-11 flex-1 items-center rounded-lg border border-slate-200 bg-slate-100 px-4 transition-colors duration-300 dark:border-white/10 dark:bg-black/20">
                    {showPassword ? (
                      <span className="break-all text-sm text-slate-900 transition-colors duration-300 dark:text-white">
                        {password.contrasena}
                      </span>
                    ) : (
                      <span className="text-sm tracking-[0.3em] text-slate-500">
                        ••••••••••••
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    title={
                      showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                    aria-label={
                      showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                    onClick={() => setShowPassword((c) => !c)}
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border transition ${ghostButton} ${focusRing}`}
                  >
                    {showPassword ? "🙈" : "👁"}
                  </button>
                  <button
                    type="button"
                    onClick={() => copyValue("contrasena", password.contrasena)}
                    title="Copiar contraseña"
                    aria-label="Copiar contraseña"
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border transition ${ghostButton} ${focusRing}`}
                  >
                    {copied === "contrasena" ? (
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        ✓
                      </span>
                    ) : (
                      <CopyIcon />
                    )}
                  </button>
                </div>
                {copied === "contrasena" && (
                  <p className="mt-2 text-xs text-slate-500">
                    Copiada. Se borra sola del portapapeles en{" "}
                    {CLIPBOARD_CLEAR_MS / 1000} segundos.
                  </p>
                )}
              </>
            )}
          </div>

          <div className="p-6">
            <h2 className="mb-3 text-sm font-medium text-slate-500 transition-colors duration-300 dark:text-slate-400">
              URL
            </h2>
            {isEditing ? (
              <input
                type="url"
                value={form.url}
                onChange={(e) => updateField("url", e.target.value)}
                placeholder="https://github.com"
                className="w-full rounded-lg border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900 outline-none transition-colors duration-200 placeholder:text-slate-400 focus:border-violet-500 dark:border-white/10 dark:bg-black/20 dark:text-white dark:placeholder:text-slate-600"
              />
            ) : password.url ? (
              <a
                href={password.url}
                target="_blank"
                rel="noreferrer"
                className={`rounded break-all text-sm text-violet-600 transition hover:text-violet-500 hover:underline dark:text-violet-400 dark:hover:text-violet-300 ${focusRing}`}
              >
                {password.url}
              </a>
            ) : (
              <span className="text-sm text-slate-500">No especificada</span>
            )}
          </div>
        </section>

        {saveError && (
          <p
            className="mt-4 text-sm text-red-600 transition-colors duration-300 dark:text-red-400"
            aria-live="polite"
          >
            {saveError}
          </p>
        )}

        <div className="mt-6 flex items-center justify-end gap-3">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={saving}
                className={`rounded-lg border px-5 py-2.5 text-sm font-medium transition disabled:opacity-50 ${ghostButton} ${focusRing}`}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className={`rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-500 disabled:opacity-60 ${focusRing}`}
              >
                {saving ? "Guardando…" : "Guardar cambios"}
              </button>
            </>
          ) : confirmingDelete ? (
            <>
              <span className="mr-1 text-sm text-slate-500 transition-colors duration-300 dark:text-slate-400">
                ¿Eliminar esta contraseña?
              </span>
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                className={`rounded-lg border px-5 py-2.5 text-sm font-medium transition ${ghostButton} ${focusRing}`}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => onDelete(password.id)}
                className={`rounded-lg bg-red-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-400 ${focusRing}`}
              >
                Sí, eliminar
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleStartEdit}
                className={`rounded-lg border px-5 py-2.5 text-sm font-medium transition ${ghostButton} ${focusRing}`}
              >
                Editar
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                className={`rounded-lg bg-red-500/10 px-5 py-2.5 text-sm font-medium text-red-600 transition hover:text-red-500 dark:text-red-400 dark:hover:text-red-300 ${focusRing}`}
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
