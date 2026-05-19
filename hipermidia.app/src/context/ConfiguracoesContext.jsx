import { createContext, useContext, useState } from 'react';

const ConfiguracoesContext = createContext(null);

export function ConfiguracoesProvider({ children }) {
  const [somAtivo, setSomAtivo] = useState(() => {
    const v = localStorage.getItem('cfg_som');
    return v === null ? true : v === 'true';
  });

  const [vibracaoAtiva, setVibracaoAtiva] = useState(() => {
    const v = localStorage.getItem('cfg_vibracao');
    return v === null ? true : v === 'true';
  });

  function toggleSom() {
    setSomAtivo(prev => {
      const novo = !prev;
      localStorage.setItem('cfg_som', String(novo));
      return novo;
    });
  }

  function toggleVibracao() {
    setVibracaoAtiva(prev => {
      const novo = !prev;
      localStorage.setItem('cfg_vibracao', String(novo));
      return novo;
    });
  }

  function tocarSom(url) {
    if (!somAtivo) return;
    new Audio(url).play().catch(() => {});
  }

  function vibrar(padrao = [60]) {
    if (!vibracaoAtiva) return;
    if (navigator.vibrate) navigator.vibrate(padrao);
  }

  return (
    <ConfiguracoesContext.Provider value={{ somAtivo, vibracaoAtiva, toggleSom, toggleVibracao, tocarSom, vibrar }}>
      {children}
    </ConfiguracoesContext.Provider>
  );
}

export function useConfiguracoes() {
  return useContext(ConfiguracoesContext);
}
