import React, { useState, useEffect } from "react";
import { router, usePage } from "@inertiajs/react";
import DashboardLayout from "@/Components/Layout/DashboardLayout";
import BadgeEstado from "@/Components/Common/BadgeEstado";
import ModalConfirmacion from "@/Components/Common/ModalConfirmacion";
import ModalPerfil from "@/Components/Common/ModalPerfil";
import ModalAsignarPasantes from "@/Components/Common/ModalAsignarPasantes";
import {
    Eye,
    Users,
    Power,
    Search,
    ArrowUpDown,
    ChevronUp,
    ChevronDown,
} from "lucide-react";
import GerenteLayout from "../../../Components/Layout/GerenteLayout";

export default function Index({ auth, jefes }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterEstado, setFilterEstado] = useState("todos");
    const [sortField, setSortField] = useState("ap_paterno");
    const [sortDirection, setSortDirection] = useState("asc");
    const [jefesData, setJefesData] = useState(jefes);
    const [modalAsignar, setModalAsignar] = useState({
        isOpen: false,
        jefeId: null,
        jefeNombre: "",
    });
    const [modalConfirm, setModalConfirm] = useState({
        isOpen: false,
        id: null,
        accion: "",
    });
    const [modalPerfil, setModalPerfil] = useState({
        isOpen: false,
        usuario: null,
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setJefesData(jefes);
    }, [jefes]);

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    const handleToggleEstado = (id) => {
        setModalConfirm({
            isOpen: true,
            id: id,
            accion: "toggleEstado",
        });
    };

    const confirmToggleEstado = async () => {
        setLoading(true);
        try {
            const response = await axios.patch(
                `/gerente/jefes/${modalConfirm.id}/toggle-estado`,
            );
            if (response.data.message) {
                setJefesData((prev) =>
                    prev.map((j) =>
                        j.id === modalConfirm.id
                            ? { ...j, estado_cuenta: response.data.estado }
                            : j,
                    ),
                );
            }
        } catch (error) {
            alert(error.response?.data?.message || "Error al cambiar estado");
        } finally {
            setLoading(false);
            setModalConfirm({ isOpen: false, id: null, accion: "" });
        }
    };

    // Filtrar y ordenar datos
    const filteredData = jefesData
        .filter((j) => {
            const matchesSearch = `${j.ap_paterno} ${j.ap_materno} ${j.nombre}`
                .toLowerCase()
                .includes(searchTerm.toLowerCase());
            const matchesEstado =
                filterEstado === "todos" ||
                (filterEstado === "activo" && j.estado_cuenta === true) ||
                (filterEstado === "inactivo" && j.estado_cuenta === false);
            return matchesSearch && matchesEstado;
        })
        .sort((a, b) => {
            let aVal = a[sortField];
            let bVal = b[sortField];
            if (typeof aVal === "boolean") {
                aVal = aVal ? 1 : 0;
                bVal = bVal ? 1 : 0;
            }
            if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
            if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
            return 0;
        });

    const SortIcon = ({ field }) => {
        if (sortField !== field)
            return <ArrowUpDown size={14} className="text-gray-400" />;
        return sortDirection === "asc" ? (
            <ChevronUp size={14} />
        ) : (
            <ChevronDown size={14} />
        );
    };

    return (
        <GerenteLayout auth={auth}>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary-navy to-primary-slate px-6 py-5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
                            <Users size={22} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">
                                JEFES DE PASANTES
                            </h2>
                            <p className="text-white/70 text-sm mt-0.5 flex items-center gap-1.5">
                                <span className="inline-block w-1.5 h-1.5 bg-primary-sky-blue rounded-full"></span>
                                Gestión de jefes de tu empresa
                            </p>
                        </div>
                    </div>
                </div>

                {/* Filtros y búsqueda */}
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
                            className="px-4 py-2 border border-gray-200 rounded-lg focus:border-primary-blue"
                        >
                            <option value="todos">Todos</option>
                            <option value="activo">Activos</option>
                            <option value="inactivo">Inactivos</option>
                        </select>
                    </div>
                </div>

                {/* Tabla */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-primary-navy to-primary-slate sticky top-0">
                            <tr>
                                <th className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider rounded-tl-lg">
                                    Nro
                                </th>
                                <th
                                    className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider cursor-pointer hover:bg-white/10 transition-colors"
                                    onClick={() => handleSort("ap_paterno")}
                                >
                                    <div className="flex items-center gap-1">
                                        Apellido Paterno{" "}
                                        <SortIcon field="ap_paterno" />
                                    </div>
                                </th>
                                <th
                                    className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider cursor-pointer hover:bg-white/10 transition-colors"
                                    onClick={() => handleSort("ap_materno")}
                                >
                                    <div className="flex items-center gap-1">
                                        Apellido Materno{" "}
                                        <SortIcon field="ap_materno" />
                                    </div>
                                </th>
                                <th
                                    className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider cursor-pointer hover:bg-white/10 transition-colors"
                                    onClick={() => handleSort("nombre")}
                                >
                                    <div className="flex items-center gap-1">
                                        Nombres <SortIcon field="nombre" />
                                    </div>
                                </th>
                                <th className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                                    CI
                                </th>
                                <th className="px-4 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">
                                    Perfil
                                </th>
                                <th className="px-4 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">
                                    Estado
                                </th>
                                <th
                                    className="px-4 py-4 text-center text-xs font-bold text-white uppercase tracking-wider rounded-tr-lg"
                                    onClick={() =>
                                        handleSort("pasantes_asignados")
                                    }
                                >
                                    <div className="flex items-center justify-center gap-1 cursor-pointer hover:bg-white/10 py-1 rounded transition-colors">
                                        Pasantes ASIGNADOS{" "}
                                        <SortIcon field="pasantes_asignados" />
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredData.map((jefe, index) => (
                                <tr key={jefe.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm text-gray-500">
                                        {index + 1}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900">
                                        {jefe.ap_paterno}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900">
                                        {jefe.ap_materno}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900">
                                        {jefe.nombre}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                        {jefe.ci}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <button
                                            onClick={() =>
                                                setModalPerfil({
                                                    isOpen: true,
                                                    usuario: jefe,
                                                })
                                            }
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300 rounded-lg transition-all duration-200 font-medium text-sm cursor-pointer shadow-sm hover:shadow"
                                            title="Ver perfil del jefe"
                                        >
                                            <Eye
                                                size={14}
                                                className="text-blue-600"
                                            />
                                            Ver Perfil
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex items-center justify-center gap-3">
                                            <button
                                                onClick={() =>
                                                    handleToggleEstado(jefe.id)
                                                }
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all duration-200 text-sm font-medium ${
                                                    jefe.estado_cuenta
                                                        ? "bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300"
                                                        : "bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300"
                                                }`}
                                                title={
                                                    jefe.estado_cuenta
                                                        ? "Desactivar cuenta"
                                                        : "Activar cuenta"
                                                }
                                            >
                                                <Power
                                                    size={14}
                                                    className={
                                                        jefe.estado_cuenta
                                                            ? "text-red-600"
                                                            : "text-green-600"
                                                    }
                                                />
                                                {jefe.estado_cuenta
                                                    ? "Desactivar"
                                                    : "Activar"}
                                            </button>
                                            <BadgeEstado
                                                estado={
                                                    jefe.estado_cuenta
                                                        ? "activo"
                                                        : "inactivo"
                                                }
                                            />
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex flex-col items-center gap-1">
                                            <button
                                                onClick={() =>
                                                    setModalAsignar({
                                                        isOpen: true,
                                                        jefeId: jefe.id,
                                                        jefeNombre: `${jefe.ap_paterno} ${jefe.ap_materno}, ${jefe.nombre}`,
                                                    })
                                                }
                                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-blue/10 border border-primary-blue/20 rounded-lg hover:bg-primary-blue/20 transition-all duration-200 cursor-pointer group"
                                                title="Asignar o desasignar pasantes"
                                            >
                                                <Users
                                                    size={16}
                                                    className="text-primary-blue"
                                                />
                                                <span className="text-sm font-semibold text-primary-blue">
                                                    {jefe.pasantes_asignados}
                                                </span>
                                                <span className="text-xs text-gray-500 group-hover:text-primary-blue transition-colors">
                                                    pasantes
                                                </span>
                                            </button>
                                            <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">
                                                Gestionar Pasantes
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredData.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        No tiene registrado ningún jefe en el sistema
                    </div>
                )}
            </div>

            {/* Modales */}
            <ModalConfirmacion
                isOpen={
                    modalConfirm.isOpen &&
                    modalConfirm.accion === "toggleEstado"
                }
                onClose={() =>
                    setModalConfirm({ isOpen: false, id: null, accion: "" })
                }
                onConfirm={confirmToggleEstado}
                titulo="Confirmar cambio de estado"
                mensaje="¿Estás seguro de que deseas cambiar el estado de este jefe?"
                type="warning"
            />

            <ModalPerfil
                isOpen={modalPerfil.isOpen}
                onClose={() => setModalPerfil({ isOpen: false, usuario: null })}
                usuario={modalPerfil.usuario}
                tipo="jefe"
                onUpdate={() => {
                    // Recargar datos
                    window.location.reload();
                }}
            />
            <ModalAsignarPasantes
                isOpen={modalAsignar.isOpen}
                onClose={() =>
                    setModalAsignar({
                        isOpen: false,
                        jefeId: null,
                        jefeNombre: "",
                    })
                }
                jefeId={modalAsignar.jefeId}
                jefeNombre={modalAsignar.jefeNombre}
                onUpdate={() => {
                    // En lugar de recargar la página, no hagas nada aquí
                    // o actualiza solo el estado local si necesitas reflejar cambios en la tabla
                }}

                // onUpdate={() => {
                //     // Recargar la lista de jefes
                //     window.location.reload();
                // }}
            />
        </GerenteLayout>
    );
}
