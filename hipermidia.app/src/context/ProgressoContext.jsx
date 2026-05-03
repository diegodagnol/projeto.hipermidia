import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const ProgressoContext = createContext(null);

export function ProgressoProvider({ children }) {
  const { usuario } = useAuth();
  const [total, setTotal] = useState(null);
  const [visitados, setVisitados] = useState(null);

  const carregar = useCallback(() => {
    if (!usuario?.id) return;
    Promise.all([
      api.get('/locais'),
      api.get(`/usuarios/${usuario.id}/checkpoints`),
    ]).then(([locais, checkpoints]) => {
      setTotal(locais.length);
      setVisitados(checkpoints.length);
    }).catch(console.error);
  }, [usuario?.id]);

  // Busca apenas uma vez quando o usuário estiver disponível
  useEffect(() => {
    carregar();
  }, [carregar]);

  // Chamado após um check-in para incrementar sem refetch
  function incrementarVisitados() {
    setVisitados(v => (v ?? 0) + 1);
  }

  return (
    <ProgressoContext.Provider value={{ total, visitados, incrementarVisitados, carregar }}>
      {children}
    </ProgressoContext.Provider>
  );
}

export function useProgresso() {
  return useContext(ProgressoContext);
}
