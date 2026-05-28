import React, { useState } from "react";
import { Link, usePage } from "@inertiajs/react";

export default function ApplicationLogo({ className = "", showText = false, showInitials = false, logoUrl = null, nombreSistema = "" }) {
    const [imgError, setImgError] = useState(false);

    // Accedemos a las propiedades globales compartidas por el Middleware de Laravel
    const sharedProps = usePage().props;

    console.log(sharedProps);

    // Prioridad: 1. Si viene por Props manuales / 2. Si viene de los datos globales de Inertia / 3. Fallback estático
    const finalLogoUrl = logoUrl || sharedProps.logo_global;
    const finalNombreSistema = nombreSistema || sharedProps.nombre_sistema_global || "SISTEMA DE PASANTÍAS";

    
    
    // Generar iniciales automáticas por si falla la imagen
    const iniciales = finalNombreSistema
        ? finalNombreSistema
            .split(" ")
            .filter(palabra => palabra.toLowerCase() !== "de" && palabra.toLowerCase() !== "del" && palabra.length > 1)
            .map(n => n[0])
            .join("")
            .substring(0, 3)
            .toUpperCase()
        : "SGP";


    
    console.log(finalLogoUrl, finalNombreSistema, iniciales);

    return (
        <Link
            href={route("welcome")}
            className={`flex items-center gap-3 ${className}`}
        >
            {finalLogoUrl && !imgError ? (
                <img
                    src={finalLogoUrl}
                    alt="Logo Sistema"
                    className="h-14 w-auto object-contain"
                    onError={() => setImgError(true)}
                />
            ) : (
                <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-sky-400 rounded-lg flex items-center justify-center shadow-md shrink-0">
                    <span className="text-white font-bold text-sm tracking-wider">{iniciales}</span>
                </div>
            )}

            {showText && (
                <span className="font-display text-base md:text-lg font-bold text-primary-navy tracking-tight uppercase max-w-xs leading-tight">
                    {finalNombreSistema}
                </span>
            )}

            {/* Si quieres mostrar solo las iniciales de nombreSistema sin el texto completo, puedes usar showInitials */}
            {showInitials && !showText && (
                <span className="font-display text-white md:text-lg font-bold text-primary-navy tracking-tight uppercase max-w-xs leading-tight">
                    {iniciales}
                </span>
            )}
        </Link>
    );
}