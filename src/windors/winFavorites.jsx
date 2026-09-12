import PasswordList from '../components/PasswordList';
import { IconStar } from '../components/Icon/Navigation_icons';

function WinFavorites({ passwords, onSelectPassword, onFavorite }) {
  const favorites = passwords.filter((password) => password.favorito);

  return (
    <main className="flex-1 animate-page-enter overflow-y-auto bg-background">
      <div className="mx-auto max-w-6xl p-8">
        <header className="mb-8">
          <h2 className="text-3xl text-title font-bold tracking-tight">Favoritos</h2>
          <p className="mt-2 text-sm text-title-secondary transition-colors duration-300">
            Tus cuentas marcadas como favoritas, para acceder más rápido.
          </p>
        </header>

        {favorites.length === 0 ? (
          <div className="animate-fade-in rounded-xl border border-border bg-background-secundary p-10 text-center transition-colors duration-300">
            <div className="mb-3 flex animate-pulse justify-center text-text-secondary transition-colors duration-300">
              <IconStar />
            </div>
            <p className="text-sm text-text-secondary">
              Todavía no marcaste ninguna contraseña como favorita.
            </p>
          </div>
        ) : (
          <PasswordList
            passwords={favorites}
            onFavorite={onFavorite}
            onSelectPassword={onSelectPassword}
          />
        )}
      </div>
    </main>
  );
}

export default WinFavorites;
