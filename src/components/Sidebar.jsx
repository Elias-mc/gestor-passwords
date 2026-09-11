import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import {
  IconLock,
  IconCategory,
  IconStar,
  IconSetting,
  IconGenerator,
} from './Icon/Navigation_icons';

// Navigation icons
const NAV_ITEMS = [
  { id: 'passwords', label: 'Contraseñas', icon: IconLock },
  { id: 'categories', label: 'Categorías', icon: IconCategory },
  { id: 'favorites', label: 'Favoritos', icon: IconStar },
  { id: 'generator', label: 'Generador', icon: IconGenerator },
  { id: 'settings', label: 'Configuración', icon: IconSetting },
];

function Sidebar({ view, onNavigate }) {
  const { theme, toggleTheme } = useTheme();
  const [spun, setSpun] = useState(false);

  function handleToggleTheme() {
    toggleTheme();
    setSpun((current) => !current);
  }

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-background-secundary transition-colors ">
      {/* LOGO */}

      <div className="flex items-center gap-3 px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-lg shadow-violet-600/20">
          <span className="text-lg text-text">
            <IconLock />
          </span>
        </div>

        <div>
          <h1 className="text-sm font-bold text-title">Gestor de Contraseñas</h1>
          <p className="text-xs text-title-secondary">Password Manager</p>
        </div>
      </div>

      {/* NAVEGACIÓN */}

      <nav className="flex-1 px-3 py-4">
        <div className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = view === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
                  isActive
                    ? 'bg-button text-textButton shadow-lg shadow-button-border/50'
                    : 'text-text-disabled hover:bg-button-secundary-hover hover:text-textButton-secundary'
                }`}
              >
                <span className="flex h-4 w-4 items-center justify-center text-base leading-none">
                  <Icon />
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* USUARIO + TEMA */}

      <div className="flex items-center gap-3 border-t border-slate-200 p-4 transition-colors duration-300 ">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background">
          <span className="text-lg">👤</span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">Usuario</p>
          <p className="truncate text-xs text-slate-500">usuario@example.com</p>
        </div>

        <button
          type="button"
          onClick={handleToggleTheme}
          title={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
          aria-label={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
          className=" flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
        >
          <span
            className={`inline-block transition-transform duration-500 ease-out ${
              spun ? 'rotate-180' : 'rotate-0'
            }`}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
