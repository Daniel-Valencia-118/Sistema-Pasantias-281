import React from "react";
import { Head, router } from "@inertiajs/react";
import DashboardLayout from "@/Components/Layout/DashboardLayout"; // Tu Layout de otros roles
import PasantiaGenericGrid from "@/Components/PasantiaGenericGrid";

export default function Index({ auth, tarjetas }) {
    
    // Redirección personalizada para el flujo del Jefe
    const handleCardClick = (id) => {
        router.get(`/jefe/pasantes/${id}`);
    };

    console.log(tarjetas);
    
    return (
        <DashboardLayout auth={auth}>
            <Head title="Panel de Pasantías" />

            <PasantiaGenericGrid
                tarjetas={tarjetas}
                onCardClick={handleCardClick}
                titulo="Control de Pasantías"
                descripcion="Supervisión de áreas y pasantes asignados a su cargo"
                emptyMessage="Usted no tiene pasantías activas o asignadas bajo su supervisión en este periodo."
                // Si el jefe no se inscribe a nada, omitimos los parámetros de links vacíos
            />
        </DashboardLayout>
    );
}