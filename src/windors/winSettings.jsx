import { useState } from 'react';
import SyncExportModal from '../components/SyncExportModal';
import SyncImportModal from '../components/SyncImportModal';
import ThemeColorPicker from '../components/ThemeColorPicker';
const ghostButton = 'border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-900 ';

function WinSettings({ passwords, onImportPasswords }) {
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-3xl p-8">
        <header className="mb-8">
          <h2 className="text-3xl text-title font-bold tracking-tight">Configuración</h2>
          <p className="mt-2 text-sm text-title-secondary transition-colors duration-300 ">
            Preferencias generales de la aplicación.
          </p>
        </header>

        {/* APARIENCIA */}
        <section className="rounded-2xl border border-background-secundary bg-background-secundary p-6 transition-colors duration-300">
          <h3 className="text-sm font-medium text-text transition-colors duration-300 ">
            Apariencia
          </h3>
          <p className="mt-1 text-sm text-text-secondary">
            Elegí el tono de colores que más te guste para personalizar la aplicación. Después de
            todo, mirar contraseñas también puede ser bonito.
          </p>

          <div className="mt-4 flex  justify-center ">
            <ThemeColorPicker />
          </div>
        </section>

        {/* SINCRONIZACIÓN */}
        <section className="mt-6 rounded-2xl border border-background-secundary bg-background-secundary p-6 transition-colors duration-300">
          <h3 className="text-sm font-medium text-text transition-colors duration-300 ">
            Sincronización
          </h3>
          <p className="mt-1 text-sm text-text-secondary">
            Llevá tus contraseñas a otra computadora. Se guardan cifradas durante 30 días y después
            se eliminan automáticamente.
          </p>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => setIsExportOpen(true)}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-button px-4 py-2.5 text-sm font-semibold text-textButton shadow-lg shadow-button/20 transition hover:bg-button-border-hover"
            >
              ↑ Exportar / Sincronizar
            </button>
            <button
              type="button"
              onClick={() => setIsImportOpen(true)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg border border-button-secundary bg-button-secundary px-4 text-textButton-secundary py-2.5 text-sm font-medium transition ${ghostButton}`}
            >
              ↓ Importar desde otro dispositivo
            </button>
          </div>
        </section>

        {/* ACERCA DE */}
        <section className="mt-6 rounded-2xl border border-background-secundary bg-background-secundary p-6 transition-colors duration-300  ">
          <h3 className="text-sm font-medium text-text transition-colors duration-300 ">
            Acerca de
          </h3>
          <p className="mt-2 text-sm text-text-secondary">
            Gestor de Contraseñas — guarda tus credenciales mientras dure esta sesión del navegador.
          </p>

          <div className="mt-4 flex items-center justify-between border-t border-text pt-4 transition-colors duration-300 ">
            <span className="text-sm text-text-disabled transition-colors duration-300 ">
              Contraseñas guardadas
            </span>
            <span className="rounded-full bg-button/10 px-3 py-1 text-xs font-semibold text-textButton transition-colors duration-300 ">
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
