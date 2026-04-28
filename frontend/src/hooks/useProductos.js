import { useProductosStore } from '../store/productosStore';
import { getProductoPorId } from '../api/productos.api';
import Swal from 'sweetalert2';

export const useProductos = () => {
  const { 
    productos, 
    productoSeleccionado,
    isLoading, 
    error,
    fetchProductos,
    addProducto,
    updateProducto: updateProductoStore,
    deleteProducto: deleteProductoStore,
    toggleActivo,
    setProductoSeleccionado,
  } = useProductosStore();

  const cargarProductos = async () => {
    await fetchProductos();
  };

  const cargarProductoPorId = async (id) => {
    try {
      const data = await getProductoPorId(id);
      setProductoSeleccionado(data);
      return data;
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.error || 'Error al cargar producto',
      });
      return null;
    }
  };

  const agregarProducto = async (productoData) => {
    try {
      await addProducto(productoData);
      
      Swal.fire({
        icon: 'success',
        title: 'Producto creado',
        text: `${productoData.nombreProducto} fue creado exitosamente`,
        timer: 2000,
      });

      return { success: true };
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.error || 'No se pudo crear el producto',
      });
      return { success: false, error };
    }
  };

  const editarProducto = async (id, productoData) => {
    try {
      await updateProductoStore(id, productoData);
      
      Swal.fire({
        icon: 'success',
        title: 'Producto actualizado',
        timer: 2000,
      });

      return { success: true };
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.error || 'No se pudo editar el producto',
      });
      return { success: false, error };
    }
  };

  const cambiarEstado = async (id) => {
    try {
      await toggleActivo(id);
      return { success: true };
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cambiar el estado',
      });
      return { success: false, error };
    }
  };

  const eliminarProducto = async (id, nombreProducto) => {
    const result = await Swal.fire({
      title: '¿Eliminar producto?',
      text: `Se eliminará "${nombreProducto}" permanentemente`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
    });

    if (result.isConfirmed) {
      try {
        await deleteProductoStore(id);
        
        Swal.fire({
          icon: 'success',
          title: 'Producto eliminado',
          timer: 2000,
        });

        return { success: true };
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.error || 'No se pudo eliminar',
        });
        return { success: false, error };
      }
    }

    return { success: false };
  };

  return {
    productos,
    productoSeleccionado,
    isLoading,
    error,
    cargarProductos,
    cargarProductoPorId,
    agregarProducto,
    editarProducto,
    cambiarEstado,
    eliminarProducto,
  };
};