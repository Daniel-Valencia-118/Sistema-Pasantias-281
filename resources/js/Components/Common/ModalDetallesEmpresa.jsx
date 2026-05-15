// resources/js/Components/Common/ModalDetallesEmpresa.jsx
import React from "react";
import { X, Building2, Hash, User, MapPin, Phone, Mail } from "lucide-react";

export default function ModalDetallesEmpresa({ isOpen, onClose, empresa }) {
    if (!isOpen || !empresa) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary-navy to-primary-blue px-5 py-3 rounded-t-xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Building2 size={20} className="text-white" />
                            <h3 className="text-lg font-bold text-white">
                                Detalles de la Empresa
                            </h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:bg-white/20 p-1 rounded-lg"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Contenido */}
                <div className="p-5 space-y-3">
                    <div className="border-b pb-2">
                        <label className="block text-xs font-medium text-gray-500">
                            Nombre de la Empresa
                        </label>
                        <p className="text-gray-900 font-medium">
                            {empresa.nombre}
                        </p>
                    </div>

                    <div className="border-b pb-2">
                        <label className="block text-xs font-medium text-gray-500 flex items-center gap-1">
                            <Hash size={12} /> NIT
                        </label>
                        <p className="text-gray-900">{empresa.nit || "-"}</p>
                    </div>

                    <div className="border-b pb-2">
                        <label className="block text-xs font-medium text-gray-500 flex items-center gap-1">
                            <User size={12} /> Gerente
                        </label>
                        <p className="text-gray-900">
                            {empresa.gerente_nombre || "-"}
                        </p>
                    </div>

                    <div className="border-b pb-2">
                        <label className="block text-xs font-medium text-gray-500 flex items-center gap-1">
                            <MapPin size={12} /> Dirección
                        </label>
                        <p className="text-gray-900">
                            {empresa.direccion || "-"}
                        </p>
                    </div>

                    <div className="border-b pb-2">
                        <label className="block text-xs font-medium text-gray-500 flex items-center gap-1">
                            <Phone size={12} /> Teléfono Empresa
                        </label>
                        <p className="text-gray-900">
                            {empresa.telefono || "-"}
                        </p>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-500 flex items-center gap-1">
                            <Mail size={12} /> Email Empresa
                        </label>
                        <p className="text-gray-900">{empresa.email || "-"}</p>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end p-4 border-t bg-gray-50 rounded-b-xl">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-sky-blue"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}
