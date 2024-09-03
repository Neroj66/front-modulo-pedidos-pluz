import React, { useState, useEffect ,useContext} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { UserContext } from '../components/userContext';
import Axios from 'axios';
import Swal from 'sweetalert2';
import  '../styles/mystyles.css'
import Status from '../components/Estado';
import { formatDate } from '../assets/js/functions';
import { PaginationControl } from 'react-bootstrap-pagination-control';

const Validar = ({username}) => {
  const { user } = useContext(UserContext);
  //paginacion
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // Número de elementos por página


  const [userData, setUserData] = useState({});

  const [pedidosList, setPedidos] = useState([]);

  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

  // Efecto para cargar datos del usuario al montar el componente o cuando cambie el usuario
  useEffect(() => {
    obtenerUser(user); // Llama a obtenerUser con el usuario actual
  }, [user]);

  useEffect(() => {
    // Verifica que userData esté definido y contenga al menos un elemento
    if (userData && userData.length > 0) {
      // Accede al primer elemento del array para obtener el objeto de usuario
      const userData2 = userData[0];
      
      // Verifica que userObject y userObject.a_cargo estén definidos
      if (userData2 && userData2.a_cargo) {
        pedidosByLiquidador(userData2.id);
      } else {
        console.warn('userData[0].a_cargo no está definido o es vacío:', userObject);
      }
    } else {
      console.warn('userData no está definido o es un array vacío:', userData);
    }
  }, [userData]);
  
  // Obtener los elementos actuales de la página
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = pedidosList.slice(indexOfFirstItem, indexOfLastItem);

  const obtenerUser = async (user) => {
    try {
      const response = await Axios.get(`http://10.155.241.37:4001/obtenerUser/${user}`);
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
  
  const pedidosByLiquidador = async (liquidador_id) => {
    try {
        
        const response = await Axios.get(`http://10.155.241.37:4001/pedidos/liquidador/${liquidador_id}`);
        console.log('Pedidos recibidos:', response.data); // Agregar este console.log
        setPedidos(response.data);
    } catch (error) {
        console.error('Error al obtener los pedidos:', error);
    }
};

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  
    const sortedData = [...pedidosList].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === 'asc' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  
    setPedidos(sortedData);
  };
  

  const RechazadoValidador_Pedido = (val) => {
    const dataToUpdate = {
      id: val.id,
      validador_id: userData[0].id,
      estado: 5,
      send_validacion: 1,
    };
    Swal.fire({
      title: "Confirmar rechazo",
      html: "<i>¿Realmente desea rechazar el pedido con código: <strong>" + val.codigo + "</strong>?</i>",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, rechazar!!",
      cancelButtonText: "No, cancelar",
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        Axios.put("http://10.155.241.37:4001/validar", dataToUpdate)
        .then(() => {
        pedidosByLiquidador(userData[0].id); // Actualiza los pedidos del sector
          Swal.fire({
            title: "pedido con código: " + val.codigo + " fue rechazado.",
            icon: "success",
            showConfirmButton: false,
            timer: 2000
          });
        }).catch(function (error) {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'No se logró rechazar el pedido!',
            footer: JSON.parse(JSON.stringify(error)).message === "Network Error" ? "Intente más tarde" : JSON.parse(JSON.stringify(error)).message
          })
        })
      }
    });
  }

  const Validar_Ped = (val) => {
    const dataToUpdate = {
      id: val.id,
      validador_id: userData[0].id,
      estado: 4,
      send_validacion: 1,
    };
    Swal.fire({
      title: "Confirmar validación",
      html: "<i>¿Realmente desea validar el pedido con código: <strong>" + val.codigo + "</strong>?</i>",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, validar!!",
      cancelButtonText: "No, cancelar",
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        Axios.put("http://10.155.241.37:4001/validar", dataToUpdate)
        .then(() => {
        pedidosByLiquidador(userData[0].id); // Actualiza los pedidos del sector
          Swal.fire({
            title: "pedido con código: " + val.codigo + " fue validado.",
            icon: "success",
            showConfirmButton: false,
            timer: 2000
          });
        }).catch(function (error) {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'No se logró validar el pedido!',
            footer: JSON.parse(JSON.stringify(error)).message === "Network Error" ? "Intente más tarde" : JSON.parse(JSON.stringify(error)).message
          })
        })
      }
    });
  };
  
  



  
  
  
  
  const closeMaterialModal = () => {
    setShowMaterialModal(false);
  };


  
  return (
    <div className="container">
      <div className="card text-center">
        <div className="card-header">
          Validación de Pedidos
        </div>
        <div>
      {user && <h1>Bienvenido, {user}!</h1>}  
    </div>
      </div>
      <div className="container mt-5">
      <div className="card text-center">
      <table  className="table table-striped table-bordered">
        <thead >
          <tr>
            <th scope="col">#</th>
            <th scope="col" onClick={() => handleSort('nombre_sector')}className={sortConfig.key === 'nombre_sector' ? (sortConfig.direction === 'asc' ? 'asc' : 'desc') : ''}>Sector</th>
            <th scope="col" onClick={() => handleSort('nombre_contratista')}className={sortConfig.key === 'nombre_contratista' ? (sortConfig.direction === 'asc' ? 'asc' : 'desc') : ''}>Contratista</th>
            <th scope="col" onClick={() => handleSort('nombre_servicio')}className={sortConfig.key === 'nombre_servicio' ? (sortConfig.direction === 'asc' ? 'asc' : 'desc') : ''}>Servicio</th>
            <th scope="col" onClick={() => handleSort('codigo')}className={sortConfig.key === 'codigo' ? (sortConfig.direction === 'asc' ? 'asc' : 'desc') : ''}>Código</th>
            <th scope="col" onClick={() => handleSort('nombre_pdi')} className={sortConfig.key === 'nombre_pdi' ? (sortConfig.direction === 'asc' ? 'asc' : 'desc') : ''}>PDI</th>
            <th scope="col" onClick={() => handleSort('LCL_ING')} className={sortConfig.key === 'LCL_ING' ? (sortConfig.direction === 'asc' ? 'asc' : 'desc') : ''}>LCL</th>
            <th scope="col" onClick={() => handleSort('usuario')} className={`header-cell ${sortConfig.key === 'usuario' ? (sortConfig.direction === 'asc' ? 'asc' : 'desc') : ''}`}>Usuario</th>
            <th scope="col" onClick={() => handleSort('fecha')} className={sortConfig.key === 'fecha' ? (sortConfig.direction === 'asc' ? 'asc' : 'desc') : ''}>Fecha</th>
            <th scope="col" onClick={() => handleSort('total')} className={`header-cell ${sortConfig.key === 'total' ? (sortConfig.direction === 'asc' ? 'asc' : 'desc') : ''}`}>Total</th>
            <th scope="col" onClick={() => handleSort('estado')} className={sortConfig.key === 'estado' ? (sortConfig.direction === 'asc' ? 'asc' : 'desc') : ''}>Estado</th>
            <th scope="col">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((val, key) => (
           <tr key={val.id}  >
              <th scope="row">{key + 1}</th>
              <td>{val.nombre_sector}</td>
              <td>{val.nombre_contratista}</td>
              <td>{val.nombre_servicio}</td>
              <td>{val.codigo}</td>
              <td>{val.nombre_pdi}</td>
              <td>{val.LCL_ING}</td>
              <td>{val.nombre_usuario}</td>
              <td>{formatDate(val.fecha)}</td>
              <td>{val.total}</td>
              <td >
                <Status status={val.estado_id}/>
              </td>
             
              <td>
              {val.send_validacion === 0 && (
                <div className="btn-group" role="group" aria-label="Basic example">
                <button type="button" onClick={() => Validar_Ped(val)} className="btn btn-success">Validar</button>
                <button type="button" onClick={() => RechazadoValidador_Pedido(val)} className="btn btn-danger">Rechazar</button>
              </div>
            )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="d-flex justify-content-between">
          <div>
            Mostrando registros de {indexOfFirstItem + 1} al {indexOfLastItem > pedidosList.length ? pedidosList.length : indexOfLastItem} de un total de {pedidosList.length} registros
          </div>
                    <PaginationControl
              changePage={(page) => {
                setCurrentPage(page)
              }}
              ellipsis={1}
              page={currentPage}
              total={pedidosList.length}
              limit={itemsPerPage}
              last
              
            />
        </div>
      </div>
      </div>
    </div>
  );
}

export default Validar;
