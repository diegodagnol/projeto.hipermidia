import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import NavInferior from '../components/NavInferior';

const VITE_API_URL = import.meta.env.VITE_API_URL || '';

export default function Passaporte() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [locais, setLocais] = useState([]);
  const [checkpoints, setCheckpoints] = useState(new Set());
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/locais'),
      api.get(`/usuarios/${usuario.id}/checkpoints`),
    ])
      .then(([ls, cps]) => {
        setLocais(ls);
        setCheckpoints(new Set(cps.map(c => c.checkpoint_id)));
      })
      .finally(() => setCarregando(false));
  }, [usuario.id]);

  const locaisFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return locais;
    return locais.filter(l =>
      l.nome.toLowerCase().includes(termo) ||
      (l.descricao && l.descricao.toLowerCase().includes(termo))
    );
  }, [locais, busca]);

  return (
    <div className="pagina">
      {/* Header */}
      <div className="header">
        <span style={{ fontSize: 17, fontWeight: 700 }}>Passaporte</span>
      </div>

      <div className="pagina-conteudo">
        {/* Barra de busca */}
        <div style={{ position: 'relative' }}>
          <svg
            style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--texto-suave)' }}
            width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="search"
            placeholder="Buscar local..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            style={{
              width: '100%', padding: '12px 14px 12px 42px',
              border: '1.5px solid var(--cinza-borda)', borderRadius: 12,
              fontSize: 15, fontFamily: 'Inter, sans-serif',
              background: '#fff', outline: 'none', color: 'var(--texto)',
            }}
          />
        </div>

        {/* Lista */}
        {carregando ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--texto-suave)' }}>Carregando...</div>
        ) : locaisFiltrados.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--texto-suave)' }}>
            Nenhum local encontrado.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {locaisFiltrados.map(local => {
              const visitado = checkpoints.has(local.id);
              const imgUrl = local.foto_url
                ? (local.foto_url.startsWith('http') ? local.foto_url : `${VITE_API_URL}${local.foto_url}`)
                : null;

              return (
                <div
                  key={local.id}
                  onClick={() => navigate(`/local/${local.id}`)}
                  className="fade-up"
                  style={{
                    background: '#fff',
                    borderRadius: 'var(--raio)',
                    padding: 12,
                    display: 'flex',
                    gap: 12,
                    alignItems: 'center',
                    cursor: 'pointer',
                    boxShadow: 'var(--sombra)',
                    position: 'relative',
                  }}
                >
                  {/* Imagem */}
                  <div style={{
                    width: 80, height: 80, borderRadius: 10, flexShrink: 0,
                    background: '#E8E8E8', overflow: 'hidden',
                  }}>
                    {imgUrl && (
                      <img src={imgUrl} alt={local.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                  </div>

                  {/* Texto */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{local.nome}</p>
                    {local.descricao && (
                      <p style={{
                        fontSize: 13, color: 'var(--texto-suave)', lineHeight: 1.45,
                        display: '-webkit-box', WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      }}>
                        {local.descricao}
                      </p>
                    )}
                  </div>

                  {/* Badge visitado */}
                  {visitado && (
                    <div style={{
                      position: 'absolute', top: 10, right: 12,
                      width: 24, height: 24, borderRadius: '50%',
                      background: 'var(--azul)', color: '#fff',
                      fontSize: 12, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      ✓
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <NavInferior ativo="passaporte" />
    </div>
  );
}
