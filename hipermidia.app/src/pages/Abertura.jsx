import { useNavigate, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import './Abertura.scss';

// ─── Variantes ────────────────────────────────────────────────────────────────

// Grupo de botões: container com stagger
const botoesContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.14, delayChildren: 1.8 },
  },
};

// Cada botão individual
const btnVariant = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

// ─── Componente ───────────────────────────────────────────────────────────────
export default function Abertura() {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  if (usuario) return <Navigate to="/mapa" replace />;

  return (
    <div className="abertura">
      <div className="circle-bg">
        <div className="circle-bg__1" />
        <div className="circle-bg__2" />
      </div>

      <div className="container-abertura">
        {/* Logo — entrada spring + float em loop */}
        <div className="logo-abertura">
          {/* Camada 1: entrada com spring bounce */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 240, damping: 14, delay: 0.15 }}
          >
            {/* Camada 2: float contínuo (começa após a entrada terminar) */}
            <motion.div
              animate={{ y: [0, -16, 0] }}
              transition={{
                duration: 2.8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.9,     // espera a entrada terminar
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="72"
                height="96"
                viewBox="0 0 72 96"
                fill="none"
              >
                <g clipPath="url(#clip0_2_5)">
                  <path
                    d="M72 35.9696C72 61.9747 36 96 36 96C36 96 0 61.9747 0 35.9696C0 16.0405 16.0541 0 36 0C55.9459 0 72 16.0405 72 35.9696Z"
                    fill="#FF003B"
                  />
                  <g clipPath="url(#clip1_2_5)">
                    <path
                      d="M53.8485 48.461L55 46.6102L45.3561 37.0712L55 27.5322L53.8485 25.539L40.6061 28.9559L37.1515 16H34.8485L31.25 28.9559L18.1515 25.539L17 27.5322L26.6439 37.0712L17 46.6102L18.1515 48.461L31.25 45.0441L34.8485 58H37.1515L40.6061 45.0441L53.8485 48.461Z"
                      fill="white"
                    />
                  </g>
                </g>
                <defs>
                  <clipPath id="clip0_2_5">
                    <rect width="72" height="96" fill="white" />
                  </clipPath>
                  <clipPath id="clip1_2_5">
                    <rect width="38" height="42" fill="white" transform="translate(17 16)" />
                  </clipPath>
                </defs>
              </svg>
            </motion.div>
          </motion.div>
        </div>

        {/* Botões — surgem em cascata após o logo */}
        <motion.div
          className="btn-group-abertura"
          variants={botoesContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.button
            className="btn btn-primario"
            variants={btnVariant}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/login")}
          >
            Entrar
          </motion.button>

          <motion.button
            className="btn btn-secundario"
            variants={btnVariant}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/cadastro")}
          >
            Cadastrar-se
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
