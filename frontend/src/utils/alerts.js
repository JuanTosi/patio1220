import Swal from "sweetalert2";

export const toast = (type, message) => {
  const colors = {
    success: "#2ecc71",
    error: "#e74c3c",
    warning: "#f1c40f",
    info: "#3498db",
  };

  Swal.fire({
    toast: true,
    position: "top-end",
    icon: type,
    title: message,
    showConfirmButton: false,
    timer: 2200,
    timerProgressBar: true,
    customClass: {
      popup: "custom-toast",
    },
  });

  const popup = document.querySelector(".custom-toast");
  if (popup) {
    popup.style.background = "transparent";
    popup.style.border = `1px solid ${colors[type]}`;
    popup.style.color = colors[type];
    popup.style.fontSize = "0.9rem";
    popup.style.fontWeight = "500";
    popup.style.backdropFilter = "blur(4px)";
    popup.style.boxShadow = "none";
  }
};

export const confirmDialog = async ({
  title = "¿Estás seguro?",
  text = "Esta acción no se puede deshacer",
  confirmButtonText = "Sí, eliminar",
  cancelButtonText = "Cancelar",
  icon = "warning",
}) => {
  const result = await Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonColor: "#e74c3c",
    cancelButtonColor: "#6c757d",
    confirmButtonText,
    cancelButtonText,
    reverseButtons: true,
    focusCancel: true,
    background: "rgba(255,255,255,0.9)",
  });
  return result.isConfirmed;
};
