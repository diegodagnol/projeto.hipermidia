import { useNavigate } from 'react-router-dom';
import './Sobre.scss';

export default function Sobre() {
  const navigate = useNavigate();

  return (
    <div className="sobre-pagina">
      <header className="sobre-header">
        <button onClick={() => navigate(-1)} className="btn btn-secundario sobre-voltar" aria-label="Voltar">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5" />
          </svg>
        </button>
        <h1 className="sobre-titulo">Sobre o projeto</h1>
      </header>

      <div className="sobre-corpo fade-up">

        <div className="sobre-hero">
          <div className="sobre-hero__icone">
            <svg width="48" height="48" viewBox="0 0 24 26" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M23.2727 20.0949L24 18.9492L17.9091 13.0441L24 7.13898L23.2727 5.90508L14.9091 8.02034L12.7273 0H11.2727L9 8.02034L0.727273 5.90508L0 7.13898L6.09091 13.0441L0 18.9492L0.727273 20.0949L9 17.9797L11.2727 26H12.7273L14.9091 17.9797L23.2727 20.0949Z" fill="white"/>
            </svg>
          </div>
          <h2 className="sobre-hero__nome">Explocus</h2>
          <p className="sobre-hero__tagline">Explore o campus. Colecione experiências.</p>
        </div>

        <section className="sobre-secao">
          <h3 className="sobre-secao__titulo">O que é</h3>
          <p className="sobre-secao__texto">
            O Explocus é um aplicativo de exploração do campus da UCS (Universidade de Caxias do Sul)
            desenvolvido como projeto de hipermídia. A proposta é transformar a descoberta dos espaços
            do campus em uma experiência interativa e gamificada.
          </p>
        </section>

        <section className="sobre-secao">
          <h3 className="sobre-secao__titulo">Como funciona</h3>
          <div className="sobre-passos">
            <div className="sobre-passo">
              <span className="sobre-passo__num">1</span>
              <div>
                <strong>Explore o mapa</strong>
                <p>Navegue pelo mapa interativo e descubra os pontos espalhados pelo campus.</p>
              </div>
            </div>
            <div className="sobre-passo">
              <span className="sobre-passo__num">2</span>
              <div>
                <strong>Faça check-in</strong>
                <p>Chegue ao local e registre sua visita para colecionar o ponto no seu passaporte.</p>
              </div>
            </div>
            <div className="sobre-passo">
              <span className="sobre-passo__num">3</span>
              <div>
                <strong>Suba no ranking</strong>
                <p>Quanto mais locais você visitar, mais pontos acumula e mais alto fica no ranking.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="sobre-secao">
          <h3 className="sobre-secao__titulo">Tecnologias</h3>
          <div className="sobre-tags">
            <span className="sobre-tag">React</span>
            <span className="sobre-tag">Leaflet</span>
            <span className="sobre-tag">Node.js</span>
            <span className="sobre-tag">PostgreSQL</span>
            <span className="sobre-tag">Express</span>
          </div>
        </section>

        <section className="sobre-secao sobre-secao--rodape">
          <p className="sobre-rodape">Projeto acadêmico — UCS · 2025</p>
        </section>


      </div>
    </div>
  );
}
