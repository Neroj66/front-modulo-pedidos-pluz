import React, { useState, useEffect ,useContext} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { UserContext } from '../../src/components/userContext';
import Axios from 'axios';
import Swal from 'sweetalert2';
import  '../../src/styles/mystyles.css'
import Status from '../../src/components/Estado';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { formatDate } from '../../src/assets/js/functions';
import { Form, Dropdown , Pagination } from 'react-bootstrap';
import { PaginationControl } from 'react-bootstrap-pagination-control';

const Generar = ({username}) => {
  const { user } = useContext(UserContext);
  const [error, setError] = useState(''); // Error state for invalid quantity
  //paginacion
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(7); // Número de elementos por página

  const [userData, setUserData] = useState({});

  const [lcl, setLcl] = useState("");
  const [fecha, setFecha] = useState("");
  const [total, setTotal] = useState(0.0);

  const [materialQuantity, setMaterialQuantity] = useState(1);
  const [selectedMaterials, setSelectedMaterials] = useState([]);

  const [showMaterialModal, setShowMaterialModal] = useState(false);
  
  const [mostrarFormulario, setMostrarFormulario] = useState(false); // Estado para mostrar/ocultar el formulario de registro
  const [showEditModal, setShowEditModal] = useState(false); // Estado para mostrar/ocultar el modal de edición
  const [pedidoAEditar, setPedidoAEditar] = useState(""); // Estado para almacenar el pedido que se está editando


  const [sectorId, setSectorId] = useState(""); // Cambiado a sectorId
  const [sectores, setSectores] = useState([]); // Array para almacenar las opciones de sector

  const [servicioId, setServicioId] = useState(""); // Cambiado a servicioId
  const [servicios, setServicios] = useState([]); // Array para almacenar las opciones de servicio

  const [pdiId, setPdiId] = useState(""); // Cambiado a pdiId
  const [pdis, setPdis] = useState([]); // Array para almacenar las opciones de pdi

  const [materialId, setMaterialId] = useState(""); // Cambiado a materialId
  const [materiales, setMateriales] = useState([]); // Array para almacenar la seleccion de materiales

  const [pedidosList, setPedidos] = useState([]);

  const [searchSector, setSearchSector] = useState('');
  const [searchServicio, setSearchServicio] = useState('');
  const [searchPdi, setSearchPdi] = useState('');
  const [searchMaterial, setSearchMaterial] = useState('');


  const [showAll, setShowAll] = useState(true);

  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });


  // Función para obtener el detalle del pedido
  const fetchPedidoDetalle = async (pedidoId) => {
    try {
      const response = await Axios.get(`https://backend-modulo-pedidos.azurewebsites.net/obt-pedidos/pedidos_detalle/${pedidoId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching pedido detalle:', error);
      throw error; // Re-lanzar el error para que pueda ser manejado por el llamador
    }
  };

  const handleVolverAPedir = async (pedido) => {
    try {
      const detalle = await fetchPedidoDetalle(pedido.id);
      setSelectedMaterials([]);
      setSectorId(pedido.sector_id);
      setSearchSector(pedido.nombre_sector);
      setServicioId(pedido.servicio_id);
      setSearchServicio(pedido.nombre_servicio);
      setPdiId(pedido.pdi_id);
      setSearchPdi(pedido.nombre_pdi);
      setLcl(pedido.LCL_ING);
  
      // Recorre el detalle y agrega los materiales uno por uno
      detalle.forEach(item => {
        const nuevoMaterial = {
          id: item.material_id,
          matricula: item.matricula,
          descripcion: item.nombre_material,
          quantity: item.cantidad,
          precio: item.precio_material,
          importe: (item.precio_material * item.cantidad).toFixed(2)  // Calcula el importe
        };
  
        // Actualiza el estado agregando el nuevo material
        setSelectedMaterials(prevMaterials => [
          ...prevMaterials,
          nuevoMaterial
        ]);
      });
  
      setMostrarFormulario(true);
  
    } catch (error) {
      console.error('Error al obtener el detalle del pedido:', error);
    }
  };
  

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
        pedidosByUser(userData2.id);
      } else {
        console.warn('userData[0].a_cargo no está definido o es vacío:', userObject);
      }
    } else {
      console.warn('userData no está definido o es un array vacío:', userData);
    }
  }, [userData]);
  


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
  useEffect(() => {
    //getPedidos();
    //getContratistas();
    getMateriales();
    //getServicios();
  }, []);

  useEffect(() => {
    recalculateTotal();
  }, [selectedMaterials]);

  useEffect(() => {
    if (error) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: error,
      });
    }
  }, [error]);


  // Obtener los elementos actuales de la página
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = pedidosList.slice(indexOfFirstItem, indexOfLastItem);

  
  const pedidosByUser = async (user_id) => {
    try {
        
        const response = await Axios.get(`https://backend-modulo-pedidos.azurewebsites.net/obt-pedidos/pedidos/user/${user_id}`);
        console.log('Pedidos recibidos:', response.data); // Agregar este console.log
        setPedidos(response.data);
    } catch (error) {
        console.error('Error al obtener los pedidos:', error);
    }
};

  const fetchServiciosBySector = async (sector_id) => {
    try {
      const response = await Axios.get(`https://backend-modulo-pedidos.azurewebsites.net/otrasop/servicios/sector/${sector_id}`);
      setServicios(response.data);
    } catch (error) {
      console.error('Error fetching contratistas:', error);
    }
  };
  const fetchPdiByContratista = async (contratista_id) => {
    try {
      const response = await Axios.get(`https://backend-modulo-pedidos.azurewebsites.net/otrasop/pdi/contratista/${contratista_id}`);
      setPdis(response.data);
    } catch (error) {
      console.error('Error fetching contratistas:', error);
    }
  };



  const handleInputSector = (event) => {
    const value = event.target.value;
    setSearchSector(value);
    if (value === '') {
      setShowAll(true);
    } else {
      setShowAll(false);
    }
  };

  const handleInputServicio = (event) => {
    const value = event.target.value;
    setSearchServicio(value);

    if (value === '') {
      setShowAll(true);
    } else {
      setShowAll(false);
    }
  };
  const handleInputPdi = (event) => {
    const value = event.target.value;
    setSearchPdi(value);

    if (value === '') {
      setShowAll(true);
    } else {
      setShowAll(false);
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
  const handleOptionSector= (sector) => {
    setSearchSector(sector.nombre);
    setSectorId(sector.id);

    //fetchContratistasBySector(sector.id);

    setServicioId(null);
    setSearchServicio('');
    fetchServiciosBySector(sector.id);

    setShowAll(true);
  };

  const handleOptionServicio= (serv) => {
    setSearchServicio(serv.nombre);
    setServicioId(serv.id);
    setShowAll(true);
  };

  const handleOptionPdi= (pdi) => {
    setSearchPdi(pdi.pdi);
    setPdiId(pdi.id);
    setShowAll(true);
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
  

  const filteredSectores = showAll
    ? sectores
    : sectores.filter((sector) =>
        sector.nombre.toLowerCase().includes(searchSector.toLowerCase())
      );
   const filteredServicios = showAll
   ? servicios
  : servicios.filter((servicio) =>
     servicio.nombre.toLowerCase().includes(searchServicio.toLowerCase())
     );

  const filteredPdis = showAll
     ? pdis
    : pdis.filter((pdi) =>
       pdi.pdi.toLowerCase().includes(searchPdi.toLowerCase())
    ); 

    const filteredMateriales = showAll
        ? materiales
        : materiales.filter((material) =>
            material.descripcion.toLowerCase().includes(searchMaterial.toLowerCase()) ||
            material.matricula.toString().toLowerCase().includes(searchMaterial.toLowerCase())
        );

  const add = () => {
    if (!sectorId) {
      Swal.fire({
        icon: 'warning',
        title: 'No se puede agregar pedido',
        text: 'Seleccione un sector.',
        confirmButtonText: 'Aceptar'
      });
      return; // Salir de la función para evitar la eliminación
    }

    if (!servicioId) {
      Swal.fire({
        icon: 'warning',
        title: 'No se puede agregar pedido',
        text: 'Seleccione un servicio.',
        confirmButtonText: 'Aceptar'
      });
      return; // Salir de la función para evitar la eliminación
    }

    if (!pdiId) {
      Swal.fire({
        icon: 'warning',
        title: 'No se puede agregar pedido',
        text: 'Seleccione un PDI.',
        confirmButtonText: 'Aceptar'
      });
      return; // Salir de la función para evitar la eliminación
    }
    if (selectedMaterials.length < 1) {
      Swal.fire({
        icon: 'warning',
        title: 'No se puede agregar pedido',
        text: 'Debe haber al menos un material en la lista.',
        confirmButtonText: 'Aceptar'
      });
      return; // Salir de la función para evitar la eliminación
    }
  
    Axios.post("https://backend-modulo-pedidos.azurewebsites.net/crear/pedido", {
      contratista:userData[0].contratistaId,
      sector: sectorId,
      servicio: servicioId,
      pdi: pdiId,
      lcl:lcl,
      materiales: selectedMaterials,
      usuario: userData[0].id,
      fecha: fecha,
      total: total,
    }).then(() => {
      pedidosByUser(userData[0].id);
      limpiarCampos();
      Swal.fire({
        title: "<strong>Registro exitoso!!!</strong>",
        html: "<i>El pedido fue registrado con éxito!!</i>",
        icon: 'success',
        timer: 3000
      })
    }).catch(function (error) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: JSON.parse(JSON.stringify(error)).message === "Network Error" ? "Intente más tarde" : JSON.parse(JSON.stringify(error)).message
      })
    });
    setMostrarFormulario(false);
  }

  const update = () => {
    // Verificar si solo se cambió el sector sin cambiar el servicio
    if (sectorId && !servicioId) {
      Swal.fire({
        title: 'Advertencia',
        text: 'Si cambia el sector, también debe cambiar el servicio correspondiente.',
        icon: 'warning',
        confirmButtonText: 'Ok'
      });
      return; // Detener la ejecución si la condición no se cumple
    }
    if (!servicioId) {
      Swal.fire({
        icon: 'warning',
        title: 'No se puede agregar pedido',
        text: 'Seleccione un servicio.',
        confirmButtonText: 'Aceptar'
      });
      return; // Salir de la función para evitar la eliminación
    }

    if (!pdiId) {
      Swal.fire({
        icon: 'warning',
        title: 'No se puede agregar pedido',
        text: 'Seleccione un PDI.',
        confirmButtonText: 'Aceptar'
      });
      return; // Salir de la función para evitar la eliminación
    }

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
  
    if (lcl) {
      data.lcl = lcl;
    }
  
    if (sectorId) {
      data.sector = sectorId;
    }
  
    if (servicioId) {
      data.servicio = servicioId;
    }
  
    if (pdiId) {
      data.pdi = pdiId;
    }

    
  
    // Enviar solicitud de actualización
    Axios.put("https://backend-modulo-pedidos.azurewebsites.net/operate-ped/update", data)
      .then(() => {
        pedidosByUser(userData[0].id);
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
  };
  

  const deletePedido = (val) => {
    Swal.fire({
      title: "Confirmación de eliminación",
      html: "<i>¿Realmente desea eliminar el pedido con código: <strong>" + val.codigo + "</strong>?</i>",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar!!",
      cancelButtonText: "No, cancelar",
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        Axios.delete(`https://backend-modulo-pedidos.azurewebsites.net/operate-ped/delete/${val.id}`).then(() => {
          pedidosByUser(userData[0].id);
          limpiarCampos();
          Swal.fire({
            title: "pedido con código: " + val.codigo + " fue eliminado.",
            icon: "success",
            showConfirmButton: false,
            timer: 2000
          });
        }).catch(function (error) {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'No se logró eliminar el pedido!',
            footer: JSON.parse(JSON.stringify(error)).message === "Network Error" ? "Intente más tarde" : JSON.parse(JSON.stringify(error)).message
          })
        })
      }
    });
  }

  const editar_pedido = async (pedido) => {
    try {
      const detalle = await fetchPedidoDetalle(pedido.id); // Espera a que la promesa se resuelva
      setSelectedMaterials([]);
      setPedidoAEditar(pedido);
      setSectorId(pedido.sector_id);
      setSearchSector(pedido.nombre_sector);
      setServicioId(pedido.servicio_id);
      setSearchServicio(pedido.nombre_servicio);
      setPdiId(pedido.pdi_id);
      setSearchPdi(pedido.nombre_pdi);
      setLcl(pedido.LCL_ING);
  
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
  };
  

  const send_generacion = (val) => {
    const dataToUpdate = {
      id: val.id,
      
    };
  
    Swal.fire({
      title: "Confirmación de envio",
      html: "<i>¿Realmente desea enviar el pedido con codigo: <strong>" + val.codigo + "</strong>?</i>",
      icon: "info",
      showCancelButton: true,
      confirmButtonColor: "#50C878",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, enviar!!",
      cancelButtonText: "No, cancelar",
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        Axios.put("https://backend-modulo-pedidos.azurewebsites.net/operate-ped/send_generacion", dataToUpdate)
        .then(() => {
          pedidosByUser(userData[0].id);
          Swal.fire({
            title: "pedido con código: " + val.codigo + " fue enviado.",
            icon: "success",
            showConfirmButton: false,
            timer: 2000
          });
        }).catch(function (error) {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'No se logró enviar el pedido!',
            footer: JSON.parse(JSON.stringify(error)).message === "Network Error" ? "Intente más tarde" : JSON.parse(JSON.stringify(error)).message
          })
        })
      }
    });
  };
  const limpiarCampos = () => {

    setSearchSector("");
    setSectorId("");

    setSearchServicio("");
    setServicioId("");
    setServicios([]);

    setSearchPdi("");
    setPdiId("");
    setPdis([]);

    setSearchMaterial("");
    setMaterialId("");
    setSelectedMaterials([]);

    setLcl("");
    setFecha("");
    setTotal("");
  }



  const getSectores = async (contratista_id) => {
    if ( contratista_id) {
      Axios.get(`https://backend-modulo-pedidos.azurewebsites.net/otrasop/sectores/contratista/${contratista_id}`).then((response) => {
        setSectores(response.data);
      })
  } else {
      console.error('contratistaId es undefined');
      // Maneja el caso en el que contratistaId es undefined
  }
    
     
      
  }
  const getMateriales = () => {
    Axios.get("https://backend-modulo-pedidos.azurewebsites.net/otrasop/materiales").then((response) => {
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
};
  
  const removeMaterial = (index,edit) => {
    
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
    setError('');
  };

  
  
  return (
    <div className="container">
      <div className="card text-center">
        <div className="card-header">
          Gestión de Pedidos
        </div>
        <div>
      {user && <h1>Bienvenido, {user}!</h1>}  
    </div>
        <div className="card-body">
          <button className='btn btn-primary m-2' onClick={() => {setMostrarFormulario(true); limpiarCampos();getSectores(userData[0].contratistaId);fetchPdiByContratista(userData[0].contratistaId);}}>Agregar Pedido</button>
        </div>
      </div>
      <Modal id="firstModal" show={mostrarFormulario && !showMaterialModal} onHide={() => setMostrarFormulario(false)}  backdrop="static" centered>
        <Modal.Header closeButton>
          <Modal.Title>Agregar Pedido</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        <div className="input-group mb-3" style={{ width: '100%' }}>
          <span className="input-group-text" id="basic-addon1">Sector: </span>
          <Dropdown style={{ width: 'calc(100% - 124px)' }}>
            <Dropdown.Toggle
              variant="outline-secondary"
              id="dropdown-basic"
              className="form-control"
              style={{
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
                borderColor: '#ced4da',
                zIndex: 0 // corregir superposición
              }}
              
            >
              {searchSector || 'Selecciona un sector'}
            </Dropdown.Toggle>

            <Dropdown.Menu className="w-100">
              <Form.Control
                type="text"
                placeholder="Buscar sector"
                value={searchSector}
                onChange={handleInputSector}
                onClick={() => {
                  setShowAll(true),
                  setSectorId('');
                  setSearchSector('');
                  setServicios([]);
                  setServicioId('');
                  setSearchServicio('');
                
                  
                }}
                autoFocus
                style={{  backgroundColor: '#f0f0f0'}}
              />
              {filteredSectores.map((sector) => (
                <Dropdown.Item
                  key={sector.id}
                  onClick={() => handleOptionSector(sector)}
                >
                  {sector.nombre}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </div>
      
        <div className="input-group mb-3" style={{ width: '100%' }}>
          <span className="input-group-text" id="basic-addon1">Servicio: </span>
          <Dropdown style={{ width: 'calc(100% - 124px)' }}>
            <Dropdown.Toggle
              variant="outline-secondary"
              id="dropdown-basic"
              className="form-control"
              style={{
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
                borderColor: '#ced4da',
                zIndex: 0 // corregir superposición
              }}
            >
              {searchServicio || 'Selecciona un servicio'}
            </Dropdown.Toggle>

            <Dropdown.Menu className="w-100">
              <Form.Control
                type="text"
                placeholder="Buscar servicio"
                value={searchServicio}
                onChange={handleInputServicio}
                onClick={() => {
                  setShowAll(true);
                  setServicioId('');
                  setSearchServicio('');
                }}
                autoFocus
                style={{  backgroundColor: '#f0f0f0'}}
              />
              {filteredServicios.map((servicio) => (
                <Dropdown.Item
                  key={servicio.id}
                  onClick={() => handleOptionServicio(servicio)}
                >
                  {servicio.nombre}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </div>
        <div className="input-group mb-3" style={{ width: '100%' }}>
          <span className="input-group-text" id="basic-addon1">PDI: </span>
          <Dropdown style={{ width: 'calc(100% - 124px)' }}>
            <Dropdown.Toggle
              variant="outline-secondary"
              id="dropdown-basic"
              className="form-control"
              style={{
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
                borderColor: '#ced4da',
                zIndex: 0 // corregir superposición
              }}
            >
              {searchPdi || 'Selecciona un PDI'}
            </Dropdown.Toggle>

            <Dropdown.Menu className="w-100">
              <Form.Control
                type="text"
                placeholder="Buscar pdi"
                value={searchPdi}
                onChange={handleInputPdi}
                onClick={() => {
                  setShowAll(true);
                  setPdiId('');
                  setSearchPdi('');
                }}
                autoFocus
                style={{  backgroundColor: '#f0f0f0'}}
              />
              {filteredPdis.map((pdi) => (
                <Dropdown.Item
                  key={pdi.id}
                  onClick={() => handleOptionPdi(pdi)}
                >
                  {pdi.pdi}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </div>
        <div className="input-group mb-3">
              <span className="input-group-text" id="basic-addon1">LCL Ing: </span>
              <input  type="text" value={lcl}
                onChange={(event)=>{
                  setLcl(event.target.value);
                }}  
              className="form-control" placeholder="Ingrese LCL de ingeniería" aria-label="LCL" aria-describedby="basic-addon1"/>
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
              marginRight: '19vh',
              marginBottom: '15px'
            }}
          >
            <strong>Total:</strong> {total}
          </div>
        <div className="input-group mb-3">
              <span className="input-group-text" id="basic-addon1">Materiales: </span>
            <button className="btn btn-secondary mb" onClick={()=> {setShowMaterialModal(true);setSearchMaterial("");setMaterialQuantity(1);}}>
              Agregar Material
            </button>
            <ul className="list-group"style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {selectedMaterials.map((material, index) => (
                <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                  {material.matricula} - {material.descripcion} (x{material.quantity})
                  <button className="btn btn-danger btn-sm" onClick={() => removeMaterial(index)}>Eliminar</button>
                </li>
              ))}
            </ul>
          </div>
            </Modal.Body>
        <Modal.Footer>
              <button type="button" className="btn btn-secondary" onClick={() => setMostrarFormulario(false)}>Cerrar</button>
              <button type="button" className="btn btn-primary" onClick={add}>Guardar</button>
        </Modal.Footer>

      </Modal>
      <Modal   id="secondModal" show={showMaterialModal} onHide={()=>setShowMaterialModal(false)} backdrop="static" centered>
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
      <Modal show={showEditModal} onHide={() => {setShowEditModal(false),limpiarCampos();}}  backdrop="static" centered>
        <Modal.Header closeButton>
          <Modal.Title>Editar Pedido #{pedidoAEditar.codigo}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        
        <div className="input-group mb-3" style={{ width: '100%' }}>
          <span className="input-group-text" id="basic-addon1">Sector: </span>
          <Dropdown style={{ width: 'calc(100% - 124px)' }}>
            <Dropdown.Toggle
              variant="outline-secondary"
              id="dropdown-basic"
              className="form-control"
              style={{
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
                borderColor: '#ced4da',
                zIndex: 0 // corregir superposición
              }}
              
            >
              {searchSector || 'Seleccione un sector'}
            </Dropdown.Toggle>

            <Dropdown.Menu className="w-100">
              <Form.Control
                type="text"
                placeholder="Buscar sector"
                value={searchSector}
                onChange={handleInputSector}
                onClick={() => {
                  setShowAll(true),
                  setSectorId('');
                  setSearchSector('');
                  setServicios([]);
                  setServicioId('');
                  setSearchServicio('');
                
                  
                }}
                autoFocus
                style={{  backgroundColor: '#f0f0f0'}}
              />
              {filteredSectores.map((sector) => (
                <Dropdown.Item
                  key={sector.id}
                  onClick={() => handleOptionSector(sector)}
                >
                  {sector.nombre}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </div>
        <div className="input-group mb-3" style={{ width: '100%' }}>
          <span className="input-group-text" id="basic-addon1">Servicio: </span>
          <Dropdown style={{ width: 'calc(100% - 124px)' }}>
            <Dropdown.Toggle
              variant="outline-secondary"
              id="dropdown-basic"
              className="form-control"
              style={{
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
                borderColor: '#ced4da',
                zIndex: 0 // corregir superposición
              }}
            >
              {searchServicio || 'Seleccione un servicio'}
            </Dropdown.Toggle>

            <Dropdown.Menu className="w-100">
              <Form.Control
                type="text"
                placeholder="Buscar servicio"
                value={searchServicio}
                onChange={handleInputServicio}
                onClick={() => {
                  setShowAll(true);
                  setServicioId('');
                  setSearchServicio('');
                }}
                autoFocus
                style={{  backgroundColor: '#f0f0f0'}}
              />
              {filteredServicios.map((servicio) => (
                <Dropdown.Item
                  key={servicio.id}
                  onClick={() => handleOptionServicio(servicio)}
                >
                  {servicio.nombre}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </div>
        <div className="input-group mb-3" style={{ width: '100%' }}>
          <span className="input-group-text" id="basic-addon1">PDI: </span>
          <Dropdown style={{ width: 'calc(100% - 124px)' }}>
            <Dropdown.Toggle
              variant="outline-secondary"
              id="dropdown-basic"
              className="form-control"
              style={{
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
                borderColor: '#ced4da',
                zIndex: 0 // corregir superposición
              }}
            >
              {searchPdi || 'Seleccione un PDI'}
            </Dropdown.Toggle>

            <Dropdown.Menu className="w-100">
              <Form.Control
                type="text"
                placeholder="Buscar pdi"
                value={searchPdi}
                onChange={handleInputPdi}
                onClick={() => {
                  setShowAll(true);
                  setPdiId('');
                  setSearchPdi('');
                }}
                autoFocus
                style={{  backgroundColor: '#f0f0f0'}}
              />
              {filteredPdis.map((pdi) => (
                <Dropdown.Item
                  key={pdi.id}
                  onClick={() => handleOptionPdi(pdi)}
                >
                  {pdi.pdi}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </div>
            <div className="input-group mb-3">
              <span className="input-group-text" id="basic-addon1">LCL: </span>
              <input  type="text" value={lcl}
                onChange={(event)=>{
                  setLcl(event.target.value);
                }}  
              className="form-control" placeholder="Ingrese la LCL" aria-label="Lcl" aria-describedby="basic-addon1"/>
            </div>
            <div>
            <div 
            style={{ 
              padding: '10px', 
              border: '2px solid #007bff', 
              borderRadius: '5px', 
              backgroundColor: '#007bff',
              textAlign: 'left',
              color:'white',
              display: 'inline-block', 
              marginRight: '19vh',
              marginBottom: '15px'
            }}
          >
            <strong>Total:</strong> {total}
          </div>
            <div className="input-group mb-3">
              <span className="input-group-text" id="basic-addon1">Materiales: </span>
              <button className="btn btn-secondary mb" onClick={() => { setShowMaterialModal(true); setSearchMaterial(""); setMaterialQuantity(1); }}>
                Agregar Material
              </button>
              <ul className="list-group" style={{ maxHeight: '200px', overflowY: 'auto' }}>
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
            <th scope="col" onClick={() => handleSort('estado_id')} className={sortConfig.key === 'estado_id' ? (sortConfig.direction === 'asc' ? 'asc' : 'desc') : ''}>Estado</th>
            <th scope="col">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((val, key) => (
           <tr key={val.id}  >
              <th scope="row">{indexOfFirstItem + key + 1}</th>
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
                {val.send_generacion === 0 && (
                  <div className="btn-group" role="group" aria-label="Basic example">
                    <button type="button" onClick={() => send_generacion(val)} className="btn btn-success">Send</button>
                    <button type="button" onClick={() => deletePedido(val)} className="btn btn-danger">Delete</button>
                    <button type="button" onClick={() => {editar_pedido(val);getSectores(userData[0].contratistaId);fetchPdiByContratista(userData[0].contratistaId);}} className="btn btn-warning">Edit</button>
                  </div>
                )}
                {val.send_generacion !== 0 && (
                  <div className="btn-group" role="group" aria-label="Basic example">
                    <button type="button" onClick={() => {handleVolverAPedir(val);getSectores(userData[0].contratistaId);fetchPdiByContratista(userData[0].contratistaId);}} className="btn btn-primary">Volver a Pedir</button>
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

export default Generar;
