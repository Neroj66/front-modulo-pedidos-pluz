
import { Sidebar } from "../../src/components/Sidebar";
import styled from "styled-components";


const sideMenu= ({ sidebarOpen, setSidebarOpen })=> {
  return (
    <Container className={sidebarOpen ? "sidebarState active" : ""}>
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
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

export default  sideMenu;