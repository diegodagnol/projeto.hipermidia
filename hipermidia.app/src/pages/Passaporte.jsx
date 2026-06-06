import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import NavInferior from '../components/NavInferior';
import Contador from '../components/Contador';
import Modal from '../components/Modal';
import './Passaporte.scss';

const VITE_API_URL = import.meta.env.VITE_API_URL || '';

const IconeLupa = () => (
  <svg
    className="passaporte-busca-icone"
    width="18" height="18" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export default function Passaporte() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [locais, setLocais] = useState([]);
  const [checkpoints, setCheckpoints] = useState(new Set());
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [modalBloqueado, setModalBloqueado] = useState(null);

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
    const filtrados = termo
      ? locais.filter(l =>
          l.nome.toLowerCase().includes(termo) ||
          (l.descricao && l.descricao.toLowerCase().includes(termo))
        )
      : locais;
    return [...filtrados].sort((a, b) => {
      const aVisitado = checkpoints.has(a.id) ? 0 : 1;
      const bVisitado = checkpoints.has(b.id) ? 0 : 1;
      return aVisitado - bVisitado;
    });
  }, [locais, busca, checkpoints]);

  return (
    <div className="pagina">
      <Contador page="passaporte" />

      <div className="pagina-conteudo">
        <h1 className="pagina-titulo">Passaporte</h1>

        {/* Barra de busca */}
        <div className="passaporte-busca">
          <IconeLupa />
          <input
            type="search"
            placeholder="Buscar local..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
          />
        </div>

        {/* Lista */}
        {carregando ? (
          <div className="passaporte-vazio">Carregando...</div>
        ) : locaisFiltrados.length === 0 ? (
          <div className="passaporte-vazio">Nenhum local encontrado.</div>
        ) : (
          <div className="passaporte-lista">
            {locaisFiltrados.map(local => {
              const visitado = checkpoints.has(local.id);
              const imgUrl = local.foto_url
                ? (local.foto_url.startsWith('http') ? local.foto_url : `${VITE_API_URL}${local.foto_url}`)
                : null;

              return (
                <div
                  key={local.id}
                  className={`passaporte-card fade-up ${!visitado ? "passaporte-bloqueado" : ""}`}
                  onClick={() => visitado ? navigate(`/local/${local.id}`) : setModalBloqueado(local)}
                >
                  <div className="passaporte-card-imagem">
                    {imgUrl && <img src={imgUrl} alt={local.nome} />}
                  </div>

                  <div className="passaporte-card-texto">
                    <p className="passaporte-card-nome">{local.nome}</p>
                    {local.descricao && (
                      <p className="passaporte-card-descricao">{local.descricao}</p>
                    )}
                  </div>

                  {visitado && (
                    <div className="passaporte-card-badge">✓</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {modalBloqueado && (
        <Modal
          icone="🔒"
          titulo={modalBloqueado.nome}
          onClose={() => setModalBloqueado(null)}
          botoes={[{ label: 'Entendi!', onClick: () => setModalBloqueado(null) }]}
        >
          <p className="modal-local__texto">
            Aproxime-se para fazer o check-in e desbloquear o conteúdo deste local.
          </p>
        </Modal>
      )}

      <NavInferior ativo="passaporte" />
    </div>
  );
}
