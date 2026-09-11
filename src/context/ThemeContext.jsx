import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);
const STORAGE_KEY = 'gestor-contrasenas-theme';

// ========================================
// TEMA INICIAL
// ========================================
// Prioridad: lo que el usuario eligió antes (localStorage) > la
// preferencia del sistema operativo > oscuro por default.
function getInitialTheme() {
  if (typeof window === 'undefined') return 'dark';

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;

  const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  return prefersLight ? 'light' : 'dark';
}

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  // Aplicamos la clase "dark" en <html> (estrategia de Tailwind) y
  // guardamos la elección para la próxima vez que se abra la app.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe usarse dentro de un <ThemeProvider>');
  }
  return context;
}

export { ThemeProvider, useTheme };
