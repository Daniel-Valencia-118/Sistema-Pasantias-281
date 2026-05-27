import React from 'react';

// Constante local para los meses
const MESES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export default function BadgeFecha({ fecha, neutral = false }) {
    // 1. Validación de nulos o vacíos
    if (!fecha) {
        return (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                -
            </span>
        );
    }

    // 2. Normalizar y extraer Año, Mes y Día sin importar el formato
    let anio, mes, dia;
    
    // Limpiar espacios y quitar la hora si viene incluida (ej: "2026-05-27 15:30:00")
    const soloFecha = fecha.toString().trim().split(" ")[0].replace(/\//g, "-");
    const partes = soloFecha.split("-");

    if (partes.length === 3) {
        if (partes[0].length === 4) {
            // Formato YYYY-MM-DD
            [anio, mes, dia] = partes;
        } else if (partes[2].length === 4) {
            // Formato DD-MM-YYYY
            [dia, mes, anio] = partes;
        }
    }

    // Convertir a números enteros
    const numAnio = parseInt(anio, 10);
    const numMes = parseInt(mes, 10);
    const numDia = parseInt(dia, 10);

    // Validar si la conversión falló o es una fecha inválida
    if (isNaN(numAnio) || isNaN(numMes) || isNaN(numDia)) {
        return (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                -
            </span>
        );
    }

    // 3. Crear objetos de fecha limpios a medianoche (Evita problemas de zona horaria)
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const fechaObjeto = new Date(numAnio, numMes - 1, numDia);
    fechaObjeto.setHours(0, 0, 0, 0);

    // 4. Determinar los estilos y la etiqueta de estado
    let estilos = { bg: "bg-green-100 text-green-700 border-green-200", label: "Futura" };
    if (neutral) {
        estilos = { bg: "bg-gray-100 text-gray-600 border-gray-200", label: "Neutral" };
    } else if (fechaObjeto.getTime() < hoy.getTime()) {
        estilos = { bg: "bg-red-100 text-red-700 border-red-200", label: "Atrasada" };
    } else if (fechaObjeto.getTime() === hoy.getTime()) {
        estilos = { bg: "bg-yellow-100 text-yellow-700 border-yellow-200", label: "Hoy" };
    }

    // 5. Renderizar el componente final
    const nombreMes = MESES[numMes - 1];
    
    return (
        <span className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${estilos.bg}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75" />
            {numDia} {nombreMes} {numAnio}
             {/* ({estilos.label}) */}
        </span>
    );
}
