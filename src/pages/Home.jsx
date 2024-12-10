import React, { useState, useEffect, useContext, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { UserContext } from '../../src/components/userContext';
import Axios from 'axios';
import Swal from 'sweetalert2';
import '../../src/styles/mystyles.css';
import Status from '../../src/components/Estado';
import { formatDate } from '../../src/assets/js/functions';
import { PaginationControl } from 'react-bootstrap-pagination-control';
import { CSVLink } from 'react-csv';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import TrazabilidadModal from '../../src/components/TrazabilidadModal';
import VerPedidoModal from '../../src/components/VerPedidoModal'; // Importar el nuevo componente

const Home = () => {
  const tableRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useContext(UserContext);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(7); // Número de elementos por página
  const [pedidosList, setPedidos] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

  const headers = [
    { label: 'Sector', key: 'nombre_sector' },
    { label: 'Contratista', key: 'nombre_contratista' },
    { label: 'Servicio', key: 'nombre_servicio' },
    { label: 'Código', key: 'codigo' },
    { label: 'PDI', key: 'nombre_pdi' },
    { label: 'LCL', key: 'LCL_ING' },
    { label: 'Usuario', key: 'nombre_usuario' },
    { label: 'Fecha', key: 'fecha' },
    { label: 'Total', key: 'total' },
    { label: 'Estado', key: 'estado' },
  ];

  const estadoMapping = {
    1: 'Generado',
    2: 'Aprobado',
    3: 'Rechazado por Aprobador',
    4: 'Validado',
    5: 'Rechazado por Validador',
    6: "Vencido"
  };

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
    Axios.get('https://backend-modulo-pedidos.azurewebsites.net/obt-pedidos/pedidos').then((response) => {
      setPedidos(response.data);
    });
  };

  const mappedItems = pedidosList.map((item) => ({
    ...item,
    fecha: formatDate(item.fecha),
    estado: estadoMapping[item.estado_id] || item.estado_id,
  }));

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset page to 1 on search
  };

  const filteredItems = mappedItems.filter((item) =>
    Object.values(item).some((val) => String(val).toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const csvReport = {
    data: filteredItems,
    headers: headers,
    filename: 'pedidos-list.csv',
  };

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Pedidos');

    worksheet.columns = [
      { header: 'Sector', key: 'nombre_sector', width: 20 },
      { header: 'Contratista', key: 'nombre_contratista', width: 20 },
      { header: 'Servicio', key: 'nombre_servicio', width: 20 },
      { header: 'Código', key: 'codigo', width: 10 },
      { header: 'PDI', key: 'nombre_pdi', width: 20 },
      { header: 'LCL', key: 'LCL_ING', width: 10 },
      { header: 'Usuario', key: 'nombre_usuario', width: 20 },
      { header: 'Fecha', key: 'fecha', width: 20 },
      { header: 'Total', key: 'total', width: 10 },
      { header: 'Estado', key: 'estado', width: 20 },
    ];

    filteredItems.forEach((item) => {
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
    saveAs(blob, 'pedidos-seleccionados.xlsx');
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

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

  const [selectedPedido, setSelectedPedido] = useState(null);
  const [selectedDetallePedido, setSelectedDetallePedido] = useState(null);

  const openTrazabilidadModal = (pedido) => {
    setSelectedPedido(pedido);
  };

  const closeTrazabilidadModal = () => {
    setSelectedPedido(null);
  };

  const openVerPedidoModal = (pedido) => {
    setSelectedDetallePedido(pedido);
  };

  const closeVerPedidoModal = () => {
    setSelectedDetallePedido(null);
  };

  return (
    <div className="container">
      <div className="card text-center">
        <div className="card-header">Gestión de Pedidos</div>
        <div>{user && <h1>Bienvenido! usuario: {user}</h1>}</div>
      </div>
      <div className="table responsive">
        <div className="card text-center">
          <div className="ibox-title" align="left">
            <h5>Listado de pedidos </h5>
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={handleSearch}
              className="form-control"
            />
            <CSVLink {...csvReport} className="btn btn-primary">
              Exportar a CSV
            </CSVLink>
            <button onClick={exportToExcel} className="btn btn-primary">
              Exportar a Excel
            </button>
            <button onClick={handlePrint} className="btn btn-primary">
              Imprimir
            </button>
          </div>
          <table ref={tableRef} className="table table-striped table-bordered printableTable">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th
                  scope="col"
                  onClick={() => handleSort('nombre_sector')}
                  className={sortConfig.key === 'nombre_sector' ? (sortConfig.direction === 'asc' ? 'asc' : 'desc') : ''}
                >
                  Sector
                </th>
                <th
                  scope="col"
                  onClick={() => handleSort('nombre_contratista')}
                  className={sortConfig.key === 'nombre_contratista' ? (sortConfig.direction === 'asc' ? 'asc' : 'desc') : ''}
                >
                  Contratista
                </th>
                <th
                  scope="col"
                  onClick={() => handleSort('nombre_servicio')}
                  className={sortConfig.key === 'nombre_servicio' ? (sortConfig.direction === 'asc' ? 'asc' : 'desc') : ''}
                >
                  Servicio
                </th>
                <th
                  scope="col"
                  onClick={() => handleSort('codigo')}
                  className={sortConfig.key === 'codigo' ? (sortConfig.direction === 'asc' ? 'asc' : 'desc') : ''}
                >
                  Código
                </th>
                <th
                  scope="col"
                  onClick={() => handleSort('nombre_pdi')}
                  className={sortConfig.key === 'nombre_pdi' ? (sortConfig.direction === 'asc' ? 'asc' : 'desc') : ''}
                >
                  PDI
                </th>
                <th
                  scope="col"
                  onClick={() => handleSort('LCL_ING')}
                  className={sortConfig.key === 'LCL_ING' ? (sortConfig.direction === 'asc' ? 'asc' : 'desc') : ''}
                >
                  LCL
                </th>
                <th
                  scope="col"
                  onClick={() => handleSort('usuario')}
                  className={`header-cell ${sortConfig.key === 'usuario' ? (sortConfig.direction === 'asc' ? 'asc' : 'desc') : ''}`}
                >
                  Usuario
                </th>
                <th
                  scope="col"
                  onClick={() => handleSort('fecha')}
                  className={sortConfig.key === 'fecha' ? (sortConfig.direction === 'asc' ? 'asc' : 'desc') : ''}
                >
                  Fecha
                </th>
                <th
                  scope="col"
                  onClick={() => handleSort('total')}
                  className={`header-cell ${sortConfig.key === 'total' ? (sortConfig.direction === 'asc' ? 'asc' : 'desc') : ''}`}
                >
                  Total
                </th>
                <th
                  scope="col"
                  onClick={() => handleSort('estado_id')}
                  className={sortConfig.key === 'estado_id' ? (sortConfig.direction === 'asc' ? 'asc' : 'desc') : ''}
                >
                  Estado
                </th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((val, key) => (
                <tr key={val.id}>
                  <th scope="row">{indexOfFirstItem + key + 1}</th>
                  <td>{val.nombre_sector}</td>
                  <td>{val.nombre_contratista}</td>
                  <td>{val.nombre_servicio}</td>
                  <td>{val.codigo}</td>
                  <td>{val.nombre_pdi}</td>
                  <td>{val.LCL_ING}</td>
                  <td>{val.nombre_usuario}</td>
                  <td>{formatDate(val.fecha)}</td>
                  <td>{Number(val.total).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td>
                    <Status status={val.estado_id} />
                  </td>
                  <td>
                    <div className="btn-group" role="group" aria-label="Basic example">
                      <button type="button" onClick={() => openTrazabilidadModal(val)} className="btn btn-success">
                        Trazabilidad
                      </button>
                      <button type="button" onClick={() => openVerPedidoModal(val)} className="btn btn-info">
                        Ver Pedido
                      </button>
                    </div>
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
              changePage={(page) => setCurrentPage(page)}
              ellipsis={1}
              page={currentPage}
              total={filteredItems.length}
              limit={itemsPerPage}
              last
            />
          </div>
        </div>
      </div>
      {selectedPedido && <TrazabilidadModal pedido={selectedPedido} onClose={closeTrazabilidadModal} />}
      {selectedDetallePedido && <VerPedidoModal pedido={selectedDetallePedido} onClose={closeVerPedidoModal} />}
    </div>
  );
};

export default Home;
