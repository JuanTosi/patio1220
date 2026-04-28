import Swal from "sweetalert2";

export const swalCustom = Swal.mixin({
  background: "var(--color-beige-claro)",
  color: "var(--color-verde-bosque)",
  confirmButtonColor: "var(--color-dorado)",
  buttonsStyling: true,
  customClass: {
    popup: "rounded-4 shadow-lg border border-var(--color-verde-bosque) p-4",
    confirmButton: "text-white px-4 py-2",
    cancelButton: "btn btn-outline-success px-4 py-2",
    title: "fw-bold",
    content: "fs-6",
  },
});