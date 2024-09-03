// Función para formatear la fecha en el formato deseado
import { format } from 'date-fns';

export function formatDate(dateString) {
    if (!dateString) {
        return null;
    }

    const date = new Date(dateString);
    return format(date, 'yyyy-MM-dd HH:mm:ss');
}

export function formatDateForFilename (date) {
    if (!date) return '';
  
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year.substring(2)}`; // Formato dd/mm/aa
  };