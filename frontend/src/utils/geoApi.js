const API_BASE_URL = "https://apis.datos.gob.ar/georef/api";

export const fetchProvincias = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/provincias?campos=id,nombre&max=24`);

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();

        return data.provincias.map(prov => ({
            id: prov.id,
            nombre: prov.nombre
        }));

    } catch (error) {
        console.error("Error al obtener las provincias", error);
        throw new Error("No se pudieron cargar las provincias. Verificá tu conexión a internet.")
    }
};

export const fetchLocalidades = async (nombreProvincia) => {
    if (!nombreProvincia || nombreProvincia.trim() === "") {
        throw new Error("El nombre de la provincia es requerido");
    }

    try {
        const provinciaEncoded = encodeURIComponent(nombreProvincia);
        const response = await fetch(`${API_BASE_URL}/localidades?provincia=${provinciaEncoded}&campos=id,nombre&max=1000`);

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();

        return data.localidades.map(loc => ({
            id: loc.id,
            nombre: loc.nombre
        })).sort((a, b) => a.nombre.localeCompare(b.nombre));

    } catch (error) {
        console.error(`Error al obtener las localidades de ${nombreProvincia}: `, error)
        throw new Error(`No se pudieron cargar las localidades de ${nombreProvincia}.`)
    }
}