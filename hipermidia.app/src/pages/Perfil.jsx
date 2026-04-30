import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NavInferior from '../components/NavInferior';

const ChevronDir = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C7C7CC" strokeWidth="2" strokeLinecap="round">
    <path d="M9 18l6-6-6-6"/>
  </svg>
);

const ITENS_MENU = [
  { label: 'Meus dados', rota: null },
  { label: 'Configurações', rota: null },
  { label: 'Sobre o projeto', rota: null },
  { label: 'Ajuda', rota: null },
];

export default function Perfil() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <div className="pagina">
      {/* Header mínimo */}
      <div className="header">
        <span style={{ fontSize: 17, fontWeight: 700 }}>Perfil</span>
      </div>

      <div className="pagina-conteudo fade-up">
        {/* Avatar + nome */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '8px 4px' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'var(--azul)', color: '#fff',
            fontSize: 26, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            {usuario.nome.charAt(0).toUpperCase()}
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: 18 }}>{usuario.nome}</p>
            <p style={{ color: 'var(--texto-suave)', fontSize: 14, marginTop: 2 }}>@{usuario.usuario}</p>
          </div>
        </div>

        {/* Menu de itens */}
        <div style={{ background: '#fff', borderRadius: 'var(--raio)', overflow: 'hidden', boxShadow: 'var(--sombra)' }}>
          {ITENS_MENU.map((item, idx) => (
            <button
              key={item.label}
              onClick={() => item.rota && navigate(item.rota)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px 20px', background: 'transparent', border: 'none', cursor: 'pointer',
                borderBottom: idx < ITENS_MENU.length - 1 ? '1px solid var(--cinza-borda)' : 'none',
                fontSize: 15, fontWeight: 500, fontFamily: 'Inter, sans-serif', color: 'var(--texto)',
                textAlign: 'left',
              }}
            >
              {item.label}
              <ChevronDir />
            </button>
          ))}
        </div>

        {/* Ranking */}
        <button
          onClick={() => navigate('/ranking')}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 20px', background: '#fff', border: 'none', cursor: 'pointer',
            borderRadius: 'var(--raio)', boxShadow: 'var(--sombra)',
            fontSize: 15, fontWeight: 500, fontFamily: 'Inter, sans-serif', color: 'var(--texto)',
          }}
        >
          <span>🏆 Ranking</span>
          <ChevronDir />
        </button>

        {/* Sair */}
        <button
          onClick={handleLogout}
          style={{
            width: '100%', padding: '16px 20px',
            background: '#FFF0F0', border: 'none', cursor: 'pointer',
            borderRadius: 'var(--raio)', boxShadow: 'var(--sombra)',
            fontSize: 15, fontWeight: 600, fontFamily: 'Inter, sans-serif',
            color: 'var(--vermelho)', textAlign: 'left',
          }}
        >
          Sair
        </button>
      </div>

      <NavInferior ativo="perfil" />
    </div>
  );
}
