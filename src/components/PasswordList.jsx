import PasswordCard from './PasswordCard';

// Tope de stagger: pasado cierto punto, seguir sumando delay solo hace
// que las últimas tarjetas de una lista larga tarden demasiado en
// aparecer, así que lo topamos en 8 y de ahí en más entran juntas.
const MAX_STAGGER_INDEX = 8;
const STAGGER_STEP_MS = 40;

function PasswordList({ passwords, onFavorite, onCategoryChange, onSelectPassword }) {
  if (passwords.length === 0) {
    return (
      <div className="animate-fade-in rounded-xl bg-background-secundary p-8 text-center transition-colors duration-300">
        <p className="text-sm text-text-secondary">No se encontraron contraseñas.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {passwords.map((password, index) => (
        <PasswordCard
          key={password.id}
          password={password}
          onFavorite={onFavorite}
          onCategoryChange={onCategoryChange}
          onClick={() => onSelectPassword(password)}
          style={{ animationDelay: `${Math.min(index, MAX_STAGGER_INDEX) * STAGGER_STEP_MS}ms` }}
        />
      ))}
    </div>
  );
}

export default PasswordList;
