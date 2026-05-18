// resources/js/Components/PasantiaGenericGrid.jsx
import React, { useState, useEffect } from "react";
import PasantiaCard from "@/Components/PasantiaCard";
import SkeletonCard from "@/Components/Common/SkeletonCard";

export default function PasantiaGenericGrid({
    tarjetas = [],
    onCardClick,
    titulo = "Pasantías",
    descripcion = "Listado de pasantías registradas",
    emptyMessage = "No se encontraron pasantías disponibles.",
    emptyLink = null,
    emptyLinkText = ""
}) {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulación de carga visual homogénea
        const timer = setTimeout(() => setLoading(false), 300);
        return () => clearTimeout(timer);
    }, [tarjetas]);

    return (
        <>
            {/* Cabecera interna */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-primary-navy">
                    {titulo}
                </h1>
                <p className="text-gray-500">
                    {descripcion}
                </p>
            </div>

            {/* Lógica de Renderizado condicional */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                        <SkeletonCard key={i} />
                    ))}
                </div>
            ) : tarjetas.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-gray-500">{emptyMessage}</p>
                    {emptyLink && (
                        <a
                            href={emptyLink}
                            className="mt-2 inline-block text-primary-blue hover:underline font-medium"
                        >
                            {emptyLinkText}
                        </a>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tarjetas.map((tarjeta) => (
                        <PasantiaCard
                            key={tarjeta.id}
                            tarjeta={tarjeta}
                            onClick={onCardClick}
                        />
                    ))}
                </div>
            )}
        </>
    );
}