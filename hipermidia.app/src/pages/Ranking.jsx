import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import NavInferior from '../components/NavInferior';

const MEDALHAS = ['🥇', '🥈', '🥉'];

export default function Ranking() {
  const { usuario } = useAuth();
  const [ranking, setRanking] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    api.get('/usuarios/ranking')
      .then(setRanking)
      .finally(() => setCarregando(false));
  }, []);

  return (
    <div className="pagina">
      <div className="header">
        <span>🏆</span>
        <span>Ranking</span>
      </div>

      <div className="pagina-conteudo fade-up">
        {carregando ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--texto-suave)' }}>Carregando...</div>
        ) : ranking.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--texto-suave)' }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>🏆</div>
            <p>Nenhum explorador ainda.</p>
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {ranking.map((item, idx) => {
              const ehVoce = item.id === usuario.id;
              return (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '14px 16px',
                    background: ehVoce ? '#eff6ff' : 'transparent',
                    borderBottom: idx < ranking.length - 1 ? '1px solid var(--cinza-borda)' : 'none',
                  }}
                >
                  {/* Posição */}
                  <div style={{ width: 32, textAlign: 'center' }}>
                    {idx < 3 ? (
                      <span style={{ fontSize: 22 }}>{MEDALHAS[idx]}</span>
                    ) : (
                      <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--texto-suave)' }}>
                        {idx + 1}
                      </span>
                    )}
                  </div>

                  {/* Avatar */}
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: ehVoce ? 'var(--azul)' : '#e5e7eb',
                    color: ehVoce ? '#fff' : 'var(--texto)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 16, flexShrink: 0,
                  }}>
                    {item.nome.charAt(0).toUpperCase()}
                  </div>

                  {/* Nome */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: ehVoce ? 700 : 600, fontSize: 15, display: 'flex', alignItems: 'center', gap: 6 }}>
                      {item.nome}
                      {ehVoce && <span style={{ fontSize: 11, background: 'var(--azul)', color: '#fff', borderRadius: 99, padding: '1px 7px' }}>você</span>}
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--texto-suave)' }}>@{item.usuario}</p>
                  </div>

                  {/* Pontuação */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontWeight: 800, fontSize: 18, color: idx === 0 ? '#d97706' : 'var(--texto)' }}>
                      {item.total_checkpoints}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--texto-suave)' }}>locais</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <NavInferior ativo="ranking" />
    </div>
  );
}
