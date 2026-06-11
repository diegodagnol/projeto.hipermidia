import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import './Ajuda.scss';

const FAQ = [
  {
    pergunta: 'Como faço check-in em um local?',
    resposta: 'Abra o mapa, toque no marcador do local desejado e pressione o botão "Check-in". Você precisa estar próximo ao local para que o check-in seja registrado.',
  },
  {
    pergunta: 'Os pontos somem se eu sair do app?',
    resposta: 'Não. Todos os seus check-ins ficam salvos na sua conta e são carregados automaticamente quando você entrar novamente.',
  },
  {
    pergunta: 'Como funciona o ranking?',
    resposta: 'O ranking é calculado pelo número de locais visitados. Quanto mais check-ins você fizer, mais alto você sobe na classificação.',
  },
  {
    pergunta: 'Posso fazer check-in no mesmo local mais de uma vez?',
    resposta: 'Não. Cada local só pode ser registrado uma vez por usuário.',
  },
  {
    pergunta: 'Esqueci minha senha, o que faço?',
    resposta: 'No momento não há recuperação de senha automática. Entre em contato pelo formulário abaixo e nós te ajudamos.',
  },
];

function ItemFaq({ pergunta, resposta }) {
  const [aberto, setAberto] = useState(false);
  return (
    <div className={`faq-item ${aberto ? 'faq-item--aberto' : ''}`}>
      <button className="faq-item__pergunta" onClick={() => setAberto(v => !v)}>
        <span>{pergunta}</span>
        <svg className="faq-item__seta" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {aberto && <p className="faq-item__resposta">{resposta}</p>}
    </div>
  );
}

const ESTADO_INICIAL = { nome: '', email: '', assunto: '', mensagem: '' };

export default function Ajuda() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [form, setForm] = useState({
    ...ESTADO_INICIAL,
    nome: usuario?.nome ?? '',
    email: usuario?.email ?? '',
  });
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState('');

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    setEnviando(true);
    try {
      await api.post('/mensagens', form);
      setSucesso(true);
      setForm(f => ({ ...ESTADO_INICIAL, nome: f.nome, email: f.email }));
    } catch (err) {
      setErro(err?.erro || 'Erro ao enviar mensagem. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="ajuda-pagina">
      <header className="ajuda-header">
        <button onClick={() => navigate(-1)} className="btn btn-secundario ajuda-voltar" aria-label="Voltar">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5" />
          </svg>
        </button>
        <h1 className="ajuda-titulo">Ajuda</h1>
      </header>

      <div className="ajuda-corpo fade-up">

        <section className="ajuda-secao">
          <h2 className="ajuda-secao__titulo">Perguntas frequentes</h2>
          <div className="faq-lista">
            {FAQ.map(item => (
              <ItemFaq key={item.pergunta} pergunta={item.pergunta} resposta={item.resposta} />
            ))}
          </div>
        </section>

        <section className="ajuda-secao">
          <h2 className="ajuda-secao__titulo">Fale conosco</h2>
          <p className="ajuda-secao__desc">Não encontrou o que precisava? Envie uma mensagem.</p>

          {sucesso ? (
            <div className="ajuda-sucesso">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <p>Mensagem enviada! Entraremos em contato em breve.</p>
              <button className="btn btn-secundario" onClick={() => setSucesso(false)}>
                Enviar outra mensagem
              </button>
            </div>
          ) : (
            <form className="ajuda-form" onSubmit={handleSubmit}>
              <div className="ajuda-form__campo">
                <label htmlFor="nome">Nome</label>
                <input id="nome" name="nome" type="text" value={form.nome} onChange={handleChange} required maxLength={255} />
              </div>
              <div className="ajuda-form__campo">
                <label htmlFor="email">E-mail</label>
                <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required maxLength={255} />
              </div>
              <div className="ajuda-form__campo">
                <label htmlFor="assunto">Assunto</label>
                <input id="assunto" name="assunto" type="text" value={form.assunto} onChange={handleChange} required maxLength={255} placeholder="Ex: Problema no check-in" />
              </div>
              <div className="ajuda-form__campo">
                <label htmlFor="mensagem">Mensagem</label>
                <textarea id="mensagem" name="mensagem" rows={4} value={form.mensagem} onChange={handleChange} required maxLength={2000} placeholder="Descreva sua dúvida ou problema..." />
              </div>
              {erro && <p className="ajuda-form__erro">{erro}</p>}
              <button type="submit" className="btn btn-primario ajuda-form__enviar" disabled={enviando}>
                {enviando ? 'Enviando…' : 'Enviar mensagem'}
              </button>
            </form>
          )}
        </section>

      </div>
    </div>
  );
}
