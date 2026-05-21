import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import SenhaRequisitos, { senhaValida } from '../components/SenhaRequisitos';
import './RecuperarSenha.scss';

export default function RecuperarSenha() {
  const navigate = useNavigate();
  const [etapa, setEtapa] = useState('email'); // 'email' | 'codigo' | 'senha' | 'sucesso'
  const [emailVal, setEmailVal] = useState('');
  const [codigo, setCodigo] = useState('');
  const [token, setToken] = useState('');
  const [form, setForm] = useState({ nova_senha: '', confirmar: '' });
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (countdown <= 0) return;
    timerRef.current = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [countdown]);

  function voltar() {
    setErro('');
    if (etapa === 'email') navigate('/login');
    else if (etapa === 'codigo') setEtapa('email');
    else if (etapa === 'senha') setEtapa('codigo');
  }

  async function solicitarCodigo(e) {
    if (e) e.preventDefault();
    setErro('');
    setCarregando(true);
    try {
      await api.post('/recuperacao-senha/solicitar', { email: emailVal });
      setEtapa('codigo');
      setCountdown(30);
    } catch {
      setErro('Não foi possível enviar o código. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  }

  async function verificarCodigo(e) {
    e.preventDefault();
    setErro('');
    setCarregando(true);
    try {
      const data = await api.post('/recuperacao-senha/verificar', { email: emailVal, codigo });
      setToken(data.token);
      setEtapa('senha');
    } catch (err) {
      setErro(err?.erro || 'Código inválido ou expirado.');
    } finally {
      setCarregando(false);
    }
  }

  async function redefinirSenha(e) {
    e.preventDefault();
    setErro('');
    if (!senhaValida(form.nova_senha)) {
      setErro('A senha não atende todos os requisitos.');
      return;
    }
    if (form.nova_senha !== form.confirmar) {
      setErro('As senhas não coincidem.');
      return;
    }
    setCarregando(true);
    try {
      await api.post('/recuperacao-senha/redefinir', { token, nova_senha: form.nova_senha });
      setEtapa('sucesso');
    } catch (err) {
      setErro(err?.erro || 'Não foi possível redefinir a senha. Solicite um novo código.');
    } finally {
      setCarregando(false);
    }
  }

  const etapas = ['email', 'codigo', 'senha'];
  const etapaIdx = etapas.indexOf(etapa);

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

        {etapa !== 'sucesso' && (
          <>
            <button className="recuperar-senha__voltar" onClick={voltar} aria-label="Voltar" type="button">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>

            <div className="recuperar-senha__passos">
              {etapas.map((e, i) => (
                <span key={e} className={i <= etapaIdx ? 'ativo' : ''} />
              ))}
            </div>
          </>
        )}

        {etapa === 'email' && (
          <>
            <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8, color: 'var(--texto)' }}>
              Esqueci minha senha
            </h2>
            <p style={{ fontSize: 14, color: 'var(--texto-suave)', marginBottom: 28 }}>
              Informe seu e-mail e enviaremos um código de verificação.
            </p>
            <form onSubmit={solicitarCodigo} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="campo">
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={emailVal}
                  onChange={e => setEmailVal(e.target.value)}
                  placeholder="Seu e-mail"
                />
              </div>
              {erro && <p className="erro-campo" style={{ fontSize: 14 }}>{erro}</p>}
              <button type="submit" className="btn btn-primario" disabled={carregando} style={{ marginTop: 8 }}>
                {carregando ? 'Enviando...' : 'Enviar código'}
              </button>
            </form>
          </>
        )}

        {etapa === 'codigo' && (
          <>
            <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8, color: 'var(--texto)' }}>
              Verifique seu e-mail
            </h2>
            <p style={{ fontSize: 14, color: 'var(--texto-suave)', marginBottom: 28 }}>
              Enviamos um código de 6 dígitos para <strong>{emailVal}</strong>. Pode demorar alguns instantes.
            </p>
            <form onSubmit={verificarCodigo} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="campo">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  pattern="\d{6}"
                  autoComplete="one-time-code"
                  required
                  value={codigo}
                  onChange={e => setCodigo(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  style={{ letterSpacing: 6, fontSize: 22, textAlign: 'center' }}
                />
              </div>
              {erro && <p className="erro-campo" style={{ fontSize: 14 }}>{erro}</p>}
              <button type="submit" className="btn btn-primario" disabled={carregando} style={{ marginTop: 8 }}>
                {carregando ? 'Verificando...' : 'Confirmar código'}
              </button>
            </form>
            <p style={{ textAlign: 'center', marginTop: 16, fontSize: 14, color: 'var(--texto-suave)' }}>
              Não recebeu?{' '}
              <button
                type="button"
                className="recuperar-senha__reenviar"
                disabled={countdown > 0}
                onClick={solicitarCodigo}
              >
                {countdown > 0 ? `Reenviar em ${countdown}s` : 'Reenviar código'}
              </button>
            </p>
          </>
        )}

        {etapa === 'senha' && (
          <>
            <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8, color: 'var(--texto)' }}>
              Nova senha
            </h2>
            <p style={{ fontSize: 14, color: 'var(--texto-suave)', marginBottom: 28 }}>
              Escolha uma senha forte para sua conta.
            </p>
            <form onSubmit={redefinirSenha} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="campo">
                <input
                  type="password"
                  autoComplete="new-password"
                  required
                  value={form.nova_senha}
                  onChange={e => setForm(f => ({ ...f, nova_senha: e.target.value }))}
                  placeholder="Nova senha"
                />
              </div>
              <SenhaRequisitos valor={form.nova_senha} />
              <div className="campo">
                <input
                  type="password"
                  autoComplete="new-password"
                  required
                  value={form.confirmar}
                  onChange={e => setForm(f => ({ ...f, confirmar: e.target.value }))}
                  placeholder="Confirmar senha"
                />
              </div>
              {erro && <p className="erro-campo" style={{ fontSize: 14 }}>{erro}</p>}
              <button type="submit" className="btn btn-primario" disabled={carregando} style={{ marginTop: 8 }}>
                {carregando ? 'Salvando...' : 'Salvar nova senha'}
              </button>
            </form>
          </>
        )}

        {etapa === 'sucesso' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, color: 'var(--texto)' }}>
              Senha atualizada!
            </h2>
            <p style={{ fontSize: 14, color: 'var(--texto-suave)', marginBottom: 32 }}>
              Sua senha foi redefinida com sucesso. Faça login com a nova senha.
            </p>
            <Link to="/login" className="btn btn-primario" style={{ display: 'block' }}>
              Ir para o login
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
