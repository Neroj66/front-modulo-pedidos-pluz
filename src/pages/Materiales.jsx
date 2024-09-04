import React, { useState, useEffect, useContext, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { UserContext } from '../../src/components/userContext';
import Axios from 'axios';
import '../../src/styles/mystyles.css';
import { PaginationControl } from 'react-bootstrap-pagination-control';
import { CSVLink } from 'react-csv';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';


const Materiales = () => {
  const tableRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useContext(UserContext);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(11); // Número de elementos por página
  const [materialesList, setMateriales] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

  const headers = [
    { label: 'Matrícula', key: 'matricula' },
    { label: 'Descripción', key: 'descripcion' },
    { label: 'Unidad', key: 'unidad' },
    { label: 'Precio', key: 'precio' },
    { label: 'Existencia', key: 'existencia' },
   
  ];


  useEffect(() => {
    getMateriales();
  }, []);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sortedData = [...materialesList].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === 'asc' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    setMateriales(sortedData);
  };

  const getMateriales = () => {
    Axios.get('https://api-pedidos-g6aucsd4a0hqg2dm.brazilsouth-01.azurewebsites.net/materiales').then((response) => {
      setMateriales(response.data);
    });
  };


  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset page to 1 on search
  };

  const filteredItems = materialesList.filter((item) =>
    Object.values(item).some((val) => String(val).toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const csvReport = {
    data: filteredItems,
    headers: headers,
    filename: 'materiales-list.csv',
  };

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Pedidos');

    worksheet.columns = [
      { header: 'Matrícula', key: 'matricula', width: 20 },
      { header: 'Descripción', key: 'descripcion', width: 20 },
      { header: 'Unidad', key: 'unidad', width: 20 },
      { header: 'Precio', key: 'precio', width: 10 },
      { header: 'Existencia', key: 'existencia', width: 20 },
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
    saveAs(blob, 'materiales-seleccionados.xlsx');
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
                  onClick={() => handleSort('matricula')}
                  className={sortConfig.key === 'matricula' ? (sortConfig.direction === 'asc' ? 'asc' : 'desc') : ''}
                >
                  Matrícula
                </th>
                <th
                  scope="col"
                  onClick={() => handleSort('descripcion')}
                  className={sortConfig.key === 'descripcion' ? (sortConfig.direction === 'asc' ? 'asc' : 'desc') : ''}
                >
                  Descripción
                </th>
                <th
                  scope="col"
                  onClick={() => handleSort('unidad')}
                  className={sortConfig.key === 'unidad' ? (sortConfig.direction === 'asc' ? 'asc' : 'desc') : ''}
                >
                  Unidad
                </th>
                <th
                  scope="col"
                  onClick={() => handleSort('precio')}
                  className={sortConfig.key === 'precio' ? (sortConfig.direction === 'asc' ? 'asc' : 'desc') : ''}
                >
                  Precio
                </th>
                <th
                  scope="col"
                  onClick={() => handleSort('existencia')}
                  className={sortConfig.key === 'existencia' ? (sortConfig.direction === 'asc' ? 'asc' : 'desc') : ''}
                >
                  Existencia
                </th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((val, key) => (
                <tr key={val.id}>
                  <th scope="row">{indexOfFirstItem + key + 1}</th>
                  <td>{val.matricula}</td>
                  <td>{val.descripcion}</td>
                  <td>{val.unidad}</td>
                  <td>{val.precio}</td>
                  <td>{val.existencia}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="d-flex justify-content-between">
            <div>
              Mostrando registros de {indexOfFirstItem + 1} al {indexOfLastItem > materialesList.length ? materialesList.length : indexOfLastItem} de un total de {materialesList.length} registros
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
    </div>
  );
};

export default Materiales;
