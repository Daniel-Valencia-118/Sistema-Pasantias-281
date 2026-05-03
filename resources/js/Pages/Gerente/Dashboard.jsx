import React from "react";
import GerenteLayout from "@/Components/Layout/GerenteLayout";
import DashboardLayout from "../../Components/Layout/DashboardLayout";

export default function Dashboard({ auth }) {
    return (
        <DashboardLayout auth={auth}>
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h1 className="text-2xl font-bold text-primary-navy mb-4">
                    ¡Bienvenido {auth.user.nombre} {auth.user.ap_paterno}!
                </h1>
                <p className="text-gray-600">
                    Has iniciado sesión como{" "}
                    <strong className="text-primary-blue">Gerente</strong>.
                </p>
                <p className="text-gray-500 mt-4 text-sm">
                    Selecciona una opción del menú lateral para comenzar.
                </p>
            </div>
        </DashboardLayout>
    );
}
