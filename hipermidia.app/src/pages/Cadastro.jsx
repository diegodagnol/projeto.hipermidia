import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import SenhaRequisitos, { senhaValida } from '../components/SenhaRequisitos';
import CampoSenha from '../components/CampoSenha';

export default function Cadastro() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nome: '', usuario: '', email: '', senha: '' });
  const [erros, setErros] = useState({});
  const [carregando, setCarregando] = useState(false);

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setErros(er => ({ ...er, [e.target.name]: '' }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!senhaValida(form.senha)) {
      setErros({ senha: 'A senha não atende todos os requisitos' });
      return;
    }
    setErros({});
    setCarregando(true);
    try {
      await api.post('/usuarios', form);
      await login(form.email, form.senha);
      navigate('/mapa');
    } catch (err) {
      if (err?.erros) {
        // Erros de validação do express-validator (array)
        const mapa = {};
        err.erros.forEach(e => { mapa[e.path] = e.msg; });
        setErros(mapa);
      } else if (err?.erro) {
        // Erros de conflito (409) — mapeia para o campo correto
        const msg = err.erro;
        if (msg.toLowerCase().includes('e-mail'))
          setErros({ email: msg });
        else if (msg.toLowerCase().includes('usuário') || msg.toLowerCase().includes('usuario'))
          setErros({ usuario: msg });
        else
          setErros({ geral: msg });
      } else {
        setErros({ geral: 'Erro ao cadastrar. Tente novamente.' });
      }
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
        <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 28, color: 'var(--texto)' }}>Criar conta</h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="campo">
            <input name="nome" required value={form.nome} onChange={handleChange} placeholder="Nome" />
            {erros.nome && <span className="erro-campo">{erros.nome}</span>}
          </div>
          <div className="campo">
            <input name="usuario" required value={form.usuario} onChange={handleChange} placeholder="Usuário" />
            {erros.usuario && <span className="erro-campo">{erros.usuario}</span>}
          </div>
          <div className="campo">
            <input name="email" type="email" autoComplete="email" required value={form.email} onChange={handleChange} placeholder="E-mail" />
            {erros.email && <span className="erro-campo">{erros.email}</span>}
          </div>
          <div className="campo">
            <CampoSenha name="senha" autoComplete="new-password" required value={form.senha} onChange={handleChange} placeholder="Senha" />
            {erros.senha && <span className="erro-campo">{erros.senha}</span>}
          </div>
          <SenhaRequisitos valor={form.senha} />

          {erros.geral && <p className="erro-campo" style={{ fontSize: 14 }}>{erros.geral}</p>}

          <button type="submit" className="btn btn-primario" disabled={carregando} style={{ marginTop: 8 }}>
            {carregando ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--texto-suave)', fontSize: 14 }}>
          Já tenho uma conta.{' '}
          <Link to="/login" style={{ color: 'var(--azul)', fontWeight: 600 }}>Entrar</Link>
        </p>
      </div>
    </div>
  );
}
