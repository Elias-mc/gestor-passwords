function PasswordCard({ password, onFavorite, onClick }) {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
      className="group flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-violet-500/40 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
    >
      <div className="flex items-center gap-4">
        {password.icono ? (
          <img
            src={password.icono}
            alt={password.name}
            className="h-10 w-10 rounded-lg object-contain"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10 text-lg">
            🔐
          </div>
        )}

        <div>
          <h3 className="font-semibold text-slate-900 transition-colors duration-300 dark:text-white">
            {password.name}
          </h3>
          <p className="text-sm text-slate-500 transition-colors duration-300 dark:text-slate-400">
            {password.categoria || "Sin categoría"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={(event) => {
            // Sin esto, tocar la estrella también dispara el onClick de la
            // tarjeta y te manda al detalle en vez de solo marcar favorito.
            event.stopPropagation();
            onFavorite(password.id);
          }}
          title={
            password.favorito ? "Quitar de favoritos" : "Marcar como favorito"
          }
          aria-pressed={Boolean(password.favorito)}
          className={`rounded text-lg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
            password.favorito
              ? "text-amber-400"
              : "text-slate-400 hover:text-slate-600 dark:text-slate-600 dark:hover:text-slate-300"
          }`}
        >
          ★
        </button>

        {/* Antes le faltaba la clase "group" al contenedor de arriba,
            así que este hover nunca se disparaba. */}
        <span className="text-xl text-slate-400 transition group-hover:text-violet-400 dark:text-slate-500">
          →
        </span>
      </div>
    </div>
  );
}

export default PasswordCard;
