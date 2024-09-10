import React, { useState, useContext } from "react";
import { UserContext } from "../components/userContext";
import { useNavigate } from "react-router-dom";
import DivInput from '../components/DivInput';
import '../styles/mystyles.css';
import { Bounce, Fade } from "react-awesome-reveal";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const { setUser } = useContext(UserContext);
  //const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    const data = {
      username: username,
      password: password
    };
    
    fetch('https://backend-modulo-pedidos.azurewebsites.net/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
      .then(response => response.json())
      .then(result => {
        if (result.token) {
          localStorage.setItem('token', result.token);
          setUser(username);
          setErrorMessage("");
          
          // Recargar la página después de un retraso
          setTimeout(() => {
            window.location.reload(); // Recarga la página
            //navigate('/'); // Navega a la ruta principal
          }, 1); // Retraso de 3 segundos (3000 ms)
        } else {
          setErrorMessage("Usuario y/o contraseña inválida.");
        }
      })
      .catch(error => {
        console.log(error);
        setErrorMessage("Ocurrió un error. Por favor, inténtalo de nuevo.");
      });
  };

  return (
    <>
      <Fade duration={2000}>
        <div className="full-screen-background">
          <div className="d-flex flex-row flex-grow-1">
            <header className="header-container d-flex flex-column align-items-start">
              <h1 className="font-weight-bold">MÓDULO DE PEDIDOS DE MATERIALES</h1>
              <p className="text-muted">PLUZ ENERGÍA</p>
            </header>

            <main className=' d-flex flex-column align-items-start'>
              <Bounce duration={2000}>
                <div className='card border card-container border-blue'>
                  <div
                    align="center"
                    className='card-header border border-blue text-white'
                    style={{ backgroundColor: '#0059A9' }}
                  >
                    LOGIN
                  </div>
                  <div className='card-body'>
                    {errorMessage && (
                      <div className="alert alert-danger text-center" role="alert">
                        {errorMessage}
                      </div>
                    )}
                    <form onSubmit={handleLogin}>
                      <DivInput
                        type='username'
                        icon='fa-user'
                        value={username}
                        className='form-control'
                        placeholder='Username'
                        required='required'
                        handleChange={(e) => setUsername(e.target.value)}
                      />
                      <DivInput
                        type='password'
                        icon='fa-key'
                        value={password}
                        className='form-control'
                        placeholder='Password'
                        required='required'
                        handleChange={(e) => setPassword(e.target.value)}
                      />
                      <div className='d-grid col-10 mx-auto'>
                        <button className='btn btn-blue' type='submit'>
                          <i className='fa-solid fa-door-open'></i> Login
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </Bounce>
            </main>
          </div>

          <footer className="footer bg-dark text-white text-center py-3">
            <div className="d-flex justify-content-between">
              <div className="footer-item">Contacto <strong>john.argandona@enel.com</strong></div>
              <div className="footer-item"><strong>Copyright</strong> 2024</div>
            </div>
          </footer>
        </div>
      </Fade>
    </>
  );
};

export default Login;
