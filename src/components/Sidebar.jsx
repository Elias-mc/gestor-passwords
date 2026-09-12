import { useState } from 'react';

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
  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-background-secundary transition-colors duration-300">
      {/* LOGO */}

      <div className="flex items-center gap-3 px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-button shadow-lg shadow-button/30 transition-transform duration-300 hover:scale-105 hover:rotate-3">
          <span className="text-lg text-textButton">
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
                className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all duration-200 active:scale-[0.98] ${
                  isActive
                    ? 'bg-button text-textButton shadow-lg shadow-button-border/50'
                    : 'text-text-disabled hover:bg-button-secundary-hover hover:text-textButton-secundary'
                }`}
              >
                <span className="flex h-4 w-4 items-center justify-center text-base leading-none transition-transform duration-150 group-hover:scale-110 group-active:scale-90">
                  <Icon />
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* USUARIO + TEMA */}

      <div className="flex flex-col gap-3 border-t border-border p-4 transition-colors duration-300">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background transition-transform duration-200 hover:scale-105">
            <span className="text-lg">👤</span>
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-text">Usuario</p>
            <p className="truncate text-xs text-text-secondary">usuario@example.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
