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

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    getAllPasswords()
      .then((stored) => {
        if (cancelled) return;

        if (stored.length > 0) {
          setPasswords(stored);
        } else {
          saveAllPasswords(initialPasswords).catch((error) => {
            console.error('No se pudieron guardar los datos iniciales:', error);
          });
        }
      })
      .catch((error) => {
        console.error('No se pudo abrir la base de datos local:', error);
      })
      .finally(() => {
        if (!cancelled) setIsLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    saveAllPasswords(passwords).catch((error) => {
      console.error('No se pudieron guardar los cambios localmente:', error);
    });
  }, [passwords, isLoaded]);

  const [view, setView] = useState('passwords');

  const [selectedPasswordId, setSelectedPasswordId] = useState(null);

  const selectedPassword = passwords.find((password) => password.id === selectedPasswordId) ?? null;

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

  function handleSelectPassword(password) {
    setSelectedPasswordId(password.id);
  }

  function handleBack() {
    setSelectedPasswordId(null);
  }

  function handleEditPassword(updatedPassword) {
    setPasswords((currentPasswords) =>
      currentPasswords.map((password) =>
        password.id === updatedPassword.id ? { ...password, ...updatedPassword } : password
      )
    );
  }

  function handleDeletePassword(id) {
    setPasswords((currentPasswords) => currentPasswords.filter((password) => password.id !== id));

    setSelectedPasswordId(null);
  }

  function handleFavorite(id) {
    setPasswords((currentPasswords) =>
      currentPasswords.map((password) =>
        password.id === id ? { ...password, favorito: !password.favorito } : password
      )
    );
  }

  function handleCategoryChange(id, category) {
    setPasswords((currentPasswords) =>
      currentPasswords.map((password) =>
        password.id === id ? { ...password, categoria: category } : password
      )
    );
  }

  function handleImportPasswords(importedPasswords) {
    setPasswords(importedPasswords);
    setSelectedPasswordId(null);
  }

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
