import '../styles/mystyles.css';
import React, { useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Axios from 'axios';

const VerPedidoModal = ({ pedido, onClose }) => {
  const [detalle, setDetalle] = useState([]);

  useEffect(() => {
    if (pedido) {
      Axios.get(`https://backend-modulo-pedidos.azurewebsites.net/obt-pedidos/pedidos_detalle/${pedido.id}`)
        .then((response) => {
          setDetalle(response.data);
        })
        .catch((error) => {
          console.error('Error fetching pedido detalle:', error);
        });
    }
  }, [pedido]);

  return (
    <Modal show={true} onHide={onClose} dialogClassName="custom-modal" centered backdrop="static">
      <Modal.Header closeButton>
          <div style={{ flexGrow: 1 }}>
              <Modal.Title>Detalle del Pedido #{pedido.codigo}</Modal.Title>
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
            marginRight: '19vh'
          }}
        >
          <strong>Total:</strong> {Number(pedido.total).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                      <th scope="col">Cant.</th>
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
                        <td>{Number(item.precio_material).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td>{Number(item.importe).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
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
    </Modal>
  );
};

export default VerPedidoModal;
