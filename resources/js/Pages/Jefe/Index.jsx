import React from "react";
import { Head, router } from "@inertiajs/react";
import DashboardLayout from "@/Components/Layout/DashboardLayout"; 
import PasantiaGenericGrid from "@/Components/PasantiaGenericGrid";
import Breadcrumbs from "@/Components/Breadcrumbs";

export default function Index({ auth, tarjetas = [], origen, ui }) {
    
    // Redirección dinámica basada en el contexto de procedencia (?origen=...)
    const handleCardClick = (id) => {
        const rutasDestino = {
            'bitacoras': `/jefe/evaluaciones/${id}/bitacoras`,
            'pasantes': `/jefe/pasantes/${id}`,
            'actividades': `/jefe/actividades/${id}`,
            'historial': `/jefe/informes/historial/${id}`
        };

        // Si por alguna razón el origen no coincide, mandamos por defecto a bitácoras
        const urlDestino = rutasDestino[origen] || `/jefe/evaluaciones/${id}/bitacoras`;
        
        router.get(urlDestino);
    };

    return (
        <DashboardLayout auth={auth}>
            <Head title={ui.titulo} />

            {/* Breadcrumbs dinámicos adaptados al flujo actual */}
            {/* <Breadcrumbs items={[
                { label: 'Inicio', href: route('jefe.dashboard') },
                { label: ui.titulo },
            ]} /> */}

            <div className="mb-2">
                {/* PasantiaGenericGrid renderizará internamente el diseño de las tarjetas, 
                    los textos se inyectan dinámicamente desde el controlador */}
                <PasantiaGenericGrid
                    tarjetas={tarjetas}
                    onCardClick={handleCardClick}
                    titulo={ui.titulo}
                    descripcion={ui.descripcion}
                    emptyMessage="Usted no tiene registros o pasantías asignadas bajo este criterio de supervisión."
                />
            </div>
        </DashboardLayout>
    );
}