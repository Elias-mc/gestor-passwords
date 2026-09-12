import { useEffect, useState } from 'react';

import PasswordModal from './components/PasswordModal';
import Sidebar from './components/Sidebar';
import { initialPasswords } from './data/passwords';
import { getAllPasswords, saveAllPasswords } from './lib/passwordsDb';
import WinCategories from './windors/winCategories';
import WinFavorites from './windors/winFavorites';
import WinGenerator from './windors/winGenerator';
import WinModulePassword from './windors/Module/winModulePassword';
import WinPassword from './windors/winPassword';
import WinSettings from './windors/winSettings';

function App() {
  const [passwords, setPasswords] = useState(initialPasswords);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ========================================
  // PERSISTENCIA LOCAL (IndexedDB)
  // ========================================
  // "isLoaded" arranca en false para no mostrar ni por un instante los
  // datos de ejemplo (initialPasswords) si el usuario ya tenía otras
  // contraseñas guardadas: primero leemos la base local, y recién ahí
  // mostramos la app (ver el "return" de carga, más abajo).
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    getAllPasswords()
      .then((stored) => {
        if (cancelled) return;

        if (stored.length > 0) {
          setPasswords(stored);
        } else {
          // Primera vez que se abre la app en esta computadora: todavía
          // no hay nada guardado, así que persistimos los datos de
          // ejemplo iniciales para que quede algo guardado desde ya.
          saveAllPasswords(initialPasswords).catch((error) => {
            console.error('No se pudieron guardar los datos iniciales:', error);
          });
        }
      })
      .catch((error) => {
        // Sin IndexedDB (navegador viejo, modo privado muy restrictivo)
        // seguimos funcionando en memoria, simplemente sin persistencia.
        console.error('No se pudo abrir la base de datos local:', error);
      })
      .finally(() => {
        if (!cancelled) setIsLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // A partir de que terminó la carga inicial, cualquier cambio en
  // "passwords" (agregar, editar, borrar, favorito, categoría, importar
  // un pack sincronizado) se guarda solo. El guard de "isLoaded" evita
  // que este efecto pise los datos reales con "initialPasswords" en el
  // instante antes de que termine de cargar.
  useEffect(() => {
    if (!isLoaded) return;

    saveAllPasswords(passwords).catch((error) => {
      console.error('No se pudieron guardar los cambios localmente:', error);
    });
  }, [passwords, isLoaded]);

  // ========================================
  // VISTA ACTIVA
  // ========================================
  // Controla qué sección del sidebar se muestra ("passwords", "categories",
  // "favorites", "generator", "settings"). El detalle de una contraseña
  // (selectedPasswordId) es independiente de esto: se puede abrir desde
  // cualquiera de las vistas que listan contraseñas, y al volver ("Volver")
  // se respeta la vista en la que estabas antes de entrar al detalle.
  const [view, setView] = useState('passwords');

  // ========================================
  // CONTRASEÑA SELECCIONADA
  // ========================================
  // Guardamos solo el id, no una copia del objeto. Si guardáramos el
  // objeto entero, después de editar o marcar como favorita una entrada
  // desde el detalle, la vista seguiría mostrando los datos viejos hasta
  // volver a seleccionarla. Derivándolo de "passwords" en cada render,
  // siempre está sincronizado con la última versión.
  const [selectedPasswordId, setSelectedPasswordId] = useState(null);

  const selectedPassword = passwords.find((password) => password.id === selectedPasswordId) ?? null;

  // ========================================
  // NAVEGAR DESDE EL SIDEBAR
  // ========================================

  function handleNavigate(nextView) {
    setView(nextView);
    setSelectedPasswordId(null);
  }

  // ========================================
  // AGREGAR CONTRASEÑA
  // ========================================

  function handleAddPassword(newPassword) {
    setPasswords((currentPasswords) => [
      ...currentPasswords,
      {
        // Defaults por si PasswordModal no los completa; lo que venga en
        // newPassword siempre gana sobre estos valores de relleno.
        id: window.crypto.randomUUID(),
        favorito: false,
        categoria: 'Sin categoría',
        correo: '',
        url: '',
        icono: null,
        ...newPassword,
      },
    ]);
  }

  // ========================================
  // SELECCIONAR CONTRASEÑA
  // ========================================

  function handleSelectPassword(password) {
    setSelectedPasswordId(password.id);
  }

  // ========================================
  // VOLVER A LA LISTA
  // ========================================

  function handleBack() {
    setSelectedPasswordId(null);
  }

  // ========================================
  // EDITAR CONTRASEÑA (desde el detalle)
  // ========================================

  function handleEditPassword(updatedPassword) {
    setPasswords((currentPasswords) =>
      currentPasswords.map((password) =>
        password.id === updatedPassword.id ? { ...password, ...updatedPassword } : password
      )
    );
  }

  // ========================================
  // ELIMINAR CONTRASEÑA
  // ========================================

  function handleDeletePassword(id) {
    setPasswords((currentPasswords) => currentPasswords.filter((password) => password.id !== id));

    setSelectedPasswordId(null);
  }

  // ========================================
  // FAVORITO (desde la lista)
  // ========================================

  function handleFavorite(id) {
    setPasswords((currentPasswords) =>
      currentPasswords.map((password) =>
        password.id === id ? { ...password, favorito: !password.favorito } : password
      )
    );
  }

  // ========================================
  // CATEGORÍA (desde la lista)
  // ========================================

  function handleCategoryChange(id, category) {
    setPasswords((currentPasswords) =>
      currentPasswords.map((password) =>
        password.id === id ? { ...password, categoria: category } : password
      )
    );
  }

  // ========================================
  // IMPORTAR PACK (desde Configuración > Sincronización)
  // ========================================
  // Reemplaza toda la lista local por la que vino del pack descifrado.
  // También soltamos cualquier detalle abierto: el id seleccionado podría
  // no existir más (o corresponder a otra entrada) en la lista nueva.

  function handleImportPasswords(importedPasswords) {
    setPasswords(importedPasswords);
    setSelectedPasswordId(null);
  }

  // ========================================
  // CONTENIDO PRINCIPAL
  // ========================================
  // El detalle tiene prioridad sobre la vista activa: si hay una
  // contraseña seleccionada, se muestra sin importar en qué sección del
  // sidebar estemos.

  function renderMainContent() {
    if (selectedPassword) {
      return (
        <WinModulePassword
          password={selectedPassword}
          onBack={handleBack}
          onEdit={handleEditPassword}
          onDelete={handleDeletePassword}
        />
      );
    }

    switch (view) {
      case 'favorites':
        return (
          <WinFavorites
            passwords={passwords}
            onSelectPassword={handleSelectPassword}
            onFavorite={handleFavorite}
          />
        );

      case 'categories':
        return (
          <WinCategories
            passwords={passwords}
            onSelectPassword={handleSelectPassword}
            onFavorite={handleFavorite}
          />
        );

      case 'generator':
        return <WinGenerator />;

      case 'settings':
        return <WinSettings passwords={passwords} onImportPasswords={handleImportPasswords} />;

      case 'passwords':
      default:
        return (
          <WinPassword
            passwords={passwords}
            onAdd={() => setIsModalOpen(true)}
            onSelectPassword={handleSelectPassword}
            onFavorite={handleFavorite}
            onCategoryChange={handleCategoryChange}
          />
        );
    }
  }

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-text-secondary transition-colors">
        <p className="animate-pulse text-sm">Cargando tus contraseñas…</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background text-text transition-colors ">
      {/* Barra lateral */}
      <Sidebar view={view} onNavigate={handleNavigate} />

      {/* Ventanas */}
      {renderMainContent()}

      {/* MODAL DE NUEVA CONTRASEÑA */}
      <PasswordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddPassword={handleAddPassword}
      />
    </div>
  );
}

export default App;
