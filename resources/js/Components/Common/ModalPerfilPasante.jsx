import React from "react";
import {
    X,
    User,
    Phone,
    Mail,
    Calendar,
    BookOpen,
    GraduationCap,
} from "lucide-react";

export default function ModalPerfilPasante({ isOpen, onClose, pasante }) {
    if (!isOpen || !pasante) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4">
                <div className="bg-gradient-to-r from-primary-navy to-primary-blue px-6 py-4 rounded-t-xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-lg">
                                <User size={24} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">
                                    Perfil del Pasante
                                </h3>
                                <p className="text-primary-sky-blue text-sm">
                                    {pasante.ap_paterno} {pasante.ap_materno},{" "}
                                    {pasante.nombre}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:bg-white/20 p-2 rounded-lg"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500">
                                    Carnet de Identidad
                                </label>
                                <p className="text-gray-900 font-medium">
                                    {pasante.ci || "-"}
                                </p>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500">
                                    Celular
                                </label>
                                <p className="text-gray-900 font-medium">
                                    {pasante.numero_cel || "-"}
                                </p>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500">
                                    Fecha de Nacimiento
                                </label>
                                <p className="text-gray-900 font-medium">
                                    {pasante.fecha_nac
                                        ? new Date(
                                              pasante.fecha_nac,
                                          ).toLocaleDateString()
                                        : "-"}
                                </p>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500">
                                    Correo Electrónico
                                </label>
                                <p className="text-gray-900 font-medium">
                                    {pasante.correo || "-"}
                                </p>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500">
                                    Matrícula
                                </label>
                                <p className="text-gray-900 font-medium">
                                    {pasante.matricula || "-"}
                                </p>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500">
                                    Semestre
                                </label>
                                <p className="text-gray-900 font-medium">
                                    {pasante.semestre || "-"}
                                </p>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-gray-500">
                                    Mención
                                </label>
                                <p className="text-gray-900 font-medium">
                                    {pasante.mencion || "-"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end p-4 border-t bg-gray-50 rounded-b-xl">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-sky-blue transition-all cursor-pointer"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}
