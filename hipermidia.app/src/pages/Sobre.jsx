import { useNavigate } from 'react-router-dom';
import './Sobre.scss';

const LogoSVG = ({ width = 77, height = 58 }) => (
  <svg width={width} height={height} viewBox="0 0 72 96" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_contador)">
      <path d="M72 35.9696C72 61.9747 36 96 36 96C36 96 0 61.9747 0 35.9696C0 16.0405 16.0541 0 36 0C55.9459 0 72 16.0405 72 35.9696Z" fill="#FF003B" />
      <g clipPath="url(#clip1_contador)">
        <path d="M53.8485 48.461L55 46.6102L45.3561 37.0712L55 27.5322L53.8485 25.539L40.6061 28.9559L37.1515 16H34.8485L31.25 28.9559L18.1515 25.539L17 27.5322L26.6439 37.0712L17 46.6102L18.1515 48.461L31.25 45.0441L34.8485 58H37.1515L40.6061 45.0441L53.8485 48.461Z" fill="white" />
      </g>
    </g>
    <defs>
      <clipPath id="clip0_contador"><rect width="72" height="96" fill="white" /></clipPath>
      <clipPath id="clip1_contador"><rect width="38" height="42" fill="white" transform="translate(17 16)" /></clipPath>
    </defs>
  </svg>
);

export default function Sobre() {
  const navigate = useNavigate();

  return (
      <div className="sobre-pagina">
          <header className="sobre-header">
              <button
                  onClick={() => navigate(-1)}
                  className="btn btn-secundario sobre-voltar"
                  aria-label="Voltar"
              >
                  <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                  >
                      <path
                          fillRule="evenodd"
                          d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5"
                      />
                  </svg>
              </button>
              <h1 className="sobre-titulo">Sobre o projeto</h1>
          </header>

          <div className="sobre-corpo fade-up">
              <div className="sobre-hero">
                  <div className="sobre-hero__icone">
                      <LogoSVG width={40} height={53} />
                  </div>
                  <h2 className="sobre-hero__nome">Explocus</h2>
                  <p className="sobre-hero__tagline">
                      Explore o campus. Colecione experiências.
                  </p>
              </div>

              <section className="sobre-secao">
                  <h3 className="sobre-secao__titulo">O que é</h3>
                  <p className="sobre-secao__texto">
                      O Explocus é um aplicativo de exploração do campus da UCS
                      (Universidade de Caxias do Sul) desenvolvido como projeto
                      de hipermídia. A proposta é transformar a descoberta dos
                      espaços do campus em uma experiência interativa e
                      gamificada.
                  </p>
              </section>

              <section className="sobre-secao">
                  <h3 className="sobre-secao__titulo">Como funciona</h3>
                  <div className="sobre-passos">
                      <div className="sobre-passo">
                          <span className="sobre-passo__num">1</span>
                          <div>
                              <strong>Explore o mapa</strong>
                              <p>
                                  Navegue pelo mapa interativo e descubra os
                                  pontos espalhados pelo campus.
                              </p>
                          </div>
                      </div>
                      <div className="sobre-passo">
                          <span className="sobre-passo__num">2</span>
                          <div>
                              <strong>Faça check-in</strong>
                              <p>
                                  Chegue ao local e registre sua visita para
                                  colecionar o ponto no seu passaporte.
                              </p>
                          </div>
                      </div>
                      <div className="sobre-passo">
                          <span className="sobre-passo__num">3</span>
                          <div>
                              <strong>Suba no ranking</strong>
                              <p>
                                  Quanto mais locais você visitar, mais pontos
                                  acumula e mais alto fica no ranking.
                              </p>
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
                  <p className="sobre-rodape">
                      Desenvolvido por Diego Dall'Agnol <br/>
                      Projeto Temático: Hipermídia
                      <br />
                      Projeto acadêmico - UCS · 2026
                  </p>
              </section>
          </div>
      </div>
  );
}
