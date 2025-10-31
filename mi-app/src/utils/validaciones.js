export const VALIDACIONES = {
  titulo: {
    min: 3,
    max: 100,
    mensaje: 'El título debe tener entre 3 y 100 caracteres'
  },
  descripcion: {
    min: 30,
    max: 1000,
    mensaje: 'La descripción debe tener entre 30 y 1000 caracteres'
  },
  autor: {
    min: 2,
    max: 50,
    mensaje: 'El nombre debe tener entre 2 y 50 caracteres'
  },
  genero: {
    min: 3,
    max: 50,
    mensaje: 'El género debe tener entre 3 y 50 caracteres'
  },
  comentario: {
    min: 10,
    max: 500,
    mensaje: 'El comentario debe tener entre 10 y 500 caracteres'
  }
};

export function validarCampo(valor, tipo) {
  if (!valor) return 'Este campo es obligatorio';
  const config = VALIDACIONES[tipo];
  if (!config) return null;
  
  const length = valor.trim().length;
  if (length < config.min || length > config.max) {
    return config.mensaje;
  }
  return null;
}

export function validarAño(año) {
  if (!año) return null; // es opcional
  const añoNum = Number(año);
  if (isNaN(añoNum)) return 'El año debe ser un número';
  if (añoNum < 1970 || añoNum > new Date().getFullYear()) {
    return `El año debe estar entre 1970 y ${new Date().getFullYear()}`;
  }
  return null;
}