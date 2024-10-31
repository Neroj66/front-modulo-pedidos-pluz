import React, { useState, useContext, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { UserContext } from '../../src/components/userContext';
import Axios from 'axios';
import { formatDateForFilename } from '../../src/assets/js/functions';
import '../../src/styles/mystyles.css';
import { PaginationControl } from 'react-bootstrap-pagination-control';
import { CSVLink } from 'react-csv';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const Consolidar_Logistica = ({ username }) => {
  const tableRef = useRef(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const { user } = useContext(UserContext);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(7);
  const [pedidosList, setPedidos] = useState([]);
  const [error, setError] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });

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
    if (!validateDates()) {
      return;
    }

    const params = {};

    if (dateFrom) {
      params.dateFrom = dateFrom;
    }

    if (dateTo) {
      params.dateTo = dateTo;
    }

    Axios.get("https://backend-modulo-pedidos.azurewebsites.net/consolidador/logistica", { params })
      .then((response) => {
        setPedidos(response.data);
        setCurrentPage(1); // Reset page to 1 after new data fetch
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
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
    { label: "PDI", key: "nombre_pdi" },
    { label: "Contratista", key: "nombre_contratista" },
    { label: "Matrícula", key: "matricula" },
    { label: "P. Unitario", key: "precio" },
    { label: "Cantidad", key: "cantidad_total"},
    { label: "Importe", key: "importe_total" }
  ];

  const csvReport = {
    data: pedidosList,
    headers: headers,
    filename: `pedidos-logistica_${dateFrom ? `desde_${formatDateForFilename(dateFrom)}` : 'sin_fecha_desde'}_${dateTo ? `hasta_${formatDateForFilename(dateTo)}` : 'sin_fecha_hasta'}.csv`
  };

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Pedidos');

    worksheet.columns = [
      { header: 'PDI', key: 'nombre_pdi', width: 20 },
      { header: 'Contratista', key: 'nombre_contratista', width: 20 },
      { header: 'Matrícula', key: 'matricula', width: 20 },
      { header: 'P. Unitario', key: 'precio', width: 10 },
      { header: 'Cantidad', key: 'cantidad_total', width: 10 },
      { header: 'Importe', key: 'importe_total', width: 10 }
    ];

    pedidosList.forEach(item => {
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
    saveAs(blob, `consolidado logistica_${dateFrom ? `desde_${formatDateForFilename(dateFrom)}` : 'sin_fecha_desde'}_${dateTo ? `hasta_${formatDateForFilename(dateTo)}` : 'sin_fecha_hasta'}.xlsx`);
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
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = pedidosList.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="container">
      <div className="card text-center">
        <div className="card-header">
          Consolidar Pedidos para Envio a Logística
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
              <label htmlFor="dateFrom">Desde:</label>
              <div className="d-flex">
                <input
                  type="date"
                  id="dateFrom"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="form-control"
                />
                <button onClick={() => setDateFrom('')} className="btn btn-secondary ms-2">Limpiar</button>
              </div>
            </div>
            <div className="col-md-4 mb-2">
              <label htmlFor="dateTo">Hasta:</label>
              <div className="d-flex">
                <input
                  type="date"
                  id="dateTo"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="form-control"
                />
                <button onClick={() => setDateTo('')} className="btn btn-secondary ms-2">Limpiar</button>
              </div>
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
        <div className="card-footer">
          <div className="table-responsive">
            <table ref={tableRef} className="table table-striped table-bordered printableTable">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col" 
                  onClick={() => handleSort('nombre_pdi')}  
                  className={sortConfig.key === 'nombre_pdi' ? (sortConfig.direction === 'asc' ? 'asc' : 'desc') : ''}>PDI</th>
                  <th scope="col" onClick={() => handleSort('nombre_contratista')} 
                  className={sortConfig.key === 'nombre_contratista' ? (sortConfig.direction === 'asc' ? 'asc' : 'desc') : ''}>Contratista</th>
                  <th scope="col" onClick={() => handleSort('matricula')} 
                  className={sortConfig.key === 'matricula' ? (sortConfig.direction === 'asc' ? 'asc' : 'desc') : ''}>Matrícula</th>
                  <th scope="col" onClick={() => handleSort('precio')} 
                  className={sortConfig.key === 'precio' ? (sortConfig.direction === 'asc' ? 'asc' : 'desc') : ''}>P. Unitario</th>
                  <th scope="col" onClick={() => handleSort('cantidad_total')} 
                  className={sortConfig.key === 'cantidad_total' ? (sortConfig.direction === 'asc' ? 'asc' : 'desc') : ''}>Cantidad</th>
                  <th scope="col" onClick={() => handleSort('importe_total')} 
                  className={sortConfig.key === 'importe_total' ? (sortConfig.direction === 'asc' ? 'asc' : 'desc') : ''}>Importe</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((item, index) => (
                  <tr key={index}>
                    <td>{indexOfFirstItem + index + 1}</td>
                    <td>{item.nombre_pdi}</td>
                    <td>{item.nombre_contratista}</td>
                    <td>{item.matricula}</td>
                    <td>{Number(item.precio).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td>{Number(item.cantidad_total).toLocaleString('en-US')}</td>
                    <td>{Number(item.importe_total).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
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

export default Consolidar_Logistica;

