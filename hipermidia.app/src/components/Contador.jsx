import { useNavigate } from 'react-router-dom';
import { useProgresso } from '../context/ProgressoContext';
import './Contador.scss';

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

export default function Contador({ page }) {
  const navigate = useNavigate();
  const { total, visitados } = useProgresso();
  const label = total === null ? '…' : `${visitados}/${total}`;

  return (
    <div onClick={() => navigate('/passaporte')} aria-label="Passaporte" 
      className={`contador-locais ${page === 'mapa' ? 'contador-page-mapa' : 'contador-page-padrao'}`}>  
      <LogoSVG width={40} height={53} />
      <div className="contador-locais__display">
        {label}
      </div>
    </div>
  );
}
