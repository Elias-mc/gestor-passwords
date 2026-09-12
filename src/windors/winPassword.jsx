import { useMemo, useState } from 'react';
import { IconSearch, IconPlus } from '../components/Icon/Navigation_icons';
import PasswordList from '../components/PasswordList';

function WinPassword({ passwords, onAdd, onSelectPassword, onFavorite, onCategoryChange }) {
  const [search, setSearch] = useState('');

  // Navegaro
  const filteredPasswords = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return passwords;
    }

    return passwords.filter(
      (password) =>
        password.name.toLowerCase().includes(query) ||
        (password.categoria || '').toLowerCase().includes(query)
    );
  }, [passwords, search]);

  return (
    <main className="flex-1 animate-page-enter overflow-y-auto bg-background">
      <div className="mx-auto max-w-6xl p-8">
        <header className="mb-8">
          <h2 className="text-4xl max-sm:text-2xl font-bold tracking-tight text-title">
            Mis contraseñas
          </h2>

          <p className="mt-2 max-sm:text-sm  text-m text-title-secondary">
            Administra de forma segura tus cuentas y contraseñas.
          </p>
        </header>

        <div className="mb-6 flex gap-3">
          {/* BUSCADOR */}

          <div className="group relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-disabled transition-colors duration-200 group-focus-within:text-button">
              <IconSearch />
            </span>

            <input
              type="text"
              placeholder="Buscar en tus contraseñas..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="
                w-full
                rounded-xl
                border border-border
                bg-background-secundary
                py-3 pl-11 pr-4
                text-sm text-text
                outline-none
                transition-all duration-200

                placeholder:text-text-disabled

                focus:border-button
                focus:ring-1
                focus:ring-button/30
              "
            />
          </div>

          {/* BOTÓN AGREGAR */}

          <button
            type="button"
            onClick={onAdd}
            className="
              group
              flex items-center gap-2
              rounded-lg
              border border-button-border
              bg-button
              px-5 py-2.5
              text-sm font-semibold
              text-textButton

              shadow-lg
              shadow-button/20

              transition-all
              duration-200

              hover:scale-[1.03]
              hover:border-button-border-hover
              hover:bg-button-hover

              active:scale-95
            "
          >
            <span className="leading-none transition-transform duration-200 group-hover:rotate-90">
              <IconPlus />
            </span>

            <span>Agregar</span>
          </button>
        </div>

        <PasswordList
          passwords={filteredPasswords}
          onFavorite={onFavorite}
          onCategoryChange={onCategoryChange}
          onSelectPassword={onSelectPassword}
        />
      </div>
    </main>
  );
}

export default WinPassword;
