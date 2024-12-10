import styled from "styled-components";
import logo from "../assets/img/modulo.png";
import { v } from "../styles/Variables";
import { AiOutlineLeft, AiOutlineHome, AiOutlineApartment, AiOutlineSetting } from "react-icons/ai";
import { MdOutlineAnalytics, MdLogout } from "react-icons/md";
import { NavLink, useNavigate } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { ThemeContext } from "../App";
import { UserContext } from '../components/userContext';
import Axios from 'axios';

const linksArray = [
  {
    label: "Detalle",
    icon: <AiOutlineApartment />,
    to: "/materiales-pedidos",
  },
  {
    label: "Materiales",
    icon: <MdOutlineAnalytics />,
    to: "/materiales",
    roles: [2, 3, 4], // Only roles 2, 3, and 4 can access this link
  },
  {
    label: "Reportes",
    icon: <MdOutlineAnalytics />,
    to: "/reportes",
  },
];

const pedidoLinksArray = [
  {
    label: "Generar Pedido",
    to: "/generar-pedido",
    roles: [1], // contratista
  },
  {
    label: "Aprobar Pedido",
    to: "/aprobar-pedido",
    roles: [2], // supervisor
  },
  {
    label: "Validar Pedido",
    to: "/validar-pedido",
    roles: [3, 4], // liquidador y consolidador
  },
  {
    label: "Consolidar Pedidos",
    to: "/consolidar-pedidos",
    roles: [4], // liquidador
  },
  {
    label: "Consolidar Detallado",
    to: "/consolidar-detallado",
    roles: [4], // liquidador
  },
  {
    label: "Consolidar Logística",
    to: "/consolidar-logistica",
    roles: [4], // liquidador
  },
];

const rolMapping = {
  1: "contratista",
  2: "supervisor",
  3: "liquidador",
  4: "consolidador",
  // agregar más roles según sea necesario
};


