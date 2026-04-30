import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', senha: '' });
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    setCarregando(true);
    try {
      await login(form.email, form.senha);
      navigate('/mapa');
    } catch (err) {
      setErro(err?.erro || 'Credenciais inválidas. Verifique e tente novamente.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div style={{
      minHeight: '100dvh',
      background: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{ width: '100%', maxWidth: 360 }} className="fade-up">
        <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 28, color: 'var(--texto)' }}>Login</h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="campo">
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              value={form.email}
              onChange={handleChange}
              placeholder="E-mail"
            />
          </div>
          <div className="campo">
            <input
              name="senha"
              type="password"
              autoComplete="current-password"
              required
              value={form.senha}
              onChange={handleChange}
              placeholder="Senha"
            />
          </div>

          {erro && <p className="erro-campo" style={{ fontSize: 14 }}>{erro}</p>}

          <button type="submit" className="btn btn-primario" disabled={carregando} style={{ marginTop: 8 }}>
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--texto-suave)', fontSize: 14 }}>
          Não tem conta?{' '}
          <Link to="/cadastro" style={{ color: 'var(--azul)', fontWeight: 600 }}>Criar conta</Link>
        </p>
      </div>
    </div>
  );
}
