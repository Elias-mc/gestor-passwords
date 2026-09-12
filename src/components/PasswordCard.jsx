import { IconStar, IconLock } from './Icon/Navigation_icons';
function PasswordCard({ password, onFavorite, onClick, style }) {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick();
        }
      }}
      style={style}
      className="group flex animate-card-in cursor-pointer items-center justify-between gap-4 rounded-xl border border-border bg-background-secundary p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-button/40 hover:shadow-lg hover:shadow-button/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-button"
    >
      <div className="flex items-center gap-4">
        {password.icono ? (
          <img
            src={password.icono}
            alt={password.name}
            className="h-10 w-10 rounded-lg object-contain"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-button/10 text-lg transition-transform duration-200 group-hover:scale-105">
            <IconLock />
          </div>
        )}

        <div>
          <h3 className="font-semibold text-text transition-colors duration-300">
            {password.name}
          </h3>
          <p className="text-sm text-text-secondary transition-colors duration-300">
            {password.categoria || 'Sin categoría'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onFavorite(password.id);
          }}
          title={password.favorito ? 'Quitar de favoritos' : 'Marcar como favorito'}
          aria-pressed={Boolean(password.favorito)}
          className={`rounded text-lg transition-transform duration-150 hover:scale-110 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-button ${
            password.favorito ? 'text-amber-400' : 'text-text-disabled hover:text-text-secondary'
          }`}
        >
          <span key={password.favorito ? 'on' : 'off'} className="inline-block animate-star-pop">
            <IconStar />
          </span>
        </button>

        <span className="text-xl text-text-disabled transition-all duration-200 group-hover:translate-x-1 group-hover:text-button">
          →
        </span>
      </div>
    </div>
  );
}

export default PasswordCard;
