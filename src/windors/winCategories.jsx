import { useMemo, useState } from 'react';

import PasswordList from '../components/PasswordList';

function pillClass(active) {
  return `rounded-full border px-4 py-2 text-sm font-medium transition ${
    active
      ? 'border-primary/40 bg-primary/10 text-primary '
      : 'border-secondary text-secondary hover:bg-secondary/10 hover:text-secondary'
  }`;
}

function WinCategories({ passwords, onSelectPassword, onFavorite }) {
  const [selectedCategory, setSelectedCategory] = useState(null);

  // ========================================
  // CONTEO POR CATEGORÍA
  // ========================================
  // Agrupamos ordenando por cantidad descendente, así las categorías más
  // usadas aparecen primero en los chips.
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
    <main className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-6xl p-8">
        <header className="mb-8">
          <h2 className="text-3xl font-bold text-text tracking-tight">Categorías</h2>
          <p className="mt-2 text-sm text-text-muted transition-colors duration-300 ">
            Organizá tus contraseñas según el tipo de cuenta.
          </p>
        </header>

        {categories.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-10 text-center transition-colors duration-300 dark:border-white/10 dark:bg-white/5">
            <p className="text-sm text-slate-500">Todavía no agregaste ninguna contraseña.</p>
          </div>
        ) : (
          <>
            <div className="mb-6 flex flex-wrap gap-2">
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
