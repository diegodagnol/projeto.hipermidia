import { useState, useRef, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import SenhaRequisitos, { senhaValida } from "../components/SenhaRequisitos";
import CampoSenha from "../components/CampoSenha";
import './Abertura.scss';

// ─── SVG do logo (reutilizado nos dois estados) ───────────────────────────────
const LogoSVG = ({ width = 72, height = 96 }) => (
  <svg width={width} height={height} viewBox="0 0 72 96" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0)">
      <path d="M72 35.9696C72 61.9747 36 96 36 96C36 96 0 61.9747 0 35.9696C0 16.0405 16.0541 0 36 0C55.9459 0 72 16.0405 72 35.9696Z" fill="#FF003B" />
      <g clipPath="url(#clip1)">
        <path d="M53.8485 48.461L55 46.6102L45.3561 37.0712L55 27.5322L53.8485 25.539L40.6061 28.9559L37.1515 16H34.8485L31.25 28.9559L18.1515 25.539L17 27.5322L26.6439 37.0712L17 46.6102L18.1515 48.461L31.25 45.0441L34.8485 58H37.1515L40.6061 45.0441L53.8485 48.461Z" fill="white" />
      </g>
    </g>
    <defs>
      <clipPath id="clip0"><rect width="72" height="96" fill="white" /></clipPath>
      <clipPath id="clip1"><rect width="38" height="42" fill="white" transform="translate(17 16)" /></clipPath>
    </defs>
  </svg>
);

// ─── Variantes ────────────────────────────────────────────────────────────────
const spring = { type: "spring", stiffness: 220, damping: 22 };

const botoesContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.14, delayChildren: 1 } },
};
const btnVariant = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

// ─── Formulários inline ───────────────────────────────────────────────────────
function FormLogin({ onCadastro }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ identificador: '', senha: '' });
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setErro(''); setCarregando(true);
    try {
      await login(form.identificador, form.senha);
      navigate('/mapa');
    } catch (err) {
      setErro(err?.erro || 'Credenciais inválidas.');
    } finally { setCarregando(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="painel-form__form">
      <h2 className="painel-form__titulo">Login</h2>
      <div className="campo">
        <input
          name="identificador"
          type="text"
          required
          value={form.identificador}
          onChange={set('identificador')}
          placeholder="E-mail ou usuário"
          autoComplete="username"
          autoCapitalize="none"
        />
      </div>
      <div className="campo">
        <CampoSenha name="senha" required value={form.senha} onChange={set('senha')} placeholder="Senha" autoComplete="current-password" />
      </div>
      {erro && <p className="erro-campo">{erro}</p>}
      <button type="submit" className="btn btn-primario" disabled={carregando}>
        {carregando ? 'Entrando...' : 'Entrar'}
      </button>
      <p className="painel-form__link">
        Não tem conta?{' '}
        <button type="button" onClick={onCadastro}>Criar conta</button>
      </p>
    </form>
  );
}

