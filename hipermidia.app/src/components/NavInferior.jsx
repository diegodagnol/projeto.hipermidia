import { NavLink } from 'react-router-dom';

const IcoPassaporte = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z"/>
    <line x1="8" y1="9" x2="16" y2="9"/>
    <line x1="8" y1="13" x2="14" y2="13"/>
  </svg>
);

const IcoPerfil = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const IcoEstrela = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);

export default function NavInferior({ ativo }) {
  return (
    <nav className="nav-inferior">
      <NavLink
        to="/passaporte"
        className={`nav-inferior-item${ativo === 'passaporte' ? ' ativo' : ''}`}
      >
        <IcoPassaporte />
        Passaporte
      </NavLink>

      <div className="nav-inferior-centro">
        <NavLink
          to="/mapa"
          className={`nav-inferior-centro-btn${ativo === 'mapa' ? ' ativo' : ''}`}
        >
          <IcoEstrela />
        </NavLink>
      </div>

      <NavLink
        to="/perfil"
        className={`nav-inferior-item${ativo === 'perfil' ? ' ativo' : ''}`}
      >
        <IcoPerfil />
        Perfil
      </NavLink>
    </nav>
  );
}
