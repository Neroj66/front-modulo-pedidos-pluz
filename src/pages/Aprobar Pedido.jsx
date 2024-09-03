import React, { useState, useEffect ,useContext} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { UserContext } from '../components/userContext';
import Axios from 'axios';
import Swal from 'sweetalert2';
import  '../styles/mystyles.css'
import Status from '../components/Estado';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { formatDate } from '../assets/js/functions';
import { Form, Dropdown } from 'react-bootstrap';
import { PaginationControl } from 'react-bootstrap-pagination-control';

const Aprobar = ({username}) => {
  const { user } = useContext(UserContext);
  //paginacion
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // Número de elementos por página

  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [currentPedido, setCurrentPedido] = useState(null);
  const [detalle, setDetalle] = useState([]);


  const [userData, setUserData] = useState({});
  const [total, setTotal] = useState(0.0);
  const [materialQuantity, setMaterialQuantity] = useState(1);
  const [selectedMaterials, setSelectedMaterials] = useState([]);

  const [showMaterialModal, setShowMaterialModal] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false); // Estado para mostrar/ocultar el modal de edición
  const [pedidoAEditar, setPedidoAEditar] = useState(""); // Estado para almacenar el pedido que se está editando



  const [materialId, setMaterialId] = useState(""); // Cambiado a materialId
  const [materiales, setMateriales] = useState([]); // Array para almacenar la seleccion de materiales

  const [pedidosList, setPedidos] = useState([]);

  const [searchMaterial, setSearchMaterial] = useState('');


  const [showAll, setShowAll] = useState(true);

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
        pedidosBySector(userData2.a_cargo);
      } else {
        console.warn('userData[0].a_cargo no está definido o es vacío:', userObject);
      }
    } else {
      console.warn('userData no está definido o es un array vacío:', userData);
    }
  }, [userData]);

  useEffect(() => {


    getMateriales();

  }, []);
  useEffect(() => {
    recalculateTotal();
  }, [selectedMaterials]);
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
  
  const pedidosBySector = async (sector) => {
    try {
        
        const response = await Axios.get(`http://10.155.241.37:4001/pedidos/sector/${sector}`);
        console.log('Pedidos recibidos:', response.data); // Agregar este console.log
        setPedidos(response.data);
    } catch (error) {
        console.error('Error al obtener los pedidos:', error);
    }
};



  const handleInputMaterial = (event) => {
    const value = event.target.value;
    setSearchMaterial(value);
    if (value === '') {
      setShowAll(true);
    } else {
      setShowAll(false);
    }
  };




  const handleOptionMaterial= (material) => {
    setSearchMaterial(`${material.matricula} - ${material.descripcion}`);
    setMaterialId(material.id);
    setShowAll(true);
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
  





    const filteredMateriales = showAll
        ? materiales
        : materiales.filter((material) =>
            material.descripcion.toLowerCase().includes(searchMaterial.toLowerCase()) ||
            material.matricula.toString().toLowerCase().includes(searchMaterial.toLowerCase())
        );





  const update = () => {


    if (selectedMaterials.length < 1) {
      Swal.fire({
        icon: 'warning',
        title: 'No se puede agregar pedido',
        text: 'Debe haber al menos un material en la lista.',
        confirmButtonText: 'Aceptar'
      });
      return; // Salir de la función para evitar la eliminación
    }
  
    // Construir los datos a enviar
    const data = {
      id: pedidoAEditar.id,
      materiales : selectedMaterials,
      newtotal:total,
    };
  

  
    // Enviar solicitud de actualización
    Axios.put("http://10.155.241.37:4001/update", data)
      .then(() => {
        pedidosBySector(userData[0].a_cargo);
        setShowEditModal(false); // Cerrar el modal de edición después de actualizar
        limpiarCampos();
        Swal.fire({
          title: "<strong>Actualización exitosa!!!</strong>",
          html: "<i>El pedido fue actualizado con éxito!!</i>",
          icon: 'success',
          timer: 3000
        });
      })
      .catch(function (error) {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: JSON.parse(JSON.stringify(error)).message === "Network Error" ? "Intente más tarde" : JSON.parse(JSON.stringify(error)).message
        });
      });
  }

    // Función para obtener el detalle del pedido
    const fetchPedidoDetalle = async (pedidoId) => {
      try {
        const response = await Axios.get(`http://10.155.241.37:4001/pedidos_detalle/${pedidoId}`);
        return response.data;
      } catch (error) {
        console.error('Error fetching pedido detalle:', error);
        throw error; // Re-lanzar el error para que pueda ser manejado por el llamador
      }
    };
    const editar_pedido = async (pedido) => {
    try {
      const detalle = await fetchPedidoDetalle(pedido.id); // Espera a que la promesa se resuelva
      setSelectedMaterials([]);
      setPedidoAEditar(pedido);
      /*setSectorId(pedido.sector_id);
      setSearchSector(pedido.nombre_sector);
      setServicioId(pedido.servicio_id);
      setSearchServicio(pedido.nombre_servicio);
      setPdiId(pedido.pdi_id);
      setSearchPdi(pedido.nombre_pdi);
      setLcl(pedido.LCL_ING);*/
  
      // Verificar si el detalle es un array y recorrerlo
      if (Array.isArray(detalle)) {
        detalle.forEach(item => {
          const nuevoMaterial = {
            id: item.material_id,
            matricula: item.matricula,
            descripcion: item.nombre_material,
            quantity: item.cantidad,
            precio: item.precio_material,
            importe: (item.precio_material * item.cantidad).toFixed(2), // Calcula el importe
          };
  
          // Actualiza el estado agregando el nuevo material
          setSelectedMaterials(prevMaterials => [
            ...prevMaterials,
            nuevoMaterial
          ]);
        });
      } else {
        console.error('El detalle no es un array:', detalle);
      }
  
      setShowEditModal(true); // Mostrar el modal de edición al editar un pedido

      
    } catch (error) {
      console.error('Error al querer editar el pedido:', error);
    }
  }


  const limpiarCampos = () => {
 
    setSearchMaterial("");
    setMaterialId("");
    setSelectedMaterials([]);


  }

  const RechazadoAprobador_Pedido = (val) => {
    const dataToUpdate = {
      id: val.id,
      aprobador_id: userData[0].id,
      estado: 3,
      send_aprobacion: 1,
    };
    Swal.fire({
      title: "Confirmar Rechazo",
      html: "<i>¿Realmente desea rechazar el pedido con codigo: <strong>" + val.codigo + "</strong>?</i>",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, rechazar!!",
      cancelButtonText: "No, cancelar",
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        Axios.put("http://10.155.241.37:4001/aprobar", dataToUpdate)
        .then(() => {
        pedidosBySector(userData[0].a_cargo); // Actualiza los pedidos del sector
          Swal.fire({
            title: "pedido con codigo: " + val.codigo + " fue rechazado.",
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
  
  const Aprobar_Ped = (val) => {
    const dataToUpdate = {
      id: val.id,
      aprobador_id: userData[0].id,
      estado: 2,
      send_aprobacion: 1,
      send_validacion: 0,
    };
  
    Swal.fire({
      title: "Confirmar Aprobación",
      html: "<i>¿Realmente desea aprobar el pedido con codigo: <strong>" + val.codigo + "</strong>?</i>",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, aprobar!!",
      cancelButtonText: "No, cancelar",
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        Axios.put("http://10.155.241.37:4001/aprobar", dataToUpdate)
        .then(() => {
        pedidosBySector(userData[0].a_cargo); // Actualiza los pedidos del sector
        closeDetalleModal();
          Swal.fire({
            title: "pedido con código: " + val.codigo + " fue aprobado.",
            icon: "success",
            showConfirmButton: false,
            timer: 2000
          });
        }).catch(function (error) {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'No se logró aprobar el pedido!',
            footer: JSON.parse(JSON.stringify(error)).message === "Network Error" ? "Intente más tarde" : JSON.parse(JSON.stringify(error)).message
          })
        })
      }
    });
  };




  const getMateriales = () => {
    Axios.get("http://10.155.241.37:4001/materiales").then((response) => {
      setMateriales(response.data);
    })
  }
 const handleAddMaterial = () => {
    const material = materiales.find(material => material.id === materialId);
    if (!material) {
      // Mostrar alerta si no se ha seleccionado ningún material
      Swal.fire({
        title: '¡Advertencia!',
        text: 'No se ha seleccionado ningún material.',
        icon: 'warning',
        confirmButtonText: 'Aceptar'
      });
      return;
    }
    if (materialId && materialQuantity > material.existencia) {
        Swal.fire({
            icon: 'error',
            title: 'Cantidad inválida',
            text: 'La cantidad seleccionada excede la existencia disponible.',
        }).then(() => {
            // Agregar el material después de mostrar la alerta
            if (materialQuantity > 0 && material) {
                setSelectedMaterials([...selectedMaterials, { ...material, quantity: materialQuantity, importe: (material.precio * materialQuantity).toFixed(2) }]);
                setSearchMaterial('');
                setMaterialId('');
                setMaterialQuantity(1);
                closeMaterialModal();
            }
        });
    } else {
        // Agregar el material normalmente si la cantidad no excede la existencia
        if (materialQuantity > 0 && material) {
            setSelectedMaterials([...selectedMaterials, { ...material, quantity: materialQuantity, importe: (material.precio * materialQuantity).toFixed(2)}]);
            setSearchMaterial('');
            setMaterialId('');
            setMaterialQuantity(1);
            closeMaterialModal();
        }
    }
};

  
  const handleQuantityChange = (index, newQuantity) => {
    const updatedMaterials = selectedMaterials.map((material, i) => {
      if (i === index) {
        const importe = (material.precio * newQuantity).toFixed(2);
        return { ...material, quantity: newQuantity, importe};
      }
      return material;
    });
    
    setSelectedMaterials(updatedMaterials);
    //actualizarTotal(updatedMaterials);
  }
  const removeMaterial = (index) => {
    const updatedMaterials = [...selectedMaterials];
    updatedMaterials.splice(index, 1);
    setSelectedMaterials(updatedMaterials);
  };
  const recalculateTotal = () => {
    let newTotal = 0;
    selectedMaterials.map((material) => {
      newTotal += material.precio * material.quantity;
    });
    newTotal = newTotal.toFixed(2); // Redondear a 2 decimales
    setTotal(newTotal);
  };
  
  
  
  const closeMaterialModal = () => {
    setShowMaterialModal(false);
  };

  const openDetalleModal = (pedido) => {
    Axios.get(`http://10.155.241.37:4001/pedidos_detalle/${pedido.id}`)
      .then((response) => {
        setDetalle(response.data);
        setCurrentPedido(pedido);
        setShowDetalleModal(true);
      })
      .catch((error) => {
        console.error('Error fetching pedido detalle:', error);
      });
  };

  const closeDetalleModal = () => {
    setCurrentPedido(null);
    setShowDetalleModal(false);
  };
  
  return (
    <div className="container">
      <div className="card text-center">
        <div className="card-header">
          Aprobación de Pedidos
        </div>
        <div>
      {user && <h1>Bienvenido, {user}!</h1>}  
    </div>
      </div>
  
      <Modal show={showMaterialModal} onHide={()=>setShowMaterialModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Agregar Material</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="form-group">
            <label>Buscar Material</label>
            <Dropdown>
              <Dropdown.Toggle variant="outline-secondary" className="form-control">
                {searchMaterial || 'Selecciona un material'}
              </Dropdown.Toggle>
              <Dropdown.Menu className="w-100" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                <Form.Control
                  type="text"
                  placeholder="Buscar material"
                  value={searchMaterial}
                  onChange={handleInputMaterial}
                  onClick={() => {
                    setSearchMaterial('');
                    setMaterialId('');
                  }}
                  autoFocus
                  style={{  backgroundColor: '#f0f0f0'}}
                />
                {filteredMateriales.map((material) => (
                  <Dropdown.Item key={material.id} onClick={() => handleOptionMaterial(material)}>
                    {material.matricula} - {material.descripcion}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </div>
          <div className="form-group">
          <label>Cantidad</label>
          <input
            type="number"
            className="form-control"
            value={materialQuantity}
            onChange={(e) => setMaterialQuantity(e.target.value)}
            min="1"
          />
        </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeMaterialModal}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleAddMaterial}>
            Agregar
          </Button>
        </Modal.Footer>
      </Modal>
  

      <Modal show={showEditModal && !showMaterialModal} onHide={() => {setShowEditModal(false),limpiarCampos();}}  backdrop="static" centered>
        <Modal.Header closeButton>
          <div style={{ flexGrow: 1 }}>
          <Modal.Title>Editar  #{pedidoAEditar.codigo}</Modal.Title>
          </div>
          <div 
          style={{ 
            padding: '10px', 
            border: '2px solid #007bff', 
            borderRadius: '5px', 
            backgroundColor: '#007bff',
            textAlign: 'left',
            color:'white',
            display: 'inline-block', 
            marginRight: '5vh'
          }}
        >
          <strong>Total:</strong> {total}
        </div>
        </Modal.Header>
        <Modal.Body>
            <div>
            <div className="input-group mb-3">
              <span className="input-group-text" id="basic-addon1">Materiales: </span>
              <button className="btn btn-secondary mb" onClick={() => { setShowMaterialModal(true); setSearchMaterial(""); setMaterialQuantity(1); }}>
                Agregar Material
              </button>
              <ul className="list-group" style={{ maxHeight: '40vh', overflowY: 'auto' }}>
                {selectedMaterials.map((material, index) => (
                  <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                    <div style={{ width: '17vw' }}>{material.matricula} - {material.descripcion}</div>
                    <input
                      type="number"
                      min="1"
                      value={material.quantity}
                      onChange={(event) => handleQuantityChange(index, parseFloat(event.target.value))}
                      className="form-control"
                      style={{ width: '4.5vw' }} // Ajusta el ancho aquí
                      placeholder="Cantidad"
                      aria-label="Cantidad"
                      aria-describedby="basic-addon1"
                    />
                    <button className="btn btn-danger btn-sm" onClick={() => removeMaterial(index)}>Eliminar</button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancelar</Button>
          <Button variant="primary" onClick={update}>Actualizar</Button>
        </Modal.Footer>
      </Modal>

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
              {(val.send_aprobacion === 0 || val.estado_id === 5) && (
                <div className="btn-group" role="group" aria-label="Basic example">
                <button type="button" onClick={() => openDetalleModal(val)} className="btn btn-success">Aprobar</button>
                <button type="button" onClick={() => RechazadoAprobador_Pedido(val)} className="btn btn-danger">Rechazar</button>
                <button type="button" onClick={() => editar_pedido(val)} className="btn btn-warning">Edit</button>
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
      {showDetalleModal && (
        <Modal show={showDetalleModal} onHide={closeDetalleModal} dialogClassName="custom-modal" backdrop="static" centered>
          <Modal.Header closeButton>
            <div style={{ flexGrow: 1 }}>
              <Modal.Title>Detalle del Pedido   #{currentPedido.codigo}</Modal.Title>
            </div>
            <div 
                style={{ 
                  padding: '10px', 
                  border: '2px solid #007bff', 
                  borderRadius: '5px', 
                  backgroundColor: '#007bff',
                  textAlign: 'left',
                  color:'white',
                  display: 'inline-block', 
                  marginRight: '15vh'
                }}
              >
                <strong>Total:</strong> {currentPedido.total}
              </div>
          </Modal.Header>
          <Modal.Body>
            {detalle.length > 0 ? (
              <div className="table-responsive">
              <div className="card text-center">
              <div style={{ maxHeight: '40vh', overflowY: 'auto' }}>
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th scope="col">Matrícula</th>
                    <th scope="col">Descripción</th>
                    <th scope="col">Cantidad</th>
                    <th scope="col">P/U</th>
                    <th scope="col">Importe</th>
                  </tr>
                </thead>
                <tbody>
                  {detalle.map((item) => (
                    <tr key={item.id}>
                      <td>{item.matricula}</td>
                      <td>{item.nombre_material}</td>
                      <td>{item.cantidad}</td>
                      <td>{item.precio_material}</td>
                      <td>{item.importe}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
              </div>
          </div>
            ) : (
              <p>No hay materiales solicitados para este pedido.</p>
            )}
          </Modal.Body>
          <Modal.Footer>
            
                <Button type="button" className="btn btn-success" onClick={() => Aprobar_Ped(currentPedido)}>Confirmar</Button>
                <Button type="button" className="btn btn-danger" onClick={closeDetalleModal}>Cancelar</Button>
              
            
          </Modal.Footer>
        </Modal>
      )}
    </div>
    
  );
}

export default Aprobar;
