import React, { useState } from 'react'; 
import { Modal, Button } from 'react-bootstrap';

const EditableTableModal = ({ show, handleClose, onSave }) => {
  const initialRows = [{ material: '', cantidad: '' }];
  const [rows, setRows] = useState(initialRows);
  const [errors, setErrors] = useState([{ material: '', cantidad: '' }]);

  const isValidInteger = (value) => /^\d+$/.test(value);

  const handleInputChange = (index, event) => {
    const { name, value } = event.target;
    const newRows = [...rows];
    newRows[index][name] = value;
    setRows(newRows);
    validateRow(index, newRows);
  };

  const validateRow = (index, newRows) => {
    const row = newRows[index];
    const newErrors = [...errors];

    newErrors[index] = {
      material: isValidInteger(row.material) ? '' : 'Código debe ser numérico',
      cantidad: isValidInteger(row.cantidad) ? '' : 'Debe ser un número entero',
    };

    setErrors(newErrors);
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const paste = event.clipboardData.getData('text');
    const lines = paste.split('\n').filter(line => line.trim() !== '');

    const newRows = lines.map(line => {
      const [material, cantidad] = line.split('\t');
      return { material: material.trim(), cantidad: cantidad.trim() };
    });

    const newErrors = newRows.map(row => ({
      material: isValidInteger(row.material) ? '' : 'Código debe ser numérico',
      cantidad: isValidInteger(row.cantidad) ? '' : 'Debe ser un número entero',
    }));

    setRows((prevRows) =>
      prevRows[0].material === '' && prevRows[0].cantidad === ''
        ? newRows
        : [...prevRows, ...newRows]
    );
    setErrors((prevErrors) =>
      prevErrors[0].material === '' && prevErrors[0].cantidad === ''
        ? newErrors
        : [...prevErrors, ...newErrors]
    );
  };

  const addRow = () => {
    setRows([...rows, { material: '', cantidad: '' }]);
    setErrors([...errors, { material: '', cantidad: '' }]);
  };

  const deleteRow = (index) => {
    const newRows = rows.filter((_, i) => i !== index);
    const newErrors = errors.filter((_, i) => i !== index);
    setRows(newRows);
    setErrors(newErrors);
  };

  const handleSave = () => {
    if (errors.every(error => !error.material && !error.cantidad)) {
      onSave(rows); 
      // Reiniciar rows y errors al guardar
      setRows(initialRows);
      setErrors([{ material: '', cantidad: '' }]);
      handleClose(); // Cerrar el modal
    } else {
      alert('Corrige los errores antes de guardar.');
    }
  };

  const handleCloseModal = () => {
    // Reiniciar rows y errors al cerrar el modal
    setRows(initialRows);
    setErrors([{ material: '', cantidad: '' }]);
    handleClose(); // Llamar a la función handleClose pasada como prop
  };

  // Estilo para el cuerpo del modal
  const modalBodyStyle = {
    maxHeight: '400px', // Ajusta la altura máxima según tus necesidades
    overflowY: 'auto',   // Permite el desplazamiento vertical
  };

  return (
    <Modal show={show} onHide={handleCloseModal} centered>
      <Modal.Header closeButton>
        <Modal.Title>Copiar datos de Excel</Modal.Title>
      </Modal.Header>
      <Modal.Body style={modalBodyStyle}>
        <div style={{ width: '100%' }}>
          <table border="1" cellPadding="10" cellSpacing="0" width="100%">
            <thead>
              <tr>
                <th>Material (Código numérico)</th>
                <th>Cantidad (Número entero)</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody onPaste={handlePaste}>
              {rows.map((row, index) => (
                <tr key={index}>
                  <td>
                    <input
                      type="text"
                      name="material"
                      value={row.material}
                      onChange={(event) => handleInputChange(index, event)}
                      placeholder="Ingresar material"
                      style={{ borderColor: errors[index]?.material ? 'red' : 'black' }}
                      aria-invalid={!!errors[index]?.material}
                    />
                    {errors[index]?.material && <span style={{ color: 'red' }}>{errors[index].material}</span>}
                  </td>
                  <td>
                    <input
                      type="text"
                      name="cantidad"
                      value={row.cantidad}
                      onChange={(event) => handleInputChange(index, event)}
                      placeholder="Ingresar cantidad"
                      style={{ borderColor: errors[index]?.cantidad ? 'red' : 'black', width: '80%' }}
                      aria-invalid={!!errors[index]?.cantidad}
                    />
                    {errors[index]?.cantidad && <span style={{ color: 'red' }}>{errors[index].cantidad}</span>}
                  </td>
                  <td>
                    <button onClick={() => deleteRow(index)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={addRow} style={{ marginTop: '10px' }}>Agregar fila</button>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleCloseModal}>Cerrar</Button>
        <Button variant="primary" onClick={handleSave}>Guardar</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditableTableModal;
