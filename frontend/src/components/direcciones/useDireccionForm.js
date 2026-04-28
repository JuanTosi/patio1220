import { useState, useCallback } from "react";
import { fetchProvincias, fetchLocalidades } from "../../utils/geoApi";
import { useDireccionesStore } from "../../store/direccionesStore";

const EMPTY_FORM = {
    alias: "",
    calle: "",
    numero: "",
    piso: "",
    departamento: "",
    provincia: "",
    localidad: "",
    codigoPostal: "",
    referencia: "",
    esPrincipal: false,
};

const normalizar = (obj) => ({
    alias: obj.alias || "",
    calle: obj.calle || "",
    numero: obj.numero || "",
    piso: obj.piso || "",
    departamento: obj.departamento || "",
    provincia: obj.provincia || "",
    localidad: obj.localidad || "",
    codigoPostal: obj.codigoPostal || "",
    referencia: obj.referencia || "",
    esPrincipal: obj.esPrincipal === 1 || obj.esPrincipal === true,
});

const tuvoCambios = (formData, initialData) => {
    const base = initialData ? normalizar(initialData) : EMPTY_FORM;
    return JSON.stringify(formData) !== JSON.stringify(base);
};

const validar = (formData, localidades) => {
    const errors = {};

    if (!formData.calle || formData.calle.trim().length < 3)
        errors.calle = "La calle debe tener al menos 3 caracteres";

    if (!formData.numero || formData.numero.trim() === "")
        errors.numero = "El número es obligatorio";

    if (!formData.provincia)
        errors.provincia = "Seleccioná una provincia";

    if (!formData.localidad || formData.localidad.trim() === "") {
        errors.localidad = "La localidad es obligatoria";
    } else {
        const existe = localidades.some(
            (loc) => loc.nombre.toLowerCase() === formData.localidad.toLowerCase().trim()
        );
        if (!existe)
            errors.localidad = "Seleccioná una localidad de las sugerencias";
    }

    if (formData.codigoPostal && !/^\d{4}$/.test(formData.codigoPostal))
        errors.codigoPostal = "El código postal debe tener 4 dígitos";

    return errors;
};

export const useDireccionForm = ({ initialData = null, onSuccess, onCancel }) => {
    const { agregarDireccion, editarDireccion } = useDireccionesStore();

    const base = initialData ? normalizar(initialData) : { ...EMPTY_FORM };

    const [formData, setFormData] = useState(base);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const [provincias, setProvincias] = useState([]);
    const [loadingProvincias, setLoadingProvincias] = useState(false);

    const [localidades, setLocalidades] = useState([]);
    const [loadingLocalidades, setLoadingLocalidades] = useState(false);

    const cargarProvincias = useCallback(async () => {
        if (provincias.length > 0) return;
        setLoadingProvincias(true);
        try {
            const data = await fetchProvincias();
            setProvincias(data);
        } catch {
            console.log("");
        } finally {
            setLoadingProvincias(false);
        }
    }, [provincias.length]);

    const cargarLocalidades = useCallback(async (nombreProvincia) => {
        setLocalidades([]);
        if (!nombreProvincia) return;
        setLoadingLocalidades(true);
        try {
            const data = await fetchLocalidades(nombreProvincia);
            setLocalidades(data);
        } catch {
            console.log("");
        } finally {
            setLoadingLocalidades(false);
        }
    }, []);

    const handleChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
    }, []);

    const handleProvinciaChange = useCallback((e) => {
        const nuevaProvincia = e.target.value;
        setFormData((prev) => ({ ...prev, provincia: nuevaProvincia, localidad: "" }));
        setErrors((prev) => ({ ...prev, provincia: "", localidad: "" }));
        cargarLocalidades(nuevaProvincia);
    }, [cargarLocalidades]);

    const handleLocalidadChange = useCallback((value) => {
        setFormData((prev) => ({ ...prev, localidad: value }));
        setErrors((prev) => ({ ...prev, localidad: "" }));
    }, []);

    const hayPendientes = tuvoCambios(formData, initialData);

    const handleSubmit = async (e) => {
        e?.preventDefault();

        const validationErrors = validar(formData, localidades);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        if (initialData?.idDireccion && !hayPendientes) {
            onSuccess?.({ updated: false, created: false, direccion: initialData });
            return;
        }

        setSubmitting(true);
        try {
            let result;
            if (initialData?.idDireccion) {
                result = await editarDireccion(initialData.idDireccion, formData);
            } else {
                result = await agregarDireccion(formData);
            }

            if (result.ok) {
                onSuccess?.({
                    created: !initialData?.idDireccion,
                    updated: !!initialData?.idDireccion,
                    direccion: formData,
                });
            } else {
                setErrors({ general: result.error });
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = useCallback(() => {
        onCancel?.({ hayPendientes });
    }, [hayPendientes, onCancel]);

    const esModoEdicion = !!initialData?.idDireccion;
    const esPrincipalOriginal = initialData?.esPrincipal === 1;

    return {
        formData,
        errors,
        submitting,
        hayPendientes,
        esModoEdicion,
        esPrincipalOriginal,
        provincias,
        loadingProvincias,
        localidades,
        loadingLocalidades,
        cargarProvincias,
        cargarLocalidades,
        handleChange,
        handleProvinciaChange,
        handleLocalidadChange,
        handleSubmit,
        handleCancel,
    };
};