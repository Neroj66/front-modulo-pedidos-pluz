import React, { useState, useEffect ,useContext, useRef} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { UserContext } from '../components/userContext';
import Axios from 'axios';
import  '../styles/mystyles.css'
import Status from '../components/Estado';
import { formatDate } from '../assets/js/functions';
import { PaginationControl } from 'react-bootstrap-pagination-control';
import { CSVLink } from 'react-csv';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const Materiales_Pedidos = ({username}) => {
  const tableRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { user } = useContext(UserContext);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(7); // Número de elementos por página


  const [pedidosList, setPedidos] = useState([]);


  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });


  useEffect(() => {
    getPedidos();

  }, []);


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
  

  const getPedidos = () => {
    Axios.get("https://backend-modulo-pedidos.azurewebsites.net/obt-pedidos/pedidos_detalle").then((response) => {
      setPedidos(response.data);
    })
  }



  const headers = [
    { label: "Código", key: "codigo" },
    { label: "Usuario", key: "nombre_usuario" },
    { label: "Fecha", key: "fecha" },
    { label: "Sector", key: "nombre_sector" },
    { label: "Contratista", key: "nombre_contratista" },
    { label: "Servicio", key: "nombre_servicio" },
    { label: "PDI", key: "nombre_pdi" },
    { label: "LCL", key: "lcl" },
    { label: "Matrícula", key: "matricula" },
    { label: "Material", key: "nombre_material" },
    { label: "Cantidad", key: "cantidad" },
    { label: "P/U", key: "precio_material" },
    { label: "Importe", key: "importe" },
    { label: "Total Pedido", key: "total" },
    { label: "Estado", key: "estado" }
  ];
  const estadoMapping = {
    1: 'Generado',
    2: 'Aprobado',
    3: 'Rechazado por Aprobador',
    4: 'Validado',
    5: 'Rechazado por Validador'
  };

  const mappedItems = pedidosList.map(item => ({
    ...item,
    fecha: formatDate(item.fecha),
    estado: estadoMapping[item.estado_id] || item.estado_id
  }));
  const filteredItems = mappedItems.filter(item =>
    Object.values(item).some(val =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );
  const csvReport = {
    data: filteredItems,
    headers: headers,
    filename: 'materiales-pedidos-list.csv'
  };

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Pedidos');

    worksheet.columns = [
      { header: 'Código', key: 'codigo', width: 10 },
      { header: 'Usuario', key: 'nombre_usuario', width: 20 },
      { header: 'Fecha', key: 'fecha', width: 20 },
      { header: 'Sector', key: 'nombre_sector', width: 20 },
      { header: 'Contratista', key: 'nombre_contratista', width: 20 },
      { header: 'Servicio', key: 'nombre_servicio', width: 30 },
      { header: 'PDI', key: 'nombre_pdi', width: 20 },
      { header: 'LCL', key: 'lcl', width: 10 },
      { header: 'Matrícula', key: 'matricula', width: 10 },
      { header: 'Material', key: 'nombre_material', width: 20 },
      { header: 'Cantidad', key: 'cantidad', width: 10 },
      { header: 'P/U', key: 'precio_material', width: 10 },
      { header: 'Importe', key: 'importe', width: 10 },
      { header: 'Total Pedido', key: 'total', width: 20 },
      { header: 'Estado', key: 'estado', width: 20 }
    ];

    filteredItems.forEach(item => {
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
    saveAs(blob, 'materiales-pedidos-seleccionados.xlsx');
  };

  const handlePrint = () => {
    if (tableRef.current) {
      const tableHtml = tableRef.current.outerHTML;
      const originalContent = document.body.innerHTML;
      document.body.innerHTML = tableHtml;
      window.print();
      document.body.innerHTML = originalContent;
      window.location.reload(); // Para recargar los event listeners de React
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset page to 1 on search
  };



// Función para obtener los índices de los elementos actuales en la página
const indexOfLastItem = currentPage * itemsPerPage;
const indexOfFirstItem = indexOfLastItem - itemsPerPage;
const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);



  return (
    <div className="container">
      <div className="card text-center">
        <div className="card-header">
          Gestión de Pedidos
        </div>
        <div>
      {user && <h1>Bienvenido, {user}!</h1>}  
    </div>
      </div>
      <div className="table responsive">
      <div className="card text-center">
      <div class="ibox-title" align="left">
        <h5>Listado de pedidos </h5>
        <input 
              type="text" 
              placeholder="Buscar..." 
              value={searchTerm}
              onChange={handleSearch} 
              className="form-control"
            />
        <CSVLink {...csvReport} className="btn btn-primary">Exportar a CSV</CSVLink>
        <button onClick={exportToExcel} className="btn btn-primary">Exportar a Excel</button>
        <button onClick={handlePrint} className="btn btn-primary">Imprimir</button>
        
      </div>
    <div className="card-footer">
      <div className="table-responsive">
      <table ref={tableRef} className="table table-striped table-bordered printableTable">
        <thead >
          <tr>
            <th scope="col">#</th>
            <th scope="col" onClick={() => handleSort('estado')} className={sortConfig.key === 'estado' ? (sortConfig.direction === 'asc' ? 'asc' : 'desc') : ''}>Estado</th>
            <th scope="col" onClick={() => handleSort('codigo')}className={sortConfig.key === 'codigo' ? (sortConfig.direction === 'asc' ? 'asc' : 'desc') : ''}>Código</th>
            <th scope="col" onClick={() => handleSort('usuario')} className={`header-cell ${sortConfig.key === 'usuario' ? (sortConfig.direction === 'asc' ? 'asc' : 'desc') : ''}`}>Usuario</th>
            <th scope="col"  onClick={() => handleSort('fecha')} className={sortConfig.key === 'fecha' ? (sortConfig.direction === 'asc' ? 'asc' : 'desc') : ''}>Fecha</th>
            <th scope="col" onClick={() => handleSort('nombre_sector')}className={sortConfig.key === 'nombre_sector' ? (sortConfig.direction === 'asc' ? 'asc' : 'desc') : ''}>Sector</th>
            <th scope="col" onClick={() => handleSort('nombre_contratista')}className={sortConfig.key === 'nombre_contratista' ? (sortConfig.direction === 'asc' ? 'asc' : 'desc') : ''}>Contratista</th>
            <th scope="col" onClick={() => handleSort('nombre_servicio')}className={sortConfig.key === 'nombre_servicio' ? (sortConfig.direction === 'asc' ? 'asc' : 'desc') : ''}>Servicio</th>
            <th scope="col" onClick={() => handleSort('nombre_pdi')} className={sortConfig.key === 'nombre_pdi' ? (sortConfig.direction === 'asc' ? 'asc' : 'desc') : ''}>PDI</th>
            <th scope="col" onClick={() => handleSort('lcl')} className={sortConfig.key === 'lcl' ? (sortConfig.direction === 'asc' ? 'asc' : 'desc') : ''}>LCL</th>
            <th scope="col" onClick={() => handleSort('matricula')} className={sortConfig.key === 'matricula' ? (sortConfig.direction === 'asc' ? 'asc' : 'desc') : ''}>Matr.</th>
            <th scope="col" onClick={() => handleSort('nombre_material')} className={sortConfig.key === 'nombre_material' ? (sortConfig.direction === 'asc' ? 'asc' : 'desc') : ''}>Material</th>
            <th scope="col" onClick={() => handleSort('cantidad')} className={`header-cell ${sortConfig.key === 'cantidad' ? (sortConfig.direction === 'asc' ? 'asc' : 'desc') : ''}`}>Cnt.</th>
            <th scope="col" onClick={() => handleSort('precio_material')} className={`header-cell ${sortConfig.key === 'precio_material' ? (sortConfig.direction === 'asc' ? 'asc' : 'desc') : ''}`}>P/U</th>
            <th scope="col" onClick={() => handleSort('importe')} className={`header-cell ${sortConfig.key === 'importe' ? (sortConfig.direction === 'asc' ? 'asc' : 'desc') : ''}`}>Imp.</th>
            <th scope="col" onClick={() => handleSort('total')} className={`header-cell ${sortConfig.key === 'total' ? (sortConfig.direction === 'asc' ? 'asc' : 'desc') : ''}`}>Total</th> 
          </tr>
        </thead>
        <tbody>
          {currentItems.map((val, key) => (
           <tr key={val.id}  >
              <th scope="row">{indexOfFirstItem + key + 1}</th>
              <td >
                <Status status={val.estado_id}/>
              </td>
              <td>{val.codigo}</td>
              <td>{val.nombre_usuario}</td>
              <td>{formatDate(val.fecha)}</td>
              <td>{val.nombre_sector}</td>
              <td>{val.nombre_contratista}</td>
              <td>{val.nombre_servicio}</td>
              <td>{val.nombre_pdi}</td>
              <td>{val.lcl}</td>
              <td>{val.matricula}</td>
              <td>{val.nombre_material}</td>
              <td>{val.cantidad}</td>
              <td>{val.precio_material}</td>
              <td>{val.importe}</td>
              <td>{val.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
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
    total={filteredItems.length}
    limit={itemsPerPage}
    last
    
  />
        </div>
      </div>
      </div>
    </div>
  );
}

export default Materiales_Pedidos;