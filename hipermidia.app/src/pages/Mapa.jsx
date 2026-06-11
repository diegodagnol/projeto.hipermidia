import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import NavInferior from '../components/NavInferior';
import bandeiraBloqueadoRaw from '../assets/bandeira-bloqueado.svg?raw';
import bandeiraDesbloqueadoRaw from '../assets/bandeira-desbloqueado.svg?raw';
import Contador from '../components/Contador';
import { useProgresso } from '../context/ProgressoContext';
import Modal from '../components/Modal';
import { useConfiguracoes } from '../context/ConfiguracoesContext';
import successSfxUrl from '../assets/success-sfx.mp3';
import errorSfxUrl from '../assets/error-drop-sfx.mp3';
import './Mapa.scss';

const TROFEU_SVG = `<svg width="200" height="322" viewBox="0 0 148 238" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="tsg" cx="42%" cy="32%" r="62%">
      <stop offset="0%"   stop-color="#FFF3A8"/>
      <stop offset="22%"  stop-color="#F7CC36"/>
      <stop offset="58%"  stop-color="#C98A08"/>
      <stop offset="100%" stop-color="#7A4F00"/>
    </radialGradient>
    <radialGradient id="tsh" cx="35%" cy="25%" r="36%">
      <stop offset="0%"   stop-color="#fff" stop-opacity=".92"/>
      <stop offset="100%" stop-color="#fff" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="tse" x1="0" y1="0" x2=".35" y2="1">
      <stop offset="0%"   stop-color="#6B4400"/>
      <stop offset="100%" stop-color="#2C1800"/>
    </linearGradient>
    <linearGradient id="tpg" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%"   stop-color="#7A5200"/>
      <stop offset="20%"  stop-color="#CC9010"/>
      <stop offset="48%"  stop-color="#FFE458"/>
      <stop offset="76%"  stop-color="#C08808"/>
      <stop offset="100%" stop-color="#7A5200"/>
    </linearGradient>
    <linearGradient id="tpt" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%"   stop-color="#9E6E00"/>
      <stop offset="50%"  stop-color="#FFE870"/>
      <stop offset="100%" stop-color="#9E6E00"/>
    </linearGradient>
    <linearGradient id="tbg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="#FFD84A"/>
      <stop offset="35%"  stop-color="#C98A08"/>
      <stop offset="100%" stop-color="#582F00"/>
    </linearGradient>
    <linearGradient id="tbs" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="#BE8600"/>
      <stop offset="100%" stop-color="#2F1600"/>
    </linearGradient>
    <radialGradient id="tgg" cx="50%" cy="50%" r="50%">
      <stop offset="0%"   stop-color="#FFD040" stop-opacity=".52"/>
      <stop offset="100%" stop-color="#FFD040" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <ellipse cx="74" cy="230" rx="50" ry="9" fill="url(#tgg)"/>
  <path d="M15 218 L19 227 L129 227 L133 218Z" fill="url(#tbs)" opacity=".9"/>
  <rect x="15" y="211" width="118" height="8" rx="2" fill="url(#tbg)"/>
  <path d="M15 211 L19 206 L129 206 L133 211Z" fill="url(#tpt)"/>
  <path d="M26 206 L30 213 L118 213 L122 206Z" fill="url(#tbs)" opacity=".85"/>
  <rect x="26" y="199" width="96" height="8" rx="2" fill="url(#tbg)"/>
  <path d="M26 199 L30 194 L118 194 L122 199Z" fill="url(#tpt)"/>
  <path d="M37 194 L41 201 L107 201 L111 194Z" fill="url(#tbs)" opacity=".8"/>
  <rect x="37" y="187" width="74" height="8" rx="2" fill="url(#tbg)"/>
  <path d="M37 187 L41 182 L107 182 L111 187Z" fill="url(#tpt)"/>
  <path d="M81 182 L87 182 L81 90 L77 88Z" fill="#5A3600" opacity=".75"/>
  <path d="M67 182 L61 182 L67 90 L71 88Z" fill="#9A6C00" opacity=".45"/>
  <path d="M61 182 L87 182 L81 90 L67 90Z" fill="url(#tpg)"/>
  <ellipse cx="74" cy="90" rx="16" ry="5" fill="url(#tpt)"/>
  <ellipse cx="74" cy="182" rx="14" ry="4" fill="url(#tpt)" opacity=".7"/>
  <g transform="translate(5,6)" opacity=".5">
    <polygon points="74,6 82,36 112,28 90,50 112,72 82,64 74,94 66,64 36,72 58,50 36,28 66,36" fill="url(#tse)"/>
  </g>
  <g transform="translate(2.5,3)" opacity=".28">
    <polygon points="74,6 82,36 112,28 90,50 112,72 82,64 74,94 66,64 36,72 58,50 36,28 66,36" fill="#4A2C00"/>
  </g>
  <polygon points="74,6 82,36 112,28 90,50 112,72 82,64 74,94 66,64 36,72 58,50 36,28 66,36" fill="url(#tsg)"/>
  <polygon points="74,6 82,36 112,28 90,50 112,72 82,64 74,94 66,64 36,72 58,50 36,28 66,36" fill="url(#tsh)"/>
  <polygon points="74,6 82,36 112,28 90,50 112,72 82,64 74,94 66,64 36,72 58,50 36,28 66,36" fill="none" stroke="#FFE87A" stroke-width="1" opacity=".55"/>
  <circle cx="66" cy="28" r="5" fill="#fff" opacity=".28"/>
  <circle cx="70" cy="23" r="2.5" fill="#fff" opacity=".55"/>
</svg>`;

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const RAIO_CHECKIN = 30;
const CAMPUS_CENTER = [-29.1682, -51.1794];

