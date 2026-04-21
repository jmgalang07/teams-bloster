import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { assetPath } from '../utils/siteUtils';

const navLinks = [
  { to: '/', label: 'Inicio' },
  { to: '/capturas', label: 'Capturas' },
  { to: '/charcas', label: 'Escenarios' },
  { to: '/marcas', label: 'Marcas' },
  { to: '/cebos', label: 'Cebos' },
  { to: '/panel', label: 'Subir captura', isCta: true },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isDarkTheme, toggleTheme } = useTheme();
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const standardLinks = useMemo(
    () => navLinks.filter((item) => !item.isCta),
    [],
  );
  const ctaLink = useMemo(() => navLinks.find((item) => item.isCta), []);

  return (
    <header className="site-header">
      <div className="site-container header-inner">
        <Link className="brand-mark" to="/">
          <img src={assetPath('images/logo.png')} alt="Logo Team's Bloster" />
          <div>
            <strong>Team&apos;s Bloster</strong>
            <span>Carpfishing crew</span>
          </div>
        </Link>

        <button
          className="mobile-nav-toggle"
          type="button"
          aria-label="Abrir menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((current) => !current)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`main-nav ${menuOpen ? 'is-open' : ''}`}>
          {standardLinks.map((item) => (
            <NavLink
              key={item.to}
              className={({ isActive }) =>
                `nav-link ${isActive ? 'is-active' : ''}`
              }
              to={item.to}
            >
              {item.label}
            </NavLink>
          ))}

          <button
            className="nav-link theme-toggle"
            type="button"
            aria-label={isDarkTheme ? 'Activar modo claro' : 'Activar modo oscuro'}
            title={isDarkTheme ? 'Activar modo claro' : 'Activar modo oscuro'}
            onClick={toggleTheme}
          >
            <span className="theme-toggle-icon" aria-hidden="true">
              {isDarkTheme ? '☀' : '☾'}
            </span>
            {isDarkTheme ? 'Modo claro' : 'Modo oscuro'}
          </button>

          {ctaLink ? (
            <NavLink
              className={({ isActive }) =>
                `nav-link nav-link-cta ${isActive ? 'is-active' : ''}`
              }
              to={ctaLink.to}
            >
              {ctaLink.label}
            </NavLink>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
