import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Local.scss';

export default function Local() {
  const { id } = useParams();
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [local, setLocal] = useState(null);
  const [desbloqueado, setDesbloqueado] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [modalBloqueado, setModalBloqueado] = useState(false);

  useEffect(() => {
    async function carregar() {
      try {
        const [dadosLocal, checkpoints] = await Promise.all([
          api.get(`/locais/${id}`),
          api.get(`/usuarios/${usuario.id}/checkpoints`),
        ]);
        setLocal(dadosLocal);
        const visitados = new Set(checkpoints.map(c => c.checkpoint_id));
        const foiDesbloqueado = visitados.has(Number(id));
        setDesbloqueado(foiDesbloqueado);
        if (!foiDesbloqueado) setModalBloqueado(true);
      } catch {
        navigate('/mapa');
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, [id, usuario.id, navigate]);

  if (carregando) {
    return (
      <div style={{ height: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!local) return null;

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--cinza-bg)', paddingBottom: 32 }}>
      {/* Foto de capa com back button sobreposto */}
      <div style={{ position: 'relative', width: '100%', height: 240, background: '#E8E8E8' }}>
        {local.foto_url && (
          <img
            src={local.foto_url}
            alt={local.nome}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )}
        {/* Back button flutuante */}
        <button
          onClick={() => navigate(-1)}
          aria-label="Voltar"
          style={{
            position: 'absolute', top: 16, left: 16,
            width: 40, height: 40, borderRadius: '50%',
            background: '#fff', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2.5" strokeLinecap="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
      </div>

      {/* Conteúdo */}
      <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }} className="fade-up">
        {/* Nome + badge */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.25 }}>{local.nome}</h1>
          {desbloqueado && (
            <span style={{
              flexShrink: 0, background: '#dcfce7', color: '#16a34a',
              borderRadius: 99, padding: '4px 12px', fontSize: 12, fontWeight: 600,
            }}>
              ✓ Desbloqueado
            </span>
          )}
        </div>

        {/* Descrição */}
        {local.descricao && (
          <div className="card" style={{ padding: 16 }}>
            <p style={{ color: 'var(--texto-suave)', fontSize: 15, lineHeight: 1.6, fontFamily: 'Work Sans, sans-serif' }}>
              {local.descricao}
            </p>
          </div>
        )}

        {/* Conteúdo rico — só após desbloqueio */}
        {desbloqueado && local.conteudo && (
          <div className="card local-conteudo" style={{ padding: 16 }}>
            <div dangerouslySetInnerHTML={{ __html: local.conteudo }} />
          </div>
        )}

        {/* Coordenadas */}
        <p style={{ fontSize: 13, color: 'var(--texto-suave)', paddingLeft: 4 }}>
          📍 {Number(local.latitude).toFixed(6)}, {Number(local.longitude).toFixed(6)}
        </p>
      </div>

      {/* Modal Aviso Bloqueado */}
      {modalBloqueado && (
        <div className="modal-overlay">
          <div className="modal-card">
            <p style={{ fontSize: 28 }}>🔒</p>
            <h3 style={{ fontSize: 17, fontWeight: 700 }}>Local bloqueado</h3>
            <p style={{ fontSize: 14, color: 'var(--texto-suave)', lineHeight: 1.55 }}>
              Aproxime-se para fazer o check-in e desbloquear o conteúdo deste local.
            </p>
            <button
              className="btn btn-primario"
              onClick={() => { setModalBloqueado(false); navigate('/mapa'); }}
              style={{ marginTop: 4 }}
            >
              Entendi!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
