import { useCarritoStore } from '../store/carritoStore';
import { crearReservaAPI } from '../api/reservas.api';
import Swal from 'sweetalert2';

export const useCart = () => {
  const { 
    items, 
    total, 
    agregarAlCarrito, 
    eliminarDelCarrito, 
    actualizarCantidad,
    vaciarCarrito,
    getTotalItems 
  } = useCarritoStore();

  const addToCart = (producto, tamanio = null, cantidad = 1) => {
    try {
      agregarAlCarrito(producto, tamanio, cantidad);
      
      Swal.fire({
        icon: 'success',
        title: '¡Agregado!',
        text: `${producto.nombreProducto} agregado al carrito`,
        timer: 1500,
        showConfirmButton: false,
      });

      return { success: true };
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'No se pudo agregar al carrito',
      });
      return { success: false };
    }
  };

  const removeFromCart = async (itemId) => {
    const result = await Swal.fire({
      title: '¿Eliminar producto?',
      text: 'Se quitará del carrito',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      eliminarDelCarrito(itemId);
      Swal.fire({
        icon: 'success',
        title: 'Eliminado',
        timer: 1000,
        showConfirmButton: false,
      });
    }
  };

  const updateQuantity = (itemId, cantidad) => {
    if (cantidad < 1) {
      removeFromCart(itemId);
      return;
    }
    actualizarCantidad(itemId, cantidad);
  };

  const finalizarCompra = async (datosReserva) => {
    try {
      const productos = items.map(item => ({
        idProducto: item.producto.idProducto,
        idTamanio: item.tamanio?.idTamanio || null,
        cantidad: item.cantidad,
      }));

      const reservaData = {
        ...datosReserva,
        productos,
      };

      const response = await crearReservaAPI(reservaData);

      vaciarCarrito();

      Swal.fire({
        icon: 'success',
        title: '¡Reserva creada!',
        text: `Tu reserva #${response.idReserva} fue creada exitosamente`,
        confirmButtonText: 'Ver mis reservas',
      });

      return { success: true, data: response };
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error al crear reserva',
        text: error.response?.data?.error || 'Ocurrió un error',
      });
      return { success: false, error };
    }
  };

  const clearCart = async () => {
    if (items.length === 0) return;

    const result = await Swal.fire({
      title: '¿Vaciar carrito?',
      text: 'Se eliminarán todos los productos',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, vaciar',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      vaciarCarrito();
      Swal.fire({
        icon: 'success',
        title: 'Carrito vaciado',
        timer: 1000,
        showConfirmButton: false,
      });
    }
  };

  return {
    items,
    total,
    totalItems: getTotalItems(),
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    finalizarCompra,
  };
};