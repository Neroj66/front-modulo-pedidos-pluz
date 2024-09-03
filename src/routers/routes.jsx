import {Routes, Route, BrowserRouter } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import styled from "styled-components";
import Home  from "../pages/Home";
import Generar  from "../pages/Generar Pedido";
import Materiales_Pedidos  from "../pages/Materiales_Pedidos";
import Diagramas from "../pages/Diagramas";
import Reportes from "../pages/Reportes";
import Aprobar from "../pages/Aprobar Pedido";
import Validar from "../pages/Validar Pedido";
import Consolidar_Detalle from "../pages/Consolidar_Detalle";
import Consolidar_Pedidos from "../pages/Consolidar_Pedidos";
import Consolidar_Logistica from "../pages/Consolidar_Logistica";
import Materiales from "../pages/Materiales";

 const ProtectedRoutes = ({ sidebarOpen, setSidebarOpen }) => {
  return (
    <Container className={sidebarOpen ? "sidebarState active" : ""}>
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/generar-pedido" element={<Generar />} />
        <Route path="/aprobar-pedido" element={<Aprobar />} />
        <Route path="/validar-pedido" element={<Validar />} />
        <Route path="/consolidar-detallado" element={<Consolidar_Detalle/>} />
        <Route path="/consolidar-pedidos" element={<Consolidar_Pedidos/>} />
        <Route path="/consolidar-logistica" element={<Consolidar_Logistica/>} />
        <Route path="/materiales-pedidos" element={<Materiales_Pedidos />} />
        <Route path="/materiales" element={<Materiales />} />
        <Route path="/diagramas" element={<Diagramas />} />
        <Route path="/reportes" element={<Reportes />} />
      </Routes>
    </Container>
  );
}

const Container = styled.div`
  display: grid;
  grid-template-columns: 90px auto;
  background: ${({ theme }) => theme.bgtotal};
  transition: all 0.3s;
  &.active {
    grid-template-columns: 300px auto;
  }
  color: ${({ theme }) => theme.text};
`;
export default ProtectedRoutes;