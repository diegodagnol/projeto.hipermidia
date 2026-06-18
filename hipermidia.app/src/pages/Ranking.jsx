import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import NavInferior from '../components/NavInferior';
import Modal from '../components/Modal';
import './Ranking.scss';

// 'combinado' = taxa checkpoints/tempo | 'checkpoints' = só contagem
const MODO_RANKING = 'checkpoints';
// true = exibe tempo decorrido no card
const MOSTRAR_TEMPO = true;

const MEDALHAS = ['🥇', '🥈', '🥉'];

function formatarTempo(segundos) {
  if (segundos == null || segundos <= 0) return null;
  if (segundos < 3600) return `${Math.round(segundos / 60)}min`;
  const h = Math.floor(segundos / 3600);
  const m = Math.round((segundos % 3600) / 60);
  if (segundos < 86400) return m > 0 ? `${h}h${m}min` : `${h}h`;
  return `${Math.floor(segundos / 86400)} dias`;
}

const TEXTOS_REGRAS = {
  combinado: [
    <>A classificação combina <strong>quantidade de locais visitados</strong> com <strong>velocidade de exploração</strong>. Quem visitar mais locais em menos tempo desde o cadastro fica na frente.</>,
    <>O tempo é contado a partir do cadastro até o último check-in realizado.</>,
  ],
  checkpoints: [
    <>A classificação é definida pelo <strong>número de locais visitados</strong>. Quanto mais check-ins, maior a posição.</>,
    <>Em caso de empate, fica à frente quem completou os locais em <strong>menos tempo desde o cadastro</strong>.</>,
  ],
};

export default function Ranking() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [ranking, setRanking] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [mostrarRegras, setMostrarRegras] = useState(false);

  useEffect(() => {
    api.get('/usuarios/ranking')
      .then(setRanking)
      .finally(() => setCarregando(false));
  }, []);

  return (
    <div className="pagina pagina-ranking">
      <header className="ranking-header">
        <button
          onClick={() => navigate(-1)}
          className="btn btn-secundario ranking-voltar"
          aria-label="Voltar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5" />
          </svg>
        </button>
        <h1 className="ranking-titulo">Ranking</h1>
        <button className="ranking-ajuda" onClick={() => setMostrarRegras(true)} aria-label="Regras do ranking">
          ?
        </button>
      </header>

      {mostrarRegras && (
        <Modal
          icone="🏆"
          titulo="Como funciona o ranking"
          onClose={() => setMostrarRegras(false)}
          fecharBtn
          botoes={[{ label: 'Entendi', onClick: () => setMostrarRegras(false) }]}
        >
          {TEXTOS_REGRAS[MODO_RANKING].map((texto, i) => (
            <p key={i} className="modal-local__texto">{texto}</p>
          ))}
        </Modal>
      )}

      <div className="pagina-conteudo fade-up">
        {carregando ? (
          <div className="ranking-vazio">Carregando...</div>
        ) : ranking.length === 0 ? (
          <div className="ranking-vazio">
            <span className="ranking-vazio__icone">🏆</span>
            <p>Nenhum explorador ainda.</p>
          </div>
        ) : (
          <div className="card ranking-lista">
            {ranking.map((item, idx) => {
              const ehVoce = item.id === usuario.id;
              const tempo = MOSTRAR_TEMPO ? formatarTempo(item.segundos_para_completar) : null;
              return (
                <div key={item.id} className={`ranking-item${ehVoce ? ' ranking-item--voce' : ''}${idx < ranking.length - 1 ? ' ranking-item--borda' : ''}`}>

                  <div className="ranking-item__posicao">
                    {idx < 3
                      ? <span className="ranking-item__medalha">{MEDALHAS[idx]}</span>
                      : <span className="ranking-item__numero">{idx + 1}</span>
                    }
                  </div>

                  <div className={`ranking-item__avatar${ehVoce ? ' ranking-item__avatar--voce' : ''}`}>
                    {item.nome.charAt(0).toUpperCase()}
                  </div>

                  <div className="ranking-item__info">
                    <p className={`ranking-item__nome${ehVoce ? ' ranking-item__nome--voce' : ''}`}>
                      <span className="ranking-item__nome-texto">{item.nome}</span>
                      {ehVoce && <span className="ranking-item__badge">você</span>}
                    </p>
                    <p className="ranking-item__usuario">@{item.usuario}</p>
                  </div>

                  <div className="ranking-item__pontos">
                    <p className={`ranking-item__total${idx === 0 ? ' ranking-item__total--ouro' : ''}`}>
                      {item.total_checkpoints}
                    </p>
                    <p className="ranking-item__label">{item.total_checkpoints === 1 ? 'local' : 'locais'}</p>
                    {tempo && <p className="ranking-item__tempo">{tempo}</p>}
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
