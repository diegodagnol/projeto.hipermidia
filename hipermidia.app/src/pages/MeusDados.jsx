import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import SenhaRequisitos, { senhaValida } from '../components/SenhaRequisitos';
import './MeusDados.scss';

export default function MeusDados() {
  const { usuario, atualizarUsuario } = useAuth();
  const navigate = useNavigate();

  const [dados, setDados] = useState({
    nome: usuario.nome || '',
    usuario: usuario.usuario || '',
    email: usuario.email || '',
  });
  const [errosDados, setErrosDados] = useState({});
  const [salvandoDados, setSalvandoDados] = useState(false);
  const [sucessoDados, setSucessoDados] = useState(false);

  const [senha, setSenha] = useState({ senha_atual: '', nova_senha: '', confirmar: '' });
  const [errosSenha, setErrosSenha] = useState({});
  const [salvandoSenha, setSalvandoSenha] = useState(false);
  const [sucessoSenha, setSucessoSenha] = useState(false);

  function handleChangeDados(e) {
    setDados(d => ({ ...d, [e.target.name]: e.target.value }));
    setErrosDados(er => ({ ...er, [e.target.name]: '' }));
    setSucessoDados(false);
  }

  function handleChangeSenha(e) {
    setSenha(s => ({ ...s, [e.target.name]: e.target.value }));
    setErrosSenha(er => ({ ...er, [e.target.name]: '' }));
    setSucessoSenha(false);
  }

  async function handleSalvarDados(e) {
    e.preventDefault();
    setSalvandoDados(true);
    setErrosDados({});
    setSucessoDados(false);
    try {
      const atualizado = await api.put(`/usuarios/${usuario.id}`, dados);
      atualizarUsuario(atualizado);
      setSucessoDados(true);
    } catch (err) {
      if (err?.erros) {
        const mapa = {};
        err.erros.forEach(e => { mapa[e.path] = e.msg; });
        setErrosDados(mapa);
      } else if (err?.erro) {
        const msg = err.erro;
        if (msg.toLowerCase().includes('e-mail')) setErrosDados({ email: msg });
        else if (msg.toLowerCase().includes('usuário') || msg.toLowerCase().includes('usuario')) setErrosDados({ usuario: msg });
        else setErrosDados({ geral: msg });
      } else {
        setErrosDados({ geral: 'Erro ao salvar. Tente novamente.' });
      }
    } finally {
      setSalvandoDados(false);
    }
  }

  async function handleSalvarSenha(e) {
    e.preventDefault();
    if (!senhaValida(senha.nova_senha)) {
      setErrosSenha({ nova_senha: 'A senha não atende todos os requisitos' });
      return;
    }
    if (senha.nova_senha !== senha.confirmar) {
      setErrosSenha({ confirmar: 'As senhas não conferem' });
      return;
    }
    setSalvandoSenha(true);
    setErrosSenha({});
    setSucessoSenha(false);
    try {
      await api.patch(`/usuarios/${usuario.id}/senha`, {
        senha_atual: senha.senha_atual,
        nova_senha: senha.nova_senha,
      });
      setSenha({ senha_atual: '', nova_senha: '', confirmar: '' });
      setSucessoSenha(true);
    } catch (err) {
      if (err?.erros) {
        const mapa = {};
        err.erros.forEach(e => { mapa[e.path] = e.msg; });
        setErrosSenha(mapa);
      } else if (err?.erro) {
        const msg = err.erro;
        if (msg.toLowerCase().includes('atual')) setErrosSenha({ senha_atual: msg });
        else setErrosSenha({ geral: msg });
      } else {
        setErrosSenha({ geral: 'Erro ao alterar senha. Tente novamente.' });
      }
    } finally {
      setSalvandoSenha(false);
    }
  }

  return (
    <div className="meus-dados-pagina">
      <header className="meus-dados-header">
        <button
          onClick={() => navigate(-1)}
          className="btn btn-secundario meus-dados-voltar"
          aria-label="Voltar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5" />
          </svg>
        </button>
        <h1 className="meus-dados-titulo">Meus dados</h1>
      </header>

      <div className="meus-dados-corpo fade-up">
        <section className="meus-dados-secao">
          <h2 className="meus-dados-secao__titulo">Dados pessoais</h2>
          <form onSubmit={handleSalvarDados}>
            <div className="campo">
              <label className="campo-label">Nome</label>
              <input name="nome" value={dados.nome} onChange={handleChangeDados} placeholder="Nome" />
              {errosDados.nome && <span className="erro-campo">{errosDados.nome}</span>}
            </div>
            <div className="campo">
              <label className="campo-label">Usuário</label>
              <input name="usuario" value={dados.usuario} onChange={handleChangeDados} placeholder="Usuário" autoCapitalize="none" />
              {errosDados.usuario && <span className="erro-campo">{errosDados.usuario}</span>}
            </div>
            <div className="campo">
              <label className="campo-label">E-mail</label>
              <input name="email" type="email" value={dados.email} placeholder="E-mail" disabled />
              {errosDados.email && <span className="erro-campo">{errosDados.email}</span>}
            </div>
            {errosDados.geral && <p className="erro-campo">{errosDados.geral}</p>}
            {sucessoDados && <p className="meus-dados-sucesso">Dados atualizados com sucesso!</p>}
            <button type="submit" className="btn btn-primario" disabled={salvandoDados}>
              {salvandoDados ? 'Salvando...' : 'Salvar dados'}
            </button>
          </form>
        </section>

        <div className="meus-dados-divisor" />

        <section className="meus-dados-secao">
          <h2 className="meus-dados-secao__titulo">Alterar senha</h2>
          <form onSubmit={handleSalvarSenha}>
            <div className="campo">
              <label className="campo-label">Senha atual</label>
              <input name="senha_atual" type="password" autoComplete="current-password" value={senha.senha_atual} onChange={handleChangeSenha} placeholder="Senha atual" />
              {errosSenha.senha_atual && <span className="erro-campo">{errosSenha.senha_atual}</span>}
            </div>
            <div className="campo">
              <label className="campo-label">Nova senha</label>
              <input name="nova_senha" type="password" autoComplete="new-password" value={senha.nova_senha} onChange={handleChangeSenha} placeholder="Mínimo 8 caracteres" />
              {errosSenha.nova_senha && <span className="erro-campo">{errosSenha.nova_senha}</span>}
            </div>
            <SenhaRequisitos valor={senha.nova_senha} />
            <div className="campo">
              <label className="campo-label">Confirmar nova senha</label>
              <input name="confirmar" type="password" autoComplete="new-password" value={senha.confirmar} onChange={handleChangeSenha} placeholder="Repita a nova senha" />
              {errosSenha.confirmar && <span className="erro-campo">{errosSenha.confirmar}</span>}
            </div>
            {errosSenha.geral && <p className="erro-campo">{errosSenha.geral}</p>}
            {sucessoSenha && <p className="meus-dados-sucesso">Senha alterada com sucesso!</p>}
            <button type="submit" className="btn btn-primario" disabled={salvandoSenha}>
              {salvandoSenha ? 'Alterando...' : 'Alterar senha'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
