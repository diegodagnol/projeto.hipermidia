import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NavInferior from "../components/NavInferior";
import Contador from "../components/contador";
import './Perfil.scss';

const ChevronDir = () => (
    <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#C7C7CC"
        strokeWidth="2"
        strokeLinecap="round"
    >
        <path d="M9 18l6-6-6-6" />
    </svg>
);

const ITENS_MENU = [
    { label: "Meus dados", rota: "/perfil/meus-dados" },
    { label: "Configurações", rota: "/perfil/configuracoes" },
    { label: "Sobre o projeto", rota: null },
    { label: "Ajuda", rota: null },
];

export default function Perfil() {
    const { usuario, logout } = useAuth();
    const navigate = useNavigate();

    function handleLogout() {
        logout();
        navigate("/");
    }

    return (
        <div className="pagina">
			<Contador page="perfil"/>

            <div className="pagina-conteudo fade-up">

                {/* Avatar + nome */}
                <div className="perfil-header">
                    <div>
						<span className="perfil-subtitulo">Meu perfil</span>
                        <p className="perfil-nome">{usuario.nome}</p>
                        <p className="perfil-usuario">@{usuario.usuario}</p>
                    </div>
                </div>

                {/* Menu de itens */}
                <div className="perfil-menu">
                    {ITENS_MENU.map((item) => (
                        <button
                            key={item.label}
                            className="perfil-menu-item"
                            onClick={() => item.rota && navigate(item.rota)}
                        >
                            {item.label}
                            <ChevronDir />
                        </button>
                    ))}
                </div>

                {/* Ranking */}
                <button className="perfil-ranking" onClick={() => navigate("/ranking")}>
                    <span>🏆 Ranking</span>
                    <ChevronDir />
                </button>

                {/* Sair */}
                <button className="perfil-sair" onClick={handleLogout}>
                    Sair
                </button>

            </div>
            <NavInferior ativo="perfil" />
        </div>
    );
}
