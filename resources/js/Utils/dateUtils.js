export const meses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
];

export const formatDateToSpanish = (dateString) => {
    if (!dateString) return "-";

    // Solución: parsear la fecha manualmente para evitar zona horaria
    const [year, month, day] = dateString.split("-");
    const date = new Date(Date.UTC(year, month - 1, day));

    if (isNaN(date.getTime())) return "-";

    const dia = date.getUTCDate();
    const mes = meses[date.getUTCMonth()];
    const anio = date.getUTCFullYear();

    return `${dia} ${mes} ${anio}`;
};
export const getFechaStyle = (fecha) => {
    if (!fecha) return { bg: "bg-gray-100", text: "text-gray-600" };
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaObj = new Date(fecha);
    fechaObj.setHours(0, 0, 0, 0);

    if (fechaObj < hoy) {
        return { bg: "bg-red-100", text: "text-red-700", label: "Atrasada" };
    } else if (fechaObj.getTime() === hoy.getTime()) {
        return { bg: "bg-yellow-100", text: "text-yellow-700", label: "Hoy" };
    } else {
        return { bg: "bg-green-100", text: "text-green-700", label: "Futura" };
    }
};
