import React, { useState, useEffect } from "react";
import { router, usePage } from "@inertiajs/react";
import GerenteLayout from "@/Components/Layout/GerenteLayout";
import ModalConfirmacion from "@/Components/Common/ModalConfirmacion";
import ModalPerfil from "@/Components/Common/ModalPerfil";
import {
    Eye,
    Check,
    X,
    Search,
    ArrowLeft,
    UserCheck,
    UserX,
    Users,
    XCircle,
} from "lucide-react";

export default function Solicitudes({ auth, solicitudes }) {
    const [solicitudesData, setSolicitudesData] = useState(solicitudes);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterEstado, setFilterEstado] = useState("todos");
    const [modalConfirm, setModalConfirm] = useState({
        isOpen: false,
        id: null,
        accion: "",
        usuario: null,
    });
    const [modalPerfil, setModalPerfil] = useState({
        isOpen: false,
        usuario: null,
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setSolicitudesData(solicitudes);
    }, [solicitudes]);

    const handleAprobar = (id, usuario) => {
        setModalConfirm({
            isOpen: true,
            id: id,
            accion: "aprobar",
            usuario: usuario,
        });
    };

    const handleRechazar = (id, usuario) => {
        setModalConfirm({
            isOpen: true,
            id: id,
            accion: "rechazar",
            usuario: usuario,
        });
    };

    const confirmAction = async () => {
        setLoading(true);
        try {
            const url =
                modalConfirm.accion === "aprobar"
                    ? `/gerente/jefes/solicitudes/${modalConfirm.id}/aprobar`
                    : `/gerente/jefes/solicitudes/${modalConfirm.id}/rechazar`;

            const response = await axios.patch(url);

            if (response.data.message) {
                // Actualizar lista sin recargar
                setSolicitudesData((prev) =>
                    prev.filter((s) => s.id !== modalConfirm.id),
                );
            }
        } catch (error) {
            alert(
                error.response?.data?.message ||
                    "Error al procesar la solicitud",
            );
        } finally {
            setLoading(false);
            setModalConfirm({
                isOpen: false,
                id: null,
                accion: "",
                usuario: null,
            });
        }
    };

    // Filtrar datos
    const filteredData = solicitudesData.filter((s) => {
        const matchesSearch = `${s.ap_paterno} ${s.ap_materno} ${s.nombre}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        const matchesFilter =
            filterEstado === "todos" || s.estado_aprobacion === filterEstado;
        return matchesSearch && matchesFilter;
    });

    const getEstadoBadge = (estado) => {
        if (estado === "pendiente") {
            return (
                <div className="flex flex-col items-center gap-0.5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-yellow-50 border border-yellow-200 text-yellow-700 shadow-sm">
                        <span className="inline-block w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"></span>
                        Pendiente
                    </span>
                    <span className="text-[9px] text-gray-400 uppercase tracking-wide">
                        Esperando revisión
                    </span>
                </div>
            );
        }
        return (
            <div className="flex flex-col items-center gap-0.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-red-50 border border-red-200 text-red-700 shadow-sm">
                    <XCircle size={12} className="text-red-500" />
                    Rechazado
                </span>
                <span className="text-[9px] text-gray-400 uppercase tracking-wide">
                    Solicitud denegada
                </span>
            </div>
        );
    };

    return (
        <GerenteLayout auth={auth}>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary-navy to-primary-slate px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
                                <Users size={22} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white tracking-tight">
                                    SOLICITUDES DE REGISTRO
                                </h2>
                                <p className="text-white/70 text-sm mt-0.5 flex items-center gap-1.5">
                                    <span className="inline-block w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse"></span>
                                    Aprobar o rechazar solicitudes de nuevos
                                    jefes
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => window.history.back()}
                            className="flex items-center gap-2 text-white hover:bg-white/20 px-3 py-1 rounded-lg transition-colors cursor-pointer"
                        >
                            <ArrowLeft size={18} />
                            Volver
                        </button>
                    </div>
                </div>

                {/* Filtros */}
                <div className="p-4 border-b flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex gap-3">
                        <div className="relative">
                            <Search
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                            <input
                                type="text"
                                placeholder="Buscar..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 w-64 border border-gray-200 rounded-lg focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 transition-all cursor-pointer"
                            />
                        </div>
                        <select
                            value={filterEstado}
                            onChange={(e) => setFilterEstado(e.target.value)}
                            className="px-4 py-2 border border-gray-200 rounded-lg focus:border-primary-blue transition-all cursor-pointer"
                        >
                            <option value="todos">Todos</option>
                            <option value="pendiente">Pendientes</option>
                            <option value="rechazado">Rechazados</option>
                        </select>
                    </div>
                </div>

                {/* Tabla */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-primary-navy to-primary-slate">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-bold text-white">
                                    Nro
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-white">
                                    APELLIDO PATERNO
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-white">
                                    APELLIDO MATERNO
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-white">
                                    NOMBRES
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-white">
                                    CI
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-white">
                                    PERFIL
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-white">
                                    ESTADO APROB.
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-white">
                                    Aceptar/Rechazar
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredData.map((solicitud, index) => (
                                <tr
                                    key={solicitud.id}
                                    className="hover:bg-gray-50"
                                >
                                    <td className="px-4 py-3 text-sm text-gray-500">
                                        {index + 1}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900">
                                        {solicitud.ap_paterno}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900">
                                        {solicitud.ap_materno}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900">
                                        {solicitud.nombre}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                        {solicitud.ci}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <button
                                            onClick={() =>
                                                setModalPerfil({
                                                    isOpen: true,
                                                    usuario: solicitud,
                                                })
                                            }
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300 rounded-lg transition-all duration-200 font-medium text-sm cursor-pointer shadow-sm hover:shadow"
                                            title="Ver perfil completo con datos y hora de registro"
                                        >
                                            <Eye
                                                size={14}
                                                className="text-blue-600"
                                            />
                                            Ver Perfil
                                        </button>
                                        <div className="text-[9px] text-gray-400 mt-1">
                                            Datos | Hora registro
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {getEstadoBadge(
                                            solicitud.estado_aprobacion,
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {solicitud.estado_aprobacion ===
                                            "pendiente" && (
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() =>
                                                        handleAprobar(
                                                            solicitud.id,
                                                            solicitud,
                                                        )
                                                    }
                                                    className="p-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all cursor-pointer"
                                                    title="Aprobar"
                                                >
                                                    <Check size={16} />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleRechazar(
                                                            solicitud.id,
                                                            solicitud,
                                                        )
                                                    }
                                                    className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all cursor-pointer"
                                                    title="Rechazar"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        )}
                                        {solicitud.estado_aprobacion ===
                                            "rechazado" && (
                                            <span className="text-gray-400 text-xs">
                                                Rechazado
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredData.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        No hay solicitudes solicitudes de registros de jefes
                    </div>
                )}
            </div>

            {/* Modal de confirmación */}
            <ModalConfirmacion
                isOpen={modalConfirm.isOpen}
                onClose={() =>
                    setModalConfirm({
                        isOpen: false,
                        id: null,
                        accion: "",
                        usuario: null,
                    })
                }
                onConfirm={confirmAction}
                titulo={`Confirmar ${modalConfirm.accion === "aprobar" ? "aprobación" : "rechazo"}`}
                mensaje={`¿Estás seguro de que deseas ${modalConfirm.accion === "aprobar" ? "aprobar" : "rechazar"} la solicitud de ${modalConfirm.usuario?.nombre || "este jefe"}?`}
                type={modalConfirm.accion === "aprobar" ? "info" : "danger"}
                confirmText={
                    modalConfirm.accion === "aprobar" ? "Aprobar" : "Rechazar"
                }
            />

            {/* Modal de perfil (solo lectura, sin edición) */}
            <ModalPerfil
                isOpen={modalPerfil.isOpen}
                onClose={() => setModalPerfil({ isOpen: false, usuario: null })}
                usuario={modalPerfil.usuario}
                tipo="jefe"
                readonly={true}
            />
        </GerenteLayout>
    );
}
