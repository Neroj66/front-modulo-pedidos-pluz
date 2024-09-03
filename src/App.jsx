import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoutes from "./routers/routes";
import Login from "./pages/Login";
import { Light, Dark } from "./styles/Themes";
import { ThemeProvider } from "styled-components";
import { UserContext } from "./components/userContext";

export const authContext = React.createContext(null);
export const ThemeContext = React.createContext(null);

function parseJwt(token) {
  if (!token) {
    return null; // Manejar el caso en el que el token sea null
  }
  
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
  
  return JSON.parse(jsonPayload);
}

const App = () => {
  const [theme, setTheme] = useState("light");
  const themeStyle = theme === "light" ? Light : Dark;

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true); // Estado para manejar el delay
  const token = localStorage.getItem('token');
  const tokenExistAndStillValid = token && (parseJwt(token).exp * 1000 > Date.now());
  const [user, setUser] = useState(localStorage.getItem('user') || null);

  useEffect(() => {
    // Guardar el nombre de usuario en el LocalStorage cada vez que cambie
    localStorage.setItem('user', user);
  }, [user]);

  useEffect(() => {
    // Manejar el delay para la carga de ProtectedRoutes
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1); // Retraso de 3 segundos (3000 ms)

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <div>Loading...</div>; // O cualquier componente de carga
  }

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <ThemeProvider theme={themeStyle}>
        <ThemeContext.Provider value={{ setTheme, theme }}>
          <BrowserRouter>
            <Routes>
              {/* Ruta para la página de inicio de sesión */}
              <Route 
                path="/login" 
                element={tokenExistAndStillValid ? <Navigate to="/" /> : <Login />} 
              />
              <Route 
                path="/*" 
                element={tokenExistAndStillValid ? (
                  <ProtectedRoutes sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                ) : (
                  <Login />
                )}
              />
              {/* Rutas protegidas */}
            </Routes>
          </BrowserRouter>
        </ThemeContext.Provider>
      </ThemeProvider>
    </UserContext.Provider>
  );
}

export default App;
