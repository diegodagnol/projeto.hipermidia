import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import NavInferior from '../components/NavInferior';
import bandeiraBloqueadoRaw from '../assets/bandeira-bloqueado.svg?raw';
import bandeiraDesbloqueadoRaw from '../assets/bandeira-desbloqueado.svg?raw';

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
    .replace(/width="[^"]*"/, 'width="38"')
    .replace(/height="[^"]*"/, 'height="62"');
  return L.divIcon({
    className: '',
    html: svg,
    iconSize: [38, 62],
    iconAnchor: [8, 60],   // base do mastro (x≈8, y=fundo)
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
  const navigate = useNavigate();
  const [locais, setLocais] = useState([]);
  const [checkpoints, setCheckpoints] = useState(new Set());
  const [posicao, setPosicao] = useState(null);
  const [erroGeo, setErroGeo] = useState('');
  const [checkinEmAndamento, setCheckinEmAndamento] = useState(null);
  const [notificacao, setNotificacao] = useState('');

  useEffect(() => {
    api.get('/locais').then(setLocais).catch(console.error);
    // api.get(`/usuarios/${usuario.id}/checkpoints`)
    //   .then(data => setCheckpoints(new Set(data.map(c => c.checkpoint_id))))
    //   .catch(console.error);
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
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column' }}>
      {/* Mapa ocupa tela inteira */}
      <div style={{ flex: 1, paddingBottom: 89 }}>
        <MapContainer
          center={CAMPUS_CENTER}
          zoom={16}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          {/* ── Tile layer — troque a linha `url` para mudar o estilo do mapa ──────
              🔵 Light (atual):     CartoDB Positron — limpo, sem distrações
              🛰️  Satélite/3D:       Esri World Imagery — fotografia aérea
              🗺️  Padrão OSM:        https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
              🏔️  Terreno:           https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png
          ─────────────────────────────────────────────────────────────────────── */}

          {/* 🔵 Light */}
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CartoDB</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
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
            const distancia = distanciaParaLocal(local);
            const dentroDoRaio = distancia !== null && distancia <= RAIO_CHECKIN;

            return (
              <Marker
                key={local.id}
                position={[Number(local.latitude), Number(local.longitude)]}
                icon={criarBandeira(visitado)}
              >
                <Popup>
                  <div style={{ minWidth: 180 }}>
                    <strong style={{ fontSize: 15 }}>{local.nome}</strong>
                    <p style={{ fontSize: 13, color: '#8E8E93', margin: '4px 0 10px' }}>{local.descricao}</p>
                    {visitado ? (
                      <button
                        style={{ width: '100%', padding: '9px', background: '#0051E8', color: '#fff', border: 'none', borderRadius: 24, fontWeight: 600, cursor: 'pointer', fontSize: 13 }}
                        onClick={() => navigate(`/local/${local.id}`)}
                      >
                        Ver conteúdo
                      </button>
                    ) : dentroDoRaio ? (
                      <button
                        style={{ width: '100%', padding: '9px', background: '#0051E8', color: '#fff', border: 'none', borderRadius: 24, fontWeight: 600, cursor: 'pointer', fontSize: 13 }}
                        onClick={() => fazerCheckin(local)}
                        disabled={!!checkinEmAndamento}
                      >
                        {checkinEmAndamento === local.id ? 'Registrando...' : 'Fazer Check-in'}
                      </button>
                    ) : (
                      <p style={{ fontSize: 12, color: '#8E8E93', textAlign: 'center' }}>
                        {distancia !== null
                          ? `${Math.round(distancia)}m de distância`
                          : 'Aguardando localização...'}
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Aviso erro de geolocalização */}
      {erroGeo && (
        <div style={{
          position: 'fixed', top: 16, left: 16, right: 16,
          background: '#fef3c7', border: '1px solid #d97706',
          borderRadius: 12, padding: '10px 14px',
          fontSize: 13, color: '#92400e', zIndex: 1002,
        }}>
          ⚠️ {erroGeo}
        </div>
      )}

      {/* Notificação de check-in */}
      {notificacao && (
        <div style={{
          position: 'fixed', top: 16, left: 16, right: 16,
          background: '#f0fdf4', border: '1px solid #16a34a',
          borderRadius: 12, padding: '12px 16px',
          fontSize: 14, fontWeight: 600, color: '#15803d', zIndex: 1002,
          animation: 'fadeUp 0.2s ease',
        }}>
          {notificacao}
        </div>
      )}

      <NavInferior ativo="mapa" />
    </div>
  );
}
