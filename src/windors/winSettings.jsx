import { useState } from 'react';

import SyncExportModal from '../components/SyncExportModal';
import SyncImportModal from '../components/SyncImportModal';
import { useTheme } from '../context/ThemeContext';

const ghostButton =
  'border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white';

function WinSettings({ passwords, onImportPasswords }) {
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-3xl p-8">
        <header className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight">Configuración</h2>
          <p className="mt-2 text-sm text-slate-500 transition-colors duration-300 dark:text-slate-400">
            Preferencias generales de la aplicación.
          </p>
        </header>

        {/* APARIENCIA */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 transition-colors duration-300 dark:border-white/10 dark:bg-[#0b1220]">
          <h3 className="text-sm font-medium text-slate-500 transition-colors duration-300 dark:text-slate-400">
            Apariencia
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Elegí el tono de colores con el que se ve la aplicación.
          </p>

          <div className="flex justify-center">
            <form className="color-picker" action="">
              <fieldset>
                <label for="theme" className="visually-hidden">
                  Light
                </label>
                <input type="radio" name="theme" id="linght check"></input>
                <label for="theme" className="visually-hidden">
                  Light
                </label>
                <input type="radio" name="theme" id="pink"></input>
                <label for="theme" className="visually-hidden">
                  Light
                </label>
                <input type="radio" name="theme" id="red"></input>
              </fieldset>
            </form>
          </div>
        </section>

        {/* SINCRONIZACIÓN */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 transition-colors duration-300 dark:border-white/10 dark:bg-[#0b1220]">
          <h3 className="text-sm font-medium text-slate-500 transition-colors duration-300 dark:text-slate-400">
            Sincronización
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Llevá tus contraseñas a otra computadora. Se guardan cifradas durante 30 días y después
            se eliminan solas.
          </p>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => setIsExportOpen(true)}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-500"
            >
              ↑ Exportar / Sincronizar
            </button>
            <button
              type="button"
              onClick={() => setIsImportOpen(true)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition ${ghostButton}`}
            >
              ↓ Importar desde otro dispositivo
            </button>
          </div>
        </section>

        {/* ACERCA DE */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 transition-colors duration-300 dark:border-white/10 dark:bg-[#0b1220]">
          <h3 className="text-sm font-medium text-slate-500 transition-colors duration-300 dark:text-slate-400">
            Acerca de
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            Gestor de Contraseñas — guarda tus credenciales mientras dure esta sesión del navegador.
          </p>

          <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4 transition-colors duration-300 dark:border-white/10">
            <span className="text-sm text-slate-500 transition-colors duration-300 dark:text-slate-400">
              Contraseñas guardadas
            </span>
            <span className="rounded-full bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-600 transition-colors duration-300 dark:text-violet-400">
              {passwords.length}
            </span>
          </div>
        </section>
      </div>

      <SyncExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        passwords={passwords}
      />

      <SyncImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImport={onImportPasswords}
      />
    </main>
  );
}

export default WinSettings;