function criarBandeira(visitado) {
  const raw = visitado ? bandeiraDesbloqueadoRaw : bandeiraBloqueadoRaw;
  // Substitui width/height do SVG para exibir no tamanho certo no mapa
  const svg = raw
    .replace(/width="[^"]*"/, 'width="72"')
    .replace(/height="[^"]*"/, 'height="118"');
  return L.divIcon({
    className: '',
    html: svg,
    iconSize: [72, 118],
    iconAnchor: [-5, 118],   // base do mastro (x≈8, y=fundo)
    popupAnchor: [19, -10],
  });
}

function iconeUsuario() {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:18px; height:18px; border-radius:50%;
      background:#0051E8; border:3px solid #fff;
      box-shadow: 0 0 0 4px rgba(0,81,232,0.25);
    "></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function CentralizarUsuario({ posicao }) {
  const mapa = useMap();
  const centralizado = useRef(false);
  useEffect(() => {
    if (posicao && !centralizado.current) {
      mapa.setView(posicao, 18, { animate: true });
      centralizado.current = true;
    }
  }, [posicao, mapa]);
  return null;
}

function IrParaUsuario({ posicao, trigger }) {
  const mapa = useMap();
  useEffect(() => {
    if (trigger && posicao) mapa.setView(posicao, 19, { animate: true });
  }, [trigger, posicao, mapa]);
  return null;
}

