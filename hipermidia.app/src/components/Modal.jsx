import { useState } from 'react';
import './Modal.scss';

const DURACAO = 180;

export default function Modal({ icone, titulo, children, botoes = [], onClose, fecharBtn = false }) {
  const [saindo, setSaindo] = useState(false);

  function fechar(cb) {
    setSaindo(true);
    setTimeout(() => cb?.(), DURACAO);
  }

  return (
    <div className={`modal-overlay${saindo ? ' modal-overlay--saindo' : ''}`} onClick={() => onClose && fechar(onClose)}>
      <div className={`modal-card${saindo ? ' modal-card--saindo' : ''}`} onClick={e => e.stopPropagation()}>
        {fecharBtn && (
          <button className="modal-local__fechar btn btn-secondary" onClick={() => fechar(onClose)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
            </svg>
          </button>
        )}
        {icone && <p className="modal-local__icone">{icone}</p>}
        {titulo && <h3 className="modal-local__titulo">{titulo}</h3>}
        {children}
        {botoes.map((b, i) => (
          <button key={i} className="btn btn-primario" onClick={() => fechar(b.onClick)} disabled={b.disabled}>
            {b.label}
          </button>
        ))}
      </div>
    </div>
  );
}
