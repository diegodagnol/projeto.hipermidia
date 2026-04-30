import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Abertura() {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  if (usuario) return <Navigate to="/mapa" replace />;

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(160deg, #0051E8 0%, #3B2FF7 50%, #9B2FF7 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '60px 32px 48px',
    }}>
      {/* Logo */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
        <svg width="80" height="100" viewBox="0 0 80 100" fill="none">
          <ellipse cx="40" cy="95" rx="20" ry="5" fill="rgba(0,0,0,0.18)" />
          <path d="M40 0C24.536 0 12 12.536 12 28c0 20 28 60 28 60s28-40 28-60C68 12.536 55.464 0 40 0z" fill="#E8002D"/>
          <circle cx="40" cy="28" r="11" fill="white"/>
          <path d="M40 22l2.06 4.18 4.62.67-3.34 3.25.79 4.6L40 32.52l-4.13 2.18.79-4.6-3.34-3.25 4.62-.67L40 22z" fill="#E8002D"/>
        </svg>

        <div style={{ textAlign: 'center' }}>
          <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 700, fontFamily: 'Inter, sans-serif', letterSpacing: -0.5 }}>
            Campus Explorer
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 15, marginTop: 8, fontFamily: 'Inter, sans-serif' }}>
            Explore o campus da UCS e desbloqueie locais
          </p>
        </div>
      </div>

      {/* Botões */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button className="btn btn-primario" style={{ background: '#fff', color: '#0051E8', borderRadius: 24 }} onClick={() => navigate('/login')}>
          Entrar
        </button>
        <button className="btn btn-secundario" onClick={() => navigate('/cadastro')}>
          Cadastrar-se
        </button>
      </div>
    </div>
  );
}