function FormCadastro({ onLogin }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nome: '', usuario: '', email: '', senha: '' });
  const [erros, setErros] = useState({});
  const [carregando, setCarregando] = useState(false);

  const set = (k) => (e) => {
    setForm(f => ({ ...f, [k]: e.target.value }));
    setErros(er => ({ ...er, [k]: '' }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (!senhaValida(form.senha)) {
      setErros({ senha: 'A senha não atende todos os requisitos' });
      return;
    }
    setErros({}); setCarregando(true);
    try {
      await api.post('/usuarios', form);
      await login(form.email, form.senha);
      navigate('/mapa');
    } catch (err) {
      if (err?.erros) {
        // Erros de validação do express-validator (array)
        const m = {};
        err.erros.forEach(e => { m[e.path] = e.msg; });
        setErros(m);
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
    } finally { setCarregando(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="painel-form__form">
      <h2 className="painel-form__titulo">Criar conta</h2>
      <div className="campo">
        <input name="nome" required value={form.nome} onChange={set('nome')} placeholder="Nome" />
        {erros.nome && <span className="erro-campo">{erros.nome}</span>}
      </div>
      <div className="campo">
        <input name="usuario" required value={form.usuario} onChange={set('usuario')} placeholder="Usuário" />
        {erros.usuario && <span className="erro-campo">{erros.usuario}</span>}
      </div>
      <div className="campo">
        <input name="email" type="email" required value={form.email} onChange={set('email')} placeholder="E-mail" autoComplete="email" />
        {erros.email && <span className="erro-campo">{erros.email}</span>}
      </div>
      <div className="campo">
        <CampoSenha name="senha" required value={form.senha} onChange={set('senha')} placeholder="Senha" autoComplete="new-password" />
        {erros.senha && <span className="erro-campo">{erros.senha}</span>}
      </div>
      <SenhaRequisitos valor={form.senha} />
      {erros.geral && <p className="erro-campo">{erros.geral}</p>}
      <button type="submit" className="btn btn-primario" disabled={carregando}>
        {carregando ? 'Criando conta...' : 'Criar conta'}
      </button>
      <p className="painel-form__link">
        Já tenho uma conta.{' '}
        <button type="button" onClick={onLogin}>Entrar</button>
      </p>
    </form>
  );
}

// ─── Tela principal ───────────────────────────────────────────────────────────
export default function Abertura() {
  const { usuario } = useAuth();
  const [tela, setTela] = useState('inicio'); // 'inicio' | 'login' | 'cadastro'
  const isInicio = tela === 'inicio';

  useEffect(() => {
    document.body.classList.add('body-login');

    return () => {
      document.body.classList.remove('body-login');
    };
  }, []);

  if (usuario) return <Navigate to="/mapa" replace />;

  return (
    <div className="abertura">
      {/* Esferas de blur decorativas */}
      <div className="circle-bg">
        <div className="circle-bg__1" />
        <div className="circle-bg__2" />
      </div>

      {/* ── Logo ── */}
      {isInicio ? (
        // Estado inicial: centralizado + float em loop
        <div className="logo-abertura">
          <motion.div
            layoutId="logo"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 240, damping: 14, delay: 0.15 }}
          >
            <motion.div
              animate={{ y: [0, -16, 0] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.9 }}
            >
              <LogoSVG />
            </motion.div>
          </motion.div>
        </div>
      ) : (
        // Estado formulário: pequeno no canto superior esquerdo
        <div className="logo-abertura-topo">
          <motion.div layoutId="logo" transition={spring}>
            <LogoSVG width={40} height={53} />
          </motion.div>
        </div>
      )}

      {/* ── Botões iniciais ── */}
      <div className="container-abertura">
        <AnimatePresence>
          {isInicio && (
            <motion.div
              className="btn-group-abertura"
              variants={botoesContainer}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: 24, transition: { duration: 0.2 } }}
            >
              <motion.button
                className="btn btn-primario"
                variants={btnVariant}
                whileTap={{ scale: 0.97 }}
                onClick={() => setTela('login')}
              >
                Entrar
              </motion.button>
              <motion.button
                className="btn btn-secundario"
                variants={btnVariant}
                whileTap={{ scale: 0.97 }}
                onClick={() => setTela('cadastro')}
              >
                Cadastrar-se
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Painel branco deslizante ── */}
      <AnimatePresence>
        {!isInicio && (
          <motion.div
            className="painel-form"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
          >
			<div className="container-login">
				{/* Botão voltar */}
				<button
				className="painel-form__voltar"
				onClick={() => setTela('inicio')}
				aria-label="Voltar"
				>
				<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
					<path d="M15 18l-6-6 6-6" />
				</svg>
				</button>

				{/* Conteúdo — troca entre login e cadastro com AnimatePresence */}
				<AnimatePresence mode="wait" initial={false}>
				{tela === 'login' ? (
					<motion.div
					key="login"
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					exit={{ opacity: 0, x: 20 }}
					transition={{ duration: 0.22 }}
					>
					<FormLogin onCadastro={() => setTela('cadastro')} />
					</motion.div>
				) : (
					<motion.div
					key="cadastro"
					initial={{ opacity: 0, x: 20 }}
					animate={{ opacity: 1, x: 0 }}
					exit={{ opacity: 0, x: -20 }}
					transition={{ duration: 0.22 }}
					>
					<FormCadastro onLogin={() => setTela('login')} />
					</motion.div>
				)}
				</AnimatePresence>
			</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
