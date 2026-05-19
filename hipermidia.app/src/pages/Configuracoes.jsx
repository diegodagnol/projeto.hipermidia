import { useNavigate } from 'react-router-dom';
import { useConfiguracoes } from '../context/ConfiguracoesContext';
import './Configuracoes.scss';

export default function Configuracoes() {
  const navigate = useNavigate();
  const { somAtivo, vibracaoAtiva, toggleSom, toggleVibracao } = useConfiguracoes();

  return (
    <div className="config-pagina">
      <header className="config-header">
        <button onClick={() => navigate(-1)} className="btn btn-secundario config-voltar" aria-label="Voltar">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5" />
          </svg>
        </button>
        <h1 className="config-titulo">Configurações</h1>
      </header>

      <div className="config-corpo fade-up">
        <section className="config-secao">
          <h2 className="config-secao__titulo">Preferências</h2>

          <div className="config-item">
            <div className="config-item__info">
              <span className="config-item__label">Sons</span>
              <span className="config-item__desc">Efeitos sonoros ao interagir com o mapa</span>
            </div>
            <label className="switch">
              <input type="checkbox" checked={somAtivo} onChange={toggleSom} />
              <span className="switch__trilho" />
            </label>
          </div>

          <div className="config-item">
            <div className="config-item__info">
              <span className="config-item__label">Vibração</span>
              <span className="config-item__desc">Vibrar ao fazer check-in em um local</span>
            </div>
            <label className="switch">
              <input type="checkbox" checked={vibracaoAtiva} onChange={toggleVibracao} />
              <span className="switch__trilho" />
            </label>
          </div>

        </section>
      </div>
    </div>
  );
}
