import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Abertura from './pages/Abertura';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import Mapa from './pages/Mapa';
import Passaporte from './pages/Passaporte';
import Local from './pages/Local';
import Perfil from './pages/Perfil';
import Ranking from './pages/Ranking';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Abertura />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/mapa" element={<ProtectedRoute><Mapa /></ProtectedRoute>} />
          <Route path="/passaporte" element={<ProtectedRoute><Passaporte /></ProtectedRoute>} />
          <Route path="/local/:id" element={<ProtectedRoute><Local /></ProtectedRoute>} />
          <Route path="/perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
          <Route path="/ranking" element={<ProtectedRoute><Ranking /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
