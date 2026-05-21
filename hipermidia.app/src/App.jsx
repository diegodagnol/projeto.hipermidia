import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProgressoProvider } from './context/ProgressoContext';
import { ConfiguracoesProvider } from './context/ConfiguracoesContext';
import ProtectedRoute from './components/ProtectedRoute';
import Abertura from './pages/Abertura';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import RecuperarSenha from './pages/RecuperarSenha';
import Mapa from './pages/Mapa';
import Passaporte from './pages/Passaporte';
import Local from './pages/Local';
import Perfil from './pages/Perfil';
import MeusDados from './pages/MeusDados';
import Configuracoes from './pages/Configuracoes';
import Ranking from './pages/Ranking';

// Layout único para rotas protegidas — ProgressoProvider persiste entre navegações
function LayoutProtegido() {
  return (
    <ProtectedRoute>
      <ConfiguracoesProvider>
        <ProgressoProvider>
          <Outlet />
        </ProgressoProvider>
      </ConfiguracoesProvider>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Abertura />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/recuperar-senha" element={<RecuperarSenha />} />
          <Route element={<LayoutProtegido />}>
            <Route path="/mapa" element={<Mapa />} />
            <Route path="/passaporte" element={<Passaporte />} />
            <Route path="/local/:id" element={<Local />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/perfil/meus-dados" element={<MeusDados />} />
            <Route path="/perfil/configuracoes" element={<Configuracoes />} />
            <Route path="/ranking" element={<Ranking />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
