import React from 'react';
import Modal from 'react-bootstrap/Modal';
import { formatDate ,formatDateForFilename} from '../assets/js/functions';

const TrazabilidadModal = ({ pedido, onClose }) => {
  const showArrow = (currentState, nextState) => {
    return nextState !== undefined && nextState !== null;
  };

  return (
    <Modal show={true} onHide={onClose} dialogClassName="custom-modal"  backdrop="static" centered>
      <Modal.Header closeButton>
        <Modal.Title>Trazabilidad del Pedido    #{pedido.codigo}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="process-diagram">
          {pedido.fecha && (
            <div className="process-step">
              <div className="step-content">
                <div className="step-label">Generación </div>
                <div className="step-date">{pedido.fecha}</div>
                <div className="step-label">{pedido.nombre_usuario}</div>
              </div>
             
            </div>
          )}
 {showArrow(pedido.fecha, pedido.fecha_aprobacion) && (
                <div className="process-step-line" />
              )}
          {pedido.fecha_aprobacion && (
            <div className="process-step">
            <div className="step-content">
            {pedido.estado_id === 3 ? (
              <div className="step-label">Rechazó Aprobador</div>
            ) :  (
              <>
                <div className="step-label">Aprobación</div>
              </>
            ) }
            <div className="step-date">{formatDate(pedido.fecha_aprobacion)}</div>
            <div className="step-label">{pedido.nombre_aprobador}</div>
            </div>
            </div>
          )}
 {showArrow(pedido.fecha_aprobacion, pedido.fecha_validacion) && pedido.send_validacion === 1 && (
                <div className="process-step-line" />
              )}
          {pedido.fecha_validacion && pedido.send_validacion === 1 &&  (
            <div className="process-step">
            <div className="step-content">
            {pedido.estado_id === 5 ? (
              <div className="step-label">Rechazó Validador</div>
            ) : (
              <>
                <div className="step-label">Validación </div>
              </>
            ) }
                <div className="step-date">{formatDate(pedido.fecha_validacion)}</div>
                <div className="step-label">{pedido.nombre_validador}</div>
              </div>
            </div>
          )}
        </div>
      </Modal.Body>
    </Modal>
  );
};


export default TrazabilidadModal;
