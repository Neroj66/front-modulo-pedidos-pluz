import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import  '../styles/mystyles.css'

const Status = ({ status }) => {
  let className = 'badge ';
  let labelText = '';

  switch (status) {
    
    case 1:
      className += 'bg-info';
      labelText = 'Generado';
      break;

    case 2:
      className += 'bg-primary';
      labelText = 'Aprobado';
      break;
    case 3:
      className += 'bg-danger';
      labelText = 'Rechazo(Aprob.)';
      break;
    case 4:
      className += 'bg-success';
      labelText = 'Validado';
      break;
    case 5:
      className += 'bg-danger';
      labelText = 'Rechazo(Valid.)';
      break;
        
    default:
      className += 'bg-secondary';
      labelText = 'Desconocido';
  }

  return (
    <span className={`status-badge ${className}`}>{labelText}</span>
  );
};

export default Status;
