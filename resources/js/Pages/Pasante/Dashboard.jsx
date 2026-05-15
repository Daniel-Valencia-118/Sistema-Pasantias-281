// resources/js/Pages/Pasante/Dashboard.jsx
import React from "react";
import PasanteLayout from "@/Components/Layout/PasanteLayout";

export default function Dashboard({ auth }) {
    return (
        <PasanteLayout auth={auth}>
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h1 className="text-2xl font-bold text-primary-navy mb-4">
                    ¡Bienvenido {auth.user.nombre} {auth.user.ap_paterno}!
                </h1>
                <p className="text-gray-600">
                    Has iniciado sesión como{" "}
                    <strong className="text-primary-blue">Pasante</strong>.
                </p>
                <p className="text-gray-500 mt-4 text-sm">
                    Selecciona una opción del menú lateral para comenzar.
                </p>
            </div>
        </PasanteLayout>
    );
}
