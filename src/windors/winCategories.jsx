import { useMemo, useState } from 'react';

import PasswordList from '../components/PasswordList';

function pillClass(active) {
  return `rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 active:scale-95 ${
    active
      ? 'border-button/40 bg-button/10 text-button'
      : 'border-border text-text-secondary hover:bg-background-secundary hover:text-text'
  }`;
}

function WinCategories({ passwords, onSelectPassword, onFavorite }) {
  const [selectedCategory, setSelectedCategory] = useState(null);

  const categories = useMemo(() => {
    const counts = new Map();
    passwords.forEach((password) => {
      const category = password.categoria || 'Sin categoría';
      counts.set(category, (counts.get(category) || 0) + 1);
    });
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [passwords]);

  const filteredPasswords = selectedCategory
    ? passwords.filter((password) => (password.categoria || 'Sin categoría') === selectedCategory)
    : passwords;

  return (
    <main className="flex-1 animate-page-enter overflow-y-auto bg-background">
      <div className="mx-auto max-w-6xl p-8">
        <header className="mb-8">
          <h2 className="text-3xl font-bold text-title tracking-tight">Categorías</h2>
          <p className="mt-2 text-sm text-title-secondary transition-colors duration-300">
            Organizá tus contraseñas según el tipo de cuenta.
          </p>
        </header>

        {categories.length === 0 ? (
          <div className="animate-fade-in rounded-xl border border-border bg-background-secundary p-10 text-center transition-colors duration-300">
            <p className="text-sm text-text-secondary">Todavía no agregaste ninguna contraseña.</p>
          </div>
        ) : (
          <>
            <div className="mb-6 flex animate-nav flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedCategory(null)}
                className={pillClass(!selectedCategory)}
              >
                Todas ({passwords.length})
              </button>

              {categories.map(([category, count]) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={pillClass(selectedCategory === category)}
                >
                  {category} ({count})
                </button>
              ))}
            </div>

            <PasswordList
              passwords={filteredPasswords}
              onFavorite={onFavorite}
              onSelectPassword={onSelectPassword}
            />
          </>
        )}
      </div>
    </main>
  );
}

export default WinCategories;
