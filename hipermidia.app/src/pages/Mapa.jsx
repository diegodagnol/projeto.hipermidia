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
import Contador from '../components/contador';
import { useProgresso } from '../context/ProgressoContext';
import './Mapa.scss';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const RAIO_CHECKIN = 50;
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
      mapa.setView(posicao, 17, { animate: true });
      centralizado.current = true;
    }
  }, [posicao, mapa]);
  return null;
}

export default function Mapa() {
  const { usuario } = useAuth();
  const { incrementarVisitados } = useProgresso();
  const navigate = useNavigate();
  const [locais, setLocais] = useState([]);
  const [checkpoints, setCheckpoints] = useState(new Set());
  const [posicao, setPosicao] = useState(null);
  const [erroGeo, setErroGeo] = useState('');
  const [checkinEmAndamento, setCheckinEmAndamento] = useState(null);
  const [notificacao, setNotificacao] = useState('');
  const [localBloqueado, setLocalBloqueado] = useState(null);
  const [localVisitado, setLocalVisitado] = useState(null);

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

  function mostrarNotificacao(msg) {
    setNotificacao(msg);
    setTimeout(() => setNotificacao(''), 3000);
  }

  async function fazerCheckin(local) {
    if (checkinEmAndamento) return;
    setCheckinEmAndamento(local.id);
    try {
      await api.post(`/usuarios/${usuario.id}/checkpoints`, { checkpoint_id: local.id });
      setCheckpoints(prev => new Set([...prev, local.id]));
      incrementarVisitados();
      mostrarNotificacao(`✅ "${local.nome}" desbloqueado!`);
    } catch (err) {
      mostrarNotificacao(err?.erro || 'Erro ao fazer check-in.');
    } finally {
      setCheckinEmAndamento(null);
    }
  }

  function distanciaParaLocal(local) {
    if (!posicao) return null;
    return haversine(posicao[0], posicao[1], Number(local.latitude), Number(local.longitude));
  }

  return (
    <div className="mapa-pagina">
      {/* Mapa ocupa tela inteira */}
      <div className='mapa-box'>
        <MapContainer
          center={CAMPUS_CENTER}
          zoom={16}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
        

          {/* 🔵 Light */}
          <TileLayer
            //attribution='&copy; <a href="https://carto.com/">CartoDB</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            subdomains="abcd"
            maxZoom={20}
          />

          {/* 🛰️ Satélite — descomente para usar
          <TileLayer
            attribution='Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            maxZoom={19}
          /> */}
          <CentralizarUsuario posicao={posicao} />

          {posicao && (
            <>
              <Marker position={posicao} icon={iconeUsuario()} />
              <Circle
                center={posicao}
                radius={RAIO_CHECKIN}
                pathOptions={{ color: '#0051E8', fillColor: '#0051E8', fillOpacity: 0.08, weight: 1.5 }}
              />
            </>
          )}

          {locais.map(local => {
            const visitado = checkpoints.has(local.id);

            return (
              <Marker
                key={local.id}
                position={[Number(local.latitude), Number(local.longitude)]}
                icon={criarBandeira(visitado)}
                eventHandlers={{ click: () => visitado ? setLocalVisitado(local) : setLocalBloqueado(local) }}
              />
            );
          })}
        </MapContainer>
      </div>

      {erroGeo && (
        <div className="mapa-aviso mapa-aviso--geo">⚠️ {erroGeo}</div>
      )}

      {notificacao && (
        <div className="mapa-aviso mapa-aviso--checkin">{notificacao}</div>
      )}

      {localBloqueado && (() => {
        const dist = distanciaParaLocal(localBloqueado);
        const dentroDoRaio = dist !== null && dist <= RAIO_CHECKIN;
        return (
          <div className="modal-overlay">
            <div className="modal-card">
              <p className="modal-local__icone">🔒</p>
              <h2>Local Bloqueado</h2>
              <h3 className="modal-local__titulo">{localBloqueado.nome}</h3>
              <p className="modal-local__texto">
                {dist !== null ? `${Math.round(dist)}m de distância` : 'Aguardando localização...'}
              </p>
              <p className="modal-local__texto">
                Aproxime-se para fazer o check-in e desbloquear o conteúdo deste local.
              </p>
              {dentroDoRaio ? (
                <button
                  className="btn btn-primario"
                  onClick={async () => { await fazerCheckin(localBloqueado); setLocalBloqueado(null); }}
                  disabled={!!checkinEmAndamento}
                >
                  {checkinEmAndamento === localBloqueado.id ? 'Registrando...' : 'Fazer Check-in'}
                </button>
              ) : (
                <button
                  className="btn btn-primario"
                  onClick={() => setLocalBloqueado(null)}
                >
                  Entendi!
                </button>
              )}
            </div>
          </div>
        );
      })()}

      {localVisitado && (
        <div className="modal-overlay">
          <div className="modal-card">
            <button className="modal-local__fechar btn btn-secondary" onClick={() => setLocalVisitado(null)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16">
                <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
              </svg>
            </button>
            <h3 className="modal-local__titulo">{localVisitado.nome}</h3>
            {localVisitado.descricao && (
              <p className="modal-local__texto">{localVisitado.descricao}</p>
            )}
            <button
              className="btn btn-primario"
              onClick={() => { setLocalVisitado(null); navigate(`/local/${localVisitado.id}`); }}
            >
              Ver conteúdo completo
            </button>
          </div>
        </div>
      )}

      <Contador page="mapa"/>

      <NavInferior ativo="mapa" />
    </div>
  );
}