export function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const { user } = useContext(UserContext);
  const { setTheme, theme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [activeLink, setActiveLink] = useState(""); // Estado para la opción activa del menú principal
  const [userData, setUserData] = useState(null);

  const ModSidebaropen = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const CambiarTheme = () => {
    setTheme((theme) => (theme === "light" ? "dark" : "light"));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate("/");
    window.location.reload();
  };

  const handleLinkClick = (label) => {
    if (label === "Pedido") {
      setActiveLink(label); // Establecer "Pedido" como activo
    } else {
      setActiveLink(label); // Establecer la opción actual como activa
      if (!sidebarOpen) {
        setSidebarOpen(true); // Abrir la barra lateral si está cerrada al hacer clic
      }
    }
  };

  const obtenerUser = async (user) => {
    try {
      const response = await Axios.get(`https://backend-modulo-pedidos.azurewebsites.net/auth/obtener/${user}`);
      setUserData(response.data);
    } catch (error) {
      if (error.response) {
        // El servidor respondió con un código de error
        console.error('Error de servidor:', error.response.data);
      } else if (error.request) {
        // La solicitud se hizo pero no se recibió respuesta
        console.error('No se recibió respuesta del servidor:', error.request);
      } else {
        // Ocurrió un error antes de hacer la solicitud
        console.error('Error al enviar la solicitud:', error.message);
      }
    }
  };

  // Efecto para cargar datos del usuario al montar el componente o cuando cambie el usuario
  useEffect(() => {
    obtenerUser(user); // Llama a obtenerUser con el usuario actual
  }, [user]);

  const getLinks = (role) => {
    return linksArray.filter(link => !link.roles || link.roles.includes(role));
  };

  const getPedidoLinks = (role) => {
    return pedidoLinksArray.filter(link => link.roles.includes(role));
  };

  return (
    <Container isOpen={sidebarOpen} themeUse={theme}>
      <button className="Sidebarbutton" onClick={ModSidebaropen}>
        <AiOutlineLeft />
      </button>
      <div className="Logocontent">
        <div className="imgcontent">
          <img src={logo} style={{ width: "40px", height: "auto" }} alt="Logo" />
        </div>
        <h2>Menú</h2>
      </div>
      <div className="LinkContainer">
        <NavLink
          to="/home"
          className={`Links ${activeLink === "Inicio" ? "active" : ""}`}
          onClick={() => handleLinkClick("Inicio")}
        >
          <div className="Linkicon"><AiOutlineHome /></div>
          {sidebarOpen && <span>Inicio</span>}
        </NavLink>
      </div>
      <div className="LinkContainer">
        <div
          className={`Links ${activeLink === "Pedido" ? "active" : ""}`}
          onClick={() => handleLinkClick("Pedido")}
        >
          <div className="Linkicon"><AiOutlineApartment /></div>
          {sidebarOpen && <span>Opciones</span>}
        </div>
        {activeLink === "Pedido" && sidebarOpen && (
          <div className="SubLinkContainer">
            {userData && getPedidoLinks(userData[0].rol_id).map(({ label, to }) => (
              <NavLink
                key={label}
                to={to}
                className={`SubLinks ${activeLink === label ? "active" : ""}`}
                onClick={() => handleLinkClick(label)}
              >
                <span>{label}</span>
              </NavLink>
            ))}
          </div>
        )}
      </div>
      {userData && getLinks(userData[0].rol_id).map(({ icon, label, to }) => (
        <div className="LinkContainer" key={label}>
          <NavLink
            to={to}
            className={`Links ${activeLink === label ? "active" : ""}`}
            onClick={() => handleLinkClick(label)}
          >
            <div className="Linkicon">{icon}</div>
            {sidebarOpen && <span>{label}</span>}
          </NavLink>
        </div>
      ))}
      <div className="LinkContainer2" onClick={handleLogout}>
        <div className="Linkicon"><MdLogout /></div>
        {sidebarOpen && <span>Salir</span>}
      </div>
      <div className="Themecontent">
        {sidebarOpen && <span className="titletheme">Dark mode</span>}
        <div className="Togglecontent">
          <div className="grid theme-container">
            <div className="content">
              <div className="demo">
                <label className="switch" istheme={theme}>
                  <input
                    istheme={theme}
                    type="checkbox"
                    className="theme-swither"
                    onClick={CambiarTheme}
                  />
                  <span istheme={theme} className="slider round"></span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}




const Container = styled.div`
    color: ${(props) => props.theme.text};
  background: ${(props) => props.theme.bg};
  position: sticky;
  top: 0;
  height: 100vh;
  padding-top: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  
  .Sidebarbutton {
    position: absolute;
    top: ${v.xxlSpacing};
    right: -18px;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: ${(props) => props.theme.bgtgderecha};
    box-shadow: 0 0 4px ${(props) => props.theme.bg3},
      0 0 7px ${(props) => props.theme.bg};
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s;
    transform: ${({ isOpen }) => (isOpen ? `initial` : `rotate(180deg)`)};
    border: none;
    letter-spacing: inherit;
    color: inherit;
    font-size: inherit;
    text-align: inherit;
    padding: 0;
    font-family: inherit;
    outline: none;
  }
  .Logocontent {
    display: flex;
    justify-content: center;
    align-items: center;
    padding-bottom: ${v.lgSpacing};
    .imgcontent {
      display: flex;
      img {
        max-width: 100%;
        height: auto;
      }
      cursor: pointer;
      transition: all 0.3s;
      transform: ${({ isOpen }) => (isOpen ? `scale(0.7)` : `scale(1.5)`)};
    }
    h2 {
      display: ${({ isOpen }) => (isOpen ? `block` : `none`)};
    }
  }
  .LinkContainer2 {
    display: flex; /* Configura el contenedor para usar flexbox */
    align-items: center; /* Alinea verticalmente los elementos hijos */
    margin: 8px 0;
    padding: 0 15%;
    cursor: pointer; /* Asegura que el cursor cambie al pasar sobre el área */

    :hover {
      background: ${(props) => props.theme.bg3};
    }

    .Linkicon {
      padding: ${v.smSpacing} ${v.mdSpacing};
      display: flex;
      align-items: center; /* Alinea verticalmente el ícono */
      svg {
        font-size: 25px;
      }
    }

    span {
      margin-left: 8px; /* Espacio entre el ícono y el texto */
    }
  }
  .LinkContainer {
    margin: 0px 0;
    padding: 0 15%;
    :hover {
      background: ${(props) => props.theme.bg3};
    }
    .Links {
      display: flex;
      align-items: center;
      text-decoration: none;
      padding: calc(${v.smSpacing}-2px) 0;
      color: ${(props) => props.theme.text};
      height: 50px;
      .Linkicon {
        padding: ${v.smSpacing} ${v.mdSpacing};
        display: flex;
        svg {
          font-size: 25px;
        }
      }
      &.active {
        .Linkicon {
          svg {
            color: ${(props) => props.theme.bg4};
          }
        }
      }
    }
    .SubLinkContainer {
      padding: 0;
      margin-top: 8px;
       padding: 0;
      overflow: hidden; /* Evita que el contenido interno afecte el layout */
      background: ${(props) => props.theme.bg3};
      .SubLinks {
        display: block;
        padding: 10px 20px;
        color: ${(props) => props.theme.text};
        text-decoration: none;
        transition: background-color 0.3s;
        &:hover {
          background-color: ${(props) => props.theme.bg4};
          color: ${(props) => props.theme.bg};
        }
        &.active {
          background-color: ${(props) => props.theme.bg4};
          color: ${(props) => props.theme.bg};
        }
      }
    }
  }
  .Themecontent {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 15px; /* Ajusta el margen superior aquí */
    .titletheme {
      display: block;
      padding: 10px;
      font-weight: 700;
    }
    .Togglecontent {
      margin: auto 40px;
      width: 36px;
      height: 20px;
      border-radius: 10px;
      position: relative;
      .theme-container {
        background-blend-mode: multiply, multiply;
        transition: 0.4s;
        .grid {
          display: grid;
          justify-items: center;
          align-content: center;
          height: 100vh;
          width: 100vw;
          font-family: "Lato", sans-serif;
        }
        .demo {
          font-size: 32px;
          .switch {
            position: relative;
            display: inline-block;
            width: 60px;
            height: 34px;
            .theme-swither {
              opacity: 0;
              width: 0;
              height: 0;
              &:checked + .slider:before {
                left: 4px;
                content: "🌑";
                transform: translateX(26px);
              }
            }
            .slider {
              position: absolute;
              cursor: pointer;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: ${({ themeUse }) =>
                themeUse === "light" ? v.lightcheckbox : v.checkbox};

              transition: 0.4s;
              &::before {
                position: absolute;
                content: "☀️";
                height: 0px;
                width: 0px;
                left: -10px;
                top: 16px;
                line-height: 0px;
                transition: 0.4s;
              }
              &.round {
                border-radius: 34px;

                &::before {
                  border-radius: 50%;
                }
              }
            }
          }
        }
      }
    }
  }
`;

const Divider = styled.div`
  height: 1px;
  width: 100%;
  background: ${(props) => props.theme.bg3};
  margin: ${v.lgSpacing} 0;
`;

const Footer = styled.footer`
  width: 100%;
  padding: 10px;
  background-color: ${(props) => props.theme.bgFooter};
  position: absolute;
  bottom: 0;
  text-align: center;
  z-index: 1;
`;
//#endregion