export default function Mapa() {
  const { usuario } = useAuth();
  const { incrementarVisitados } = useProgresso();
  const { tocarSom, vibrar } = useConfiguracoes();
  const navigate = useNavigate();
  const [locais, setLocais] = useState([]);
  const [checkpoints, setCheckpoints] = useState(new Set());
  const [posicao, setPosicao] = useState(null);
  const [erroGeo, setErroGeo] = useState('');
  const [checkinEmAndamento, setCheckinEmAndamento] = useState(null);
  const [notificacao, setNotificacao] = useState('');
  const [localBloqueado, setLocalBloqueado] = useState(null);
  const [localVisitado, setLocalVisitado] = useState(null);
  const [localCheckin, setLocalCheckin] = useState(null);
  const [mostrarTrofeu, setMostrarTrofeu] = useState(false);
  const [triggerCentralizar, setTriggerCentralizar] = useState(0);
  const [trofeuBotao, setTrofeuBotao] = useState(false);
  const [trofeuSaindo, setTrofeuSaindo] = useState(false);
  const trofeuTimerRef = useRef(null);

  useEffect(() => {
    api.get('/locais').then(setLocais).catch(console.error);
    api.get(`/usuarios/${usuario.id}/checkpoints`)
      .then(data => setCheckpoints(new Set(data.map(c => c.checkpoint_id))))
      .catch(console.error);
  }, [usuario.id]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setErroGeo('Geolocalização não suportada neste dispositivo.');
      return;
    }
    const id = navigator.geolocation.watchPosition(
      pos => setPosicao([pos.coords.latitude, pos.coords.longitude]),
      () => setErroGeo('Não foi possível obter sua localização.'),
      { enableHighAccuracy: true, maximumAge: 5000 }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);

  useEffect(() => {
    if (mostrarTrofeu) {
      tocarSom(successSfxUrl);
      trofeuTimerRef.current = setTimeout(() => setTrofeuBotao(true), 2500);
    } else {
      clearTimeout(trofeuTimerRef.current);
      setTrofeuBotao(false);
      setTrofeuSaindo(false);
    }
    return () => clearTimeout(trofeuTimerRef.current);
  }, [mostrarTrofeu]);

  function mostrarNotificacao(msg) {
    setNotificacao(msg);
    setTimeout(() => setNotificacao(''), 3000);
  }

  async function fazerCheckin(local) {
    if (checkinEmAndamento) return false;
    setCheckinEmAndamento(local.id);
    try {
      await api.post(`/usuarios/${usuario.id}/checkpoints`, { checkpoint_id: local.id });
      setCheckpoints(prev => new Set([...prev, local.id]));
      incrementarVisitados();
      return true;
    } catch (err) {
      mostrarNotificacao(err?.erro || 'Erro ao fazer check-in.');
      return false;
    } finally {
      setCheckinEmAndamento(null);
    }
  }

  function handleVerConteudo() {
    setTrofeuSaindo(true);
    setTimeout(() => {
      setMostrarTrofeu(false);
      navigate(`/local/${localCheckin.id}`);
    }, 480);
  }

  function distanciaParaLocal(local) {
    if (!posicao) return null;
    return haversine(posicao[0], posicao[1], Number(local.latitude), Number(local.longitude));
  }

  return (
    <div className="mapa-pagina">
      {!posicao && !erroGeo && (
        <div className="mapa-carregando">
          <div className="mapa-carregando__spinner" />
          <p>Obtendo sua localização...</p>
        </div>
      )}

      {erroGeo && (
        <div className="mapa-carregando">
          <p style={{ fontSize: 32 }}>📍</p>
          <p style={{ fontWeight: 600, color: 'var(--texto)' }}>Localização bloqueada</p>
          <p style={{ textAlign: 'center', maxWidth: 260 }}>{erroGeo}</p>
        </div>
      )}

      {posicao && (
        <div className='mapa-box'>
          <MapContainer
            center={posicao}
            zoom={18}
            maxZoom={19}
            minZoom={17} // limita zoom para evitar que os ícones fiquem muito pequenos
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              subdomains="abcd"
              maxZoom={19}
            />

            {/* 🛰️ Satélite — descomente para usar
            <TileLayer
              attribution='Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxZoom={19}
            /> */}
            <CentralizarUsuario posicao={posicao} />
            <IrParaUsuario posicao={posicao} trigger={triggerCentralizar} />

            <Marker position={posicao} icon={iconeUsuario()} />
            <Circle
              center={posicao}
              radius={RAIO_CHECKIN}
              pathOptions={{ color: '#0051E8', fillColor: '#0051E8', fillOpacity: 0.08, weight: 1.5 }}
            />

            {locais.map(local => {
              const visitado = checkpoints.has(local.id);
              return (
                <Marker
                  key={local.id}
                  position={[Number(local.latitude), Number(local.longitude)]}
                  icon={criarBandeira(visitado)}
                  eventHandlers={{ click: () => { if (visitado) { setLocalVisitado(local); } else { tocarSom(errorSfxUrl); vibrar([40]); setLocalBloqueado(local); } } }}
                />
              );
            })}
          </MapContainer>
        </div>
      )}

      {notificacao && (
        <div className="mapa-aviso mapa-aviso--checkin">{notificacao}</div>
      )}

      {localBloqueado && (() => {
        const dist = distanciaParaLocal(localBloqueado);
        const dentroDoRaio = dist !== null && dist <= RAIO_CHECKIN;
        return (
          <Modal
            icone="🔒"
            titulo={localBloqueado.nome}
            onClose={() => setLocalBloqueado(null)}
            fecharBtn
            botoes={dentroDoRaio
              ? [{ label: checkinEmAndamento === localBloqueado.id ? 'Registrando...' : 'Fazer Check-in', onClick: async () => { const ok = await fazerCheckin(localBloqueado); if (ok) { vibrar([60, 30, 80]); setLocalCheckin(localBloqueado); setMostrarTrofeu(true); } setLocalBloqueado(null); }, disabled: !!checkinEmAndamento }]
              : [{ label: 'Entendi!', onClick: () => setLocalBloqueado(null) }]
            }
          >
            <p className="modal-local__texto">
              {dist !== null ? `${Math.round(dist)}m de distância` : 'Aguardando localização...'}
            </p>
            <p className="modal-local__texto">
              Aproxime-se para fazer o check-in e desbloquear o conteúdo deste local.
            </p>
          </Modal>
        );
      })()}

      {localVisitado && (
        <Modal
          titulo={localVisitado.nome}
          onClose={() => setLocalVisitado(null)}
          fecharBtn
          botoes={[{ label: 'Ver conteúdo completo', onClick: () => { setLocalVisitado(null); navigate(`/local/${localVisitado.id}`); } }]}
        >
          {localVisitado.descricao && (
            <p className="modal-local__texto">{localVisitado.descricao}</p>
          )}
        </Modal>
      )}

      <button className="mapa-btn-ranking" onClick={() => navigate('/ranking')} aria-label="Ranking">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9H4a2 2 0 0 1-2-2V5h4"/>
          <path d="M18 9h2a2 2 0 0 0 2-2V5h-4"/>
          <path d="M6 5h12v6a6 6 0 0 1-12 0V5Z"/>
          <path d="M12 17v4"/>
          <path d="M8 21h8"/>
        </svg>
      </button>

      {posicao && (
        <button className="mapa-btn-localizar" onClick={() => setTriggerCentralizar(n => n + 1)} aria-label="Minha localização">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
            <circle cx="12" cy="12" r="9" strokeOpacity=".25"/>
          </svg>
        </button>
      )}

      {mostrarTrofeu && (
        <div className="trofeu-overlay" onClick={() => { if (!trofeuSaindo) setMostrarTrofeu(false); }}>
          <div className={`trofeu-overlay__wrapper${trofeuSaindo ? ' trofeu-overlay__wrapper--saindo' : ''}`}>
            <div className="trofeu-overlay__ico" dangerouslySetInnerHTML={{ __html: TROFEU_SVG }} />
          </div>
          {trofeuBotao && (
            <button
              className="trofeu-overlay__btn"
              onClick={(e) => { e.stopPropagation(); handleVerConteudo(); }}
            >
              Ver conteúdo
            </button>
          )}
        </div>
      )}

      <Contador page="mapa"/>

      <NavInferior ativo="mapa" />
    </div>
  );
}
