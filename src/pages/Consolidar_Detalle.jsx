import React, { useState, useEffect, useContext, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { UserContext } from '../../src/components/userContext';
import Axios from 'axios';
import '../../src/styles/mystyles.css';
import Status from '../../src/components/Estado';
import { formatDate } from '../../src/assets/js/functions';
import { Form, Dropdown } from 'react-bootstrap';
import { PaginationControl } from 'react-bootstrap-pagination-control';
import { CSVLink } from 'react-csv';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { formatDateForFilename} from '../../src/assets/js/functions';

const Consolidar_Detalle = ({ username }) => {
  const tableRef = useRef(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [pdi_Id, setPdiId] = useState('');
  const [pdi, setPdi] = useState('');
  const [pdis, setPdis] = useState([]); // Array para almacenar las opciones de pdi
  const [contratista_Id, setContratistaId] = useState('');
  const [contratista, setContratista] = useState('');
  const [contratistas, setContratistas] = useState([]);
  const [sector_Id, setSectorId] = useState('');
  const [sector, setSector] = useState('');
  const [sectores, setSectores] = useState([]);
  const [servicio_Id, setServicioId] = useState('');
  const [servicio, setServicio] = useState('');
  const [servicios, setServicios] = useState([]);

  const [error, setError] = useState('');
  const [showAll, setShowAll] = useState(true);

  const { user } = useContext(UserContext);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(7);

  const [pedidosList, setPedidos] = useState([]);
 const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

  useEffect(() => {
   
    getContratistas();
  }, []);

  /*const getPedidos = () => {
    Axios.get("https://backend-modulo-pedidos.azurewebsites.net/pedidos_detalle/consolidador").then((response) => {
      setPedidos(response.data);
    });
  };*/

  const getContratistas = () => {
    Axios.get("https://backend-modulo-pedidos.azurewebsites.net/otrasop/contratistas").then((response) => {
      setContratistas(response.data);
    });
  };
  const validateDates = () => {
    const isValidDate = (date) => !isNaN(new Date(date).getTime());

    if (dateFrom && !isValidDate(dateFrom)) {
      setError('La fecha de inicio no es válida.');
      return false;
    }

    if (dateTo && !isValidDate(dateTo)) {
      setError('La fecha de fin no es válida.');
      return false;
    }

    if (dateFrom && dateTo && new Date(dateFrom) > new Date(dateTo)) {
      setError('La fecha de inicio no puede ser posterior a la fecha de fin.');
      return false;
    }

    setError('');
    return true;
  };

  const getPedidos = () => {


    const params = {};

    if (dateFrom) {
      params.dateFrom = dateFrom;
    }

    if (dateTo) {
      params.dateTo = dateTo;
    }

    if (contratista_Id){
      params.contratista= contratista_Id;
    }

    if (sector_Id){
      params.sector = sector_Id;
    }

    if (pdi_Id){
      params.pdi= pdi_Id;
    }

    if (servicio_Id){
      params.servicio= servicio_Id;
    }

    Axios.get("https://backend-modulo-pedidos.azurewebsites.net/consolidador/detalle", { params })
      .then((response) => {
        setPedidos(response.data);
        setCurrentPage(1); // Reset page to 1 after new data fetch
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  };

  const fetchSectorByContratista = async (contratista_id) => {
    try {
      const response = await Axios.get(`https://backend-modulo-pedidos.azurewebsites.net/otrasop/sectores/contratista/${contratista_id}`);
      setSectores(response.data);
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
  
  
    const fetchServiciosBySector = async (sector_id) => {
      try {
        const response = await Axios.get(`https://backend-modulo-pedidos.azurewebsites.net/otrasop/servicios/sector/${sector_id}`);
        setServicios(response.data);
      } catch (error) {
        console.error('Error fetching contratistas:', error);
      }
    };
  
    const handleOptionContratista= (contratista) => {
      setContratistaId(contratista.id);
      setContratista(contratista.nombre);
      setSectorId('');
      setSector('');
      fetchSectorByContratista(contratista.id);
      setPdiId('');
      setPdi('');
      fetchPdiByContratista(contratista.id);
      setServicioId('');
      setServicio('');
      setShowAll(true);
    };
    const handleOptionSector= (sector) => {
  
      setSectorId(sector.id);
      setSector(sector.nombre);
      setServicioId('');
      setServicio('');
      fetchServiciosBySector(sector.id);
      setShowAll(true);
    };
  
    const handleOptionServicio= (serv) => {
      setServicioId(serv.id);
      setServicio(serv.nombre);
      setShowAll(true);
    };
  
    const handleOptionPdi= (pdi) => {
      setPdiId(pdi.id);
      setPdi(pdi.pdi);
      setShowAll(true);
    };
  
  
  
    const filteredContratistas = showAll
      ? contratistas
      : contratistas.filter((contratistaB) =>
          contratistaB.nombre.toLowerCase().includes(contratista.toLowerCase())
        );
  const filteredSectores = showAll
        ? sectores
        : sectores.filter((sectorB) =>
            sectorB.nombre.toLowerCase().includes(sector.toLowerCase())
          );
     const filteredServicios = showAll
     ? servicios
    : servicios.filter((servicioB) =>
       servicioB.nombre.toLowerCase().includes(servicio.toLowerCase())
       );
  
    const filteredPdis = showAll
       ? pdis
      : pdis.filter((pdiB) =>
         pdiB.pdi.toLowerCase().includes(pdi.toLowerCase())
      );     
  
  
    const handleInputContratista = (event) => {
     
      const value = event.target.value;
      setContratista(value);
      if (value === '') {
        setShowAll(true);
      } else {
        setShowAll(false);
      }
    };
  
    const handleInputSector = (event) => {
      const value = event.target.value;
      setSector(value);
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
      setPdi(value);
  
      if (value === '') {
        setShowAll(true);
      } else {
        setShowAll(false);
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

  const headers = [
    { label: "Código", key: "codigo" },
    { label: "Sector", key: "nombre_sector" },
    { label: "Contratista", key: "nombre_contratista" },
    { label: "Servicio", key: "nombre_servicio" },
    { label: "PDI", key: "nombre_pdi" },
    { label: "Fecha Validado", key: "fecha_valid" },
    { label: "Validador", key: "nombre_usuario" },
    { label: "Fecha Generado", key: "fecha" },
    { label: "Matrícula", key: "matricula" },
    { label: "Material", key: "nombre_material" },
    { label: "Cantidad", key: "cantidad" },
    { label: "Precio", key: "precio_material" },
    { label: "Importe", key: "importe" },
    { label: "Total", key: "total" },
    { label: "Estado", key: "estado" }
  ];

  const estadoMapping = {
    1: 'Generado',
    2: 'Aprobado',
    3: 'Rechazado por Aprobador',
    4: 'Validado',
    5: 'Rechazado por Validador',
    6: "Vencido"
  };

  const mappedItems = pedidosList.map(item => ({
    ...item,
    fecha: formatDate(item.fecha),
    fecha_valid: formatDate(item.fecha_valid),
    estado: estadoMapping[item.estado_id] || item.estado_id
  }));


  const csvReport = {
    data: mappedItems,
    headers: headers,
    filename: `detalle_pedidos_${dateFrom ? `desde_${formatDateForFilename(dateFrom)}` : 'sin_fecha_desde'}_${dateTo ? `hasta_${formatDateForFilename(dateTo)}` : 'sin_fecha_hasta'}.csv`
  };

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Pedidos');

    worksheet.columns = [
      { header: 'Código', key: 'codigo', width: 10 },
      { header: 'Sector', key: 'nombre_sector', width: 20 },
      { header: 'Contratista', key: 'nombre_contratista', width: 20 },
      { header: 'Servicio', key: 'nombre_servicio', width: 20 },
      
      { header: 'PDI', key: 'nombre_pdi', width: 20 },
      { header: 'Fecha validado', key: 'fecha_valid', width: 20 },
      { header: 'Validador', key: 'nombre_usuario', width: 20 },
      { header: 'Fecha Generado', key: 'fecha', width: 20 },
      { header: 'E4E', key: 'matricula', width: 10 },
      { header: 'Material', key: 'nombre_material', width: 20 },
      { header: 'Cnt.', key: 'cantidad', width: 10 },
      { header: 'P.Unitario', key: 'precio_material', width: 10 },
      { header: 'Imp.', key: 'importe', width: 10 },
      { header: 'Total', key: 'total', width: 10 },
      { header: 'Estado', key: 'estado', width: 10 }
      
    ];
    mappedItems.forEach(item => {
      worksheet.addRow(item);
    });
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '4F81BD' }
      };
      cell.alignment = { horizontal: 'center' };
    });
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `detalle pedidos_${dateFrom ? `desde_${formatDateForFilename(dateFrom)}` : 'sin_fecha_desde'}_${dateTo ? `hasta_${formatDateForFilename(dateTo)}` : 'sin_fecha_hasta'}.xlsx`);
  };

  const handlePrint = () => {
    if (tableRef.current) {
      const printWindow = window.open('', '', 'height=600,width=800');
      printWindow.document.write('<html><head><title>Print</title>');
      printWindow.document.write(`
        <style>
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
          }
          th {
            background-color: #f2f2f2;
            text-align: left;
          }
          @media print {
            .no-print {
              display: none;
            }
          }
        </style>
      `);
      printWindow.document.write('</head><body>');
      printWindow.document.write('<h1>Pedidos List</h1>');
      printWindow.document.write(tableRef.current.outerHTML);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };



  const handleClearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setPdiId('');
    setPdi('');
    setPdis([]);
    setContratistaId('');
    setContratista('');
    setSectorId('');
    setSector('');
    setSectores([]);
    setServicioId('');
    setServicio('');
    setServicios([]);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = pedidosList.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="container">
      <div className="card text-center">
        <div className="card-header">
          Consolidar Detalle de Pedidos
        </div>
        <div>
          {user && <h1>Bienvenido! usuario: {user}</h1>}
        </div>
      </div>
      <div className="card text-center">
        <div className="card-body">
          <h5>Filtros</h5>
          {error && <div className="alert alert-danger">{error}</div>}
          <div className="row">
            <div className="col-md-4 mb-2">
            <label htmlFor="dateTimeFrom">Desde:</label>
              <div className="input-group mb-3" style={{ width: '100%' }}>
              <input
                type="datetime-local"
                id="dateFrom"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="form-control"
                style={{
                  textAlign: 'center', // Alinea el contenido al centro
                  borderTopLeftRadius: 0,
                  borderBottomLeftRadius: 0,
                  borderTopRightRadius: 0,
                  borderBottomRightRadius: 0,
                  borderColor: '#ced4da',
                  zIndex: 0 // corregir superposición
                }}
              />
              <button onClick={() => setDateFrom('')} className="btn btn-secondary">Borrar</button>
              </div>
            </div>
            <div className="col-md-4 mb-2">
              <label htmlFor="dateTo">Hasta:</label>
              <div className="input-group mb-3" style={{ width: '100%' }}>
              <input
                type="date"
                id="dateTo"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="form-control"
                style={{
                  textAlign: 'center', // Alinea el contenido al centro
                  borderTopLeftRadius: 0,
                  borderBottomLeftRadius: 0,
                  borderTopRightRadius: 0,
                  borderBottomRightRadius: 0,
                  borderColor: '#ced4da',
                  zIndex: 0 // corregir superposición
                }}
              />
              <button onClick={() => setDateTo('')} className="btn btn-secondary">Borrar</button>
              </div>
            </div>
            <div className="col-md-4 mb-2">
              <label htmlFor="contratista">Contratista:</label>
              <div className="input-group mb-3" style={{ width: '114%' }}>
                
                <Dropdown style={{ width: 'calc(100% - 124px)' }}>
                  <Dropdown.Toggle
                    variant="outline-secondary"
                    id="dropdown-basic"
                    className="form-control"
                    style={{
                      borderTopLeftRadius: 0,
                      borderBottomLeftRadius: 0,
                      borderTopRightRadius: 0,
                      borderBottomRightRadius: 0,
                      borderColor: '#ced4da',
                      zIndex: 0 // corregir superposición
                    }}
                  >
                    {contratista || 'Selecciona un contratista'}
                  </Dropdown.Toggle>

                  <Dropdown.Menu className="w-100">
                    <Form.Control
                      type="text"
                      placeholder="Buscar contratista"
                      value={contratista}
                      onChange={handleInputContratista}
                      onClick={() => {
                        setShowAll(true);
                        setContratista('');
                        setSector('');
                        setSectores([]);
                        setPdi('');
                        setPdis([]);
                        setServicio('');
                        setServicios([]);
                      }}
                      autoFocus
                      style={{ backgroundColor: '#f0f0f0' }}
                      
                    />
                    {filteredContratistas.map((contratista) => (
                      <Dropdown.Item
                        key={contratista.id}
                        onClick={() => handleOptionContratista(contratista)}
                      >
                        {contratista.nombre}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
                <button onClick={() => {setContratista('');setSector('');setSectores([]);setPdi('');setPdis([]);setServicio('');setServicios([]);}} className="btn btn-secondary">Borrar</button>
              </div>
             </div> 
            <div className="col-md-4 mb-2">
              <label htmlFor="pdi">PDI:</label>
              <div className="input-group mb-3" style={{ width: '114%' }}>
          <Dropdown style={{ width: 'calc(100% - 124px)' }}>
            <Dropdown.Toggle
              variant="outline-secondary"
              id="dropdown-basic"
              className="form-control"
              style={{
                  borderTopLeftRadius: 0,
                  borderBottomLeftRadius: 0,
                  borderTopRightRadius: 0,
                  borderBottomRightRadius: 0,
                  borderColor: '#ced4da',
                  zIndex: 0 // corregir superposición
              }}
            >
              {pdi || 'Seleccione un PDI'}
            </Dropdown.Toggle>

            <Dropdown.Menu className="w-100">
              <Form.Control
                type="text"
                placeholder="Buscar pdi"
                value={pdi}
                onChange={handleInputPdi}
                onClick={() => {
                  setShowAll(true);
                  setPdi('');
                  
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
          <button onClick={() => setPdi('')} className="btn btn-secondary">Borrar</button>
          </div>
        </div>
                            
             <div className="col-md-4 mb-2">
              <label htmlFor="sector">Sector:</label>
              <div className="input-group mb-3" style={{ width: '114%' }}>
                
                <Dropdown style={{ width: 'calc(100% - 124px)' }}>
                  <Dropdown.Toggle
                    variant="outline-secondary"
                    id="dropdown-basic"
                    className="form-control"
                    style={{
                      borderTopLeftRadius: 0,
                      borderBottomLeftRadius: 0,
                      borderTopRightRadius: 0,
                      borderBottomRightRadius: 0,
                      borderColor: '#ced4da',
                      zIndex: 0 // corregir superposición
                    }}
                  >
                    {sector || 'Selecciona un sector'}
                  </Dropdown.Toggle>

                  <Dropdown.Menu className="w-100">
                    <Form.Control
                      type="text"
                      placeholder="Buscar sector"
                      value={sector}
                      onChange={handleInputSector}
                      onClick={() => {
                        setShowAll(true);
                        setSector('');
                        setServicios([]);
                        setServicio(''); 
                      }}
                      autoFocus
                      style={{ backgroundColor: '#f0f0f0' }}
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
                <button onClick={() => {setSector('');setServicios([]);setServicio('');}} className="btn btn-secondary">Borrar</button>
              </div>
             </div>
             <div className="col-md-4 mb-2">
              <label htmlFor="servicio">Servicio:</label>
              <div className="input-group mb-3" style={{ width: '114%' }}>
                
                <Dropdown style={{ width: 'calc(100% - 124px)' }}>
                  <Dropdown.Toggle
                    variant="outline-secondary"
                    id="dropdown-basic"
                    className="form-control"
                    style={{
                      borderTopLeftRadius: 0,
                      borderBottomLeftRadius: 0,
                      borderTopRightRadius: 0,
                      borderBottomRightRadius: 0,
                      borderColor: '#ced4da',
                      zIndex: 0 // corregir superposición
                    }}
                  >
                    {servicio || 'Selecciona un servicio'}
                  </Dropdown.Toggle>

                  <Dropdown.Menu className="w-100">
                    <Form.Control
                      type="text"
                      placeholder="Buscar servicio"
                      value={servicio}
                      onChange={handleInputServicio}
                      onClick={() => {
                        setShowAll(true);
                        setServicio('');
                        
                      }}
                      autoFocus
                      style={{ backgroundColor: '#f0f0f0' }}
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
                <button onClick={() => setServicio('')} className="btn btn-secondary">Borrar</button>
              </div>
             </div>
             
            <div className="col-md-12 mt-3">
              <button onClick={getPedidos} className="btn btn-warning me-2">Filtrar</button>
              <button onClick={handleClearFilters} className="btn btn-danger me-2">Borrar Filtros</button>
              <button onClick={handlePrint} className="btn btn-primary me-2">Imprimir</button>
              <button onClick={exportToExcel} className="btn btn-success me-2">Exportar a Excel</button>
              <CSVLink {...csvReport} className="btn btn-info">Exportar a CSV</CSVLink>
            </div>
          </div>
          
        </div>
<div className="card-footer">
  <div className="table-responsive">
    <table ref={tableRef} className="table table-striped table-bordered printableTable"  >
      <thead>
        <tr>
        <th scope="col">#</th>
          <th  scope="col" 
                  onClick={() => handleSort('codigo')}  
                  className={sortConfig.key === 'codigo' ? (sortConfig.direction === 'asc' ? 'asc' : 'desc') : ''}>Código</th>
          
          <th  scope="col" 
                  onClick={() => handleSort('nombre_sector')}  
                  className={sortConfig.key === 'nombre_sector' ? (sortConfig.direction === 'asc' ? 'asc' : 'desc') : ''}>Sector</th>
          <th  scope="col" 
                  onClick={() => handleSort('nombre_contratista')}  
                  className={sortConfig.key === 'nombre_contratista' ? (sortConfig.direction === 'asc' ? 'asc' : 'desc') : ''}>Contratista</th>
          <th scope="col" 
                  onClick={() => handleSort('nombre_servicio')}  
                  className={sortConfig.key === 'nombre_servicio' ? (sortConfig.direction === 'asc' ? 'asc' : 'desc') : ''}>Servicio</th>
          <th  scope="col" 
                  onClick={() => handleSort('nombre_pdi')}  
                  className={sortConfig.key === 'nombre_pdi' ? (sortConfig.direction === 'asc' ? 'asc' : 'desc') : ''}>PDI</th>
          <th scope="col" 
                  onClick={() => handleSort('fecha_valid')}  
                  className={sortConfig.key === 'fecha_valid' ? (sortConfig.direction === 'asc' ? 'asc' : 'desc') : ''}>Fecha Validado</th>

          <th  scope="col" 
                  onClick={() => handleSort('nombre_usuario')}  
                  className={sortConfig.key === 'nombre_usuario' ? (sortConfig.direction === 'asc' ? 'asc' : 'desc') : ''}>Validador</th>
          <th scope="col" 
                  onClick={() => handleSort('fecha')}  
                  className={sortConfig.key === 'fecha' ? (sortConfig.direction === 'asc' ? 'asc' : 'desc') : ''}>Fecha Generado</th>
          <th scope="col" 
                  onClick={() => handleSort('matricula')}  
                  className={sortConfig.key === 'matricula' ? (sortConfig.direction === 'asc' ? 'asc' : 'desc') : ''}>E4E</th>
          <th scope="col" 
                  onClick={() => handleSort('nombre_material')}  
                  className={sortConfig.key === 'nombre_material' ? (sortConfig.direction === 'asc' ? 'asc' : 'desc') : ''}>Material</th>
          <th scope="col" 
                  onClick={() => handleSort('cantidad')}  
                  className={sortConfig.key === 'cantidad' ? (sortConfig.direction === 'asc' ? 'asc' : 'desc') : ''}>Cnt.</th>
          <th scope="col" 
                  onClick={() => handleSort('precio_material')}  
                  className={sortConfig.key === 'precio_material' ? (sortConfig.direction === 'asc' ? 'asc' : 'desc') : ''}>P/U</th>
          <th scope="col" 
                  onClick={() => handleSort('importe')}  
                  className={sortConfig.key === 'importe' ? (sortConfig.direction === 'asc' ? 'asc' : 'desc') : ''}>Imp.</th>
          <th scope="col" 
                  onClick={() => handleSort('total')}  
                  className={sortConfig.key === 'total' ? (sortConfig.direction === 'asc' ? 'asc' : 'desc') : ''}>Total</th>
          <th scope="col" 
                  onClick={() => handleSort('estado')}  
                  className={sortConfig.key === 'estado' ? (sortConfig.direction === 'asc' ? 'asc' : 'desc') : ''}>Estado</th>
          
        </tr>
      </thead>
      <tbody>
        {currentItems.map((item, index) => (
          <tr key={item.id}>
            <th scope="row">{indexOfFirstItem + index + 1}</th>
            <td>{item.codigo}</td>
            <td>{item.nombre_sector}</td>
            <td>{item.nombre_contratista}</td>
            <td>{item.nombre_servicio}</td>
            <td>{item.nombre_pdi}</td>
            <td>{formatDate(item.fecha_valid)}</td>
            <td>{item.nombre_usuario}</td>
            <td>{formatDate(item.fecha)}</td>
            <td>{item.matricula}</td>
            <td>{item.nombre_material}</td>
            <td>{item.cantidad}</td>
            <td>{item.precio_material}</td>
            <td>{item.importe}</td>
            <td>{Number(item.total).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td>{<Status status={item.estado_id}/>}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
  <div className="d-flex justify-content-between">
          <div>
              Mostrando registros de {indexOfFirstItem + 1} al {indexOfLastItem > pedidosList.length ? pedidosList.length : indexOfLastItem} de un total de {pedidosList.length} registros
            </div>
  <PaginationControl
    page={currentPage}
    between={4}
    total={pedidosList.length}
    limit={itemsPerPage}
    changePage={(page) => setCurrentPage(page)}
  />
</div>
</div>
      </div>
    </div>
  );
};

export default Consolidar_Detalle;
