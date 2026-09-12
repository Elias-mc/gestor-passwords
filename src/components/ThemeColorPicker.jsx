import { useEffect, useState } from 'react';

const STORAGE_KEY = 'gestor-contrasenas-color-theme';
const DEFAULT_THEME = 'theme-default';

const THEME_OPTIONS = [
  {
    id: 'theme-default',
    label: 'Cálido',
    swatch: '#eb5e28',
  },
  {
    id: 'theme-verde',
    label: 'Bosque',
    swatch: '#4f772d',
  },
  {
    id: 'theme-rojo',
    label: 'Vino',
    swatch: '#c1121f',
  },
  {
    id: 'theme-negro',
    label: 'Black',
    swatch: '#000000',
  },
  {
    id: 'theme-blanco',
    label: 'white',
    swatch: '#fff',
  },
  {
    id: 'theme-azul',
    label: 'Blue',
    swatch: '#4f8cff',
  },
  {
    id: 'theme-finn',
    label: 'Finn',
    swatch: '#d8effb',
  },
];

function ThemeColorPicker() {
  const [theme, setTheme] = useState(DEFAULT_THEME);
  const [isChanging, setIsChanging] = useState(false);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(STORAGE_KEY);

    const validTheme = THEME_OPTIONS.some((option) => option.id === storedTheme)
      ? storedTheme
      : DEFAULT_THEME;

    setTheme(validTheme);
    document.documentElement.dataset.theme = validTheme;
  }, []);

  function handleChange(event) {
    const nextTheme = event.target.value;

    if (nextTheme === theme || isChanging) {
      return;
    }

    const root = document.documentElement;

    setIsChanging(true);

    root.classList.remove('theme-changing');

    void root.offsetWidth;

    root.classList.add('theme-changing');

    window.setTimeout(() => {
      // Ahora sí cambiamos el tema.
      root.dataset.theme = nextTheme;

      setTheme(nextTheme);

      window.localStorage.setItem(STORAGE_KEY, nextTheme);

      window.setTimeout(() => {
        root.classList.remove('theme-changing');
        setIsChanging(false);
      }, 80);
    }, 480);
  }

  return (
    <fieldset className="color-picker">
      <legend className="sr-only">Color del tema</legend>

      {THEME_OPTIONS.map((option) => (
        <label key={option.id} title={option.label} className="cursor-pointer">
          <input
            type="radio"
            name="app-color-theme"
            value={option.id}
            checked={theme === option.id}
            onChange={handleChange}
            aria-label={option.label}
            disabled={isChanging}
            className="sr-only"
          />

          <span
            aria-hidden="true"
            className={`block h-7 w-7 rounded-full border-2 transition-all duration-200 ${
              theme === option.id
                ? 'scale-110 border-text ring-2 ring-button/40'
                : 'border-border hover:scale-105'
            }`}
            style={{
              backgroundColor: option.swatch,
            }}
          />
        </label>
      ))}
    </fieldset>
  );
}

export default ThemeColorPicker;
