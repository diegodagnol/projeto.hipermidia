import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Local.scss';
import Modal from '../components/Modal';

const VITE_API_URL = import.meta.env.VITE_API_URL || '';

export default function Local() {
  const { id } = useParams();
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [local, setLocal] = useState(null);
  const [desbloqueado, setDesbloqueado] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [modalBloqueado, setModalBloqueado] = useState(false);
  const capaRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (capaRef.current) {
        capaRef.current.style.transform = `translateY(${window.scrollY * 0.4}px)`;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      <div className="local-loading">
        <div className="spinner" />
      </div>
    );
  }

  if (!local) return null;

  return (
      <div className="local-pagina">
          {/* Foto de capa com back button sobreposto */}
          <div className="local-capa">
           
              {local.foto_url && (
                  <img
                      ref={capaRef}
                      src={local.foto_url ? (local.foto_url.startsWith('http') ? local.foto_url : `${VITE_API_URL}${local.foto_url}`) : null}
                      alt={local.nome}
                      className="local-capa__img"
                  />
              )}
              {/* Back button flutuante */}
              <button
                  onClick={() => navigate(-1)}
                  aria-label="Voltar"
                  className="local-voltar btn btn-secundario"
              >
                  <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      fill="currentColor"
                      class="bi bi-arrow-left-short"
                      viewBox="0 0 16 16"
                  >
                      <path
                          fill-rule="evenodd"
                          d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5"
                      />
                  </svg>
              </button>

              {desbloqueado && (
                  <span className="local-badge">✓ Desbloqueado</span>
              )}
          </div>

          {/* Conteúdo */}
          <div className="local-corpo fade-up">
              {/* Nome + badge */}
              <div className="local-header">
                  <h1 className="local-nome">{local.nome}</h1>
              </div>

              {/* Descrição */}
              {local.descricao && (
                  
                      <p className="local-descricao">{local.descricao}</p>
                 
              )}

              {/* Conteúdo rico — só após desbloqueio */}
              {desbloqueado && local.conteudo && (
                  <div className="local-conteudo">
                      <div
                          dangerouslySetInnerHTML={{ __html: local.conteudo }}
                      />
                  </div>
              )}

              {/* Coordenadas */}
              <p className="local-coords">
                  📍 {Number(local.latitude).toFixed(6)},{" "}
                  {Number(local.longitude).toFixed(6)}
              </p>
          </div>

          {modalBloqueado && (
              <Modal
                  icone="🔒"
                  titulo="Local bloqueado"
                  botoes={[
                      {
                          label: "Entendi!",
                          onClick: () => {
                              setModalBloqueado(false);
                              navigate("/mapa");
                          },
                      },
                  ]}
              >
                  <p className="modal-local__texto">
                      Aproxime-se para fazer o check-in e desbloquear o conteúdo
                      deste local.
                  </p>
              </Modal>
          )}
      </div>
  );
}
