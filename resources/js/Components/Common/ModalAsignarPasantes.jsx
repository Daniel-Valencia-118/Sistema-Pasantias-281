import React, { useState, useEffect } from "react";
import {
    X,
    ArrowLeft,
    Search,
    Eye,
    ArrowUpDown,
    ChevronUp,
    ChevronDown,
    UserCheck,
    UserX,
} from "lucide-react";
import axios from "axios";
import ModalConfirmacion from "./ModalConfirmacion";
import ModalPerfilPasante from "./ModalPerfilPasante";
import BadgeEstado from "./BadgeEstado";

export default function ModalAsignarPasantes({
    isOpen,
    onClose,
    jefeId,
    jefeNombre,
    onUpdate,
}) {
    const [asignados, setAsignados] = useState([]);
    const [sinAsignar, setSinAsignar] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingAction, setLoadingAction] = useState(false);
    const [searchNomAsig, setSearchNomAsig] = useState("");
    const [searchPasantiaAsig, setSearchPasantiaAsig] = useState("");
    const [searchMencionAsig, setSearchMencionAsig] = useState("");
    const [searchNomSin, setSearchNomSin] = useState("");
    const [searchPasantiaSin, setSearchPasantiaSin] = useState("");
    const [searchMencionSin, setSearchMencionSin] = useState("");
    const [sortFieldAsig, setSortFieldAsig] = useState("ap_paterno");
    const [sortDirectionAsig, setSortDirectionAsig] = useState("asc");
    const [sortFieldSin, setSortFieldSin] = useState("ap_paterno");
    const [sortDirectionSin, setSortDirectionSin] = useState("asc");
    const [modalConfirm, setModalConfirm] = useState({
        isOpen: false,
        id: null,
        accion: "",
        pasante: null,
    });
    const [modalPerfil, setModalPerfil] = useState({
        isOpen: false,
        pasante: null,
    });

    useEffect(() => {
        if (isOpen && jefeId) {
            cargarPasantes();
        }
    }, [isOpen, jefeId]);

    const cargarPasantes = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                `/gerente/jefes/${jefeId}/pasantes`,
            );
            setAsignados(response.data.asignados || []);
            setSinAsignar(response.data.sin_asignar || []);
        } catch (error) {
            console.error("Error al cargar pasantes:", error);
            alert("Error al cargar la lista de pasantes");
        } finally {
            setLoading(false);
        }
    };

    const handleAsignarDesignar = async (idPasante, accion) => {
        setLoadingAction(true);
        try {
            const response = await axios.post(
                "/gerente/jefes/asignar-pasante",
                {
                    idJefe: jefeId,
                    idPasante: idPasante,
                    accion: accion,
                },
            );

            if (response.data.message) {
                // Solo recargar datos, NO cerrar modal
                await cargarPasantes();
                if (onUpdate) onUpdate();
                // Mostrar pequeño mensaje de éxito (opcional)
                // Podrías agregar un toast o notificación
            }
        } catch (error) {
            alert(
                error.response?.data?.message || "Error al procesar la acción",
            );
        } finally {
            setLoadingAction(false);
        }
    };

    const handleSort = (field, isAsignados) => {
        if (isAsignados) {
            if (sortFieldAsig === field) {
                setSortDirectionAsig(
                    sortDirectionAsig === "asc" ? "desc" : "asc",
                );
            } else {
                setSortFieldAsig(field);
                setSortDirectionAsig("asc");
            }
        } else {
            if (sortFieldSin === field) {
                setSortDirectionSin(
                    sortDirectionSin === "asc" ? "desc" : "asc",
                );
            } else {
                setSortFieldSin(field);
                setSortDirectionSin("asc");
            }
        }
    };

    const SortIcon = ({ field, isAsignados }) => {
        const isActive = isAsignados
            ? sortFieldAsig === field
            : sortFieldSin === field;
        const direction = isAsignados ? sortDirectionAsig : sortDirectionSin;

        if (!isActive)
            return <ArrowUpDown size={14} className="text-gray-400" />;
        return direction === "asc" ? (
            <ChevronUp size={14} />
        ) : (
            <ChevronDown size={14} />
        );
    };

    const filtrarYOrdenar = (
        lista,
        searchNom,
        searchPasantia,
        searchMencion,
        sortField,
        sortDirection,
    ) => {
        let filtered = [...lista];

        // Filtro por nombre/apellido
        if (searchNom) {
            const term = searchNom.toLowerCase();
            filtered = filtered.filter((p) =>
                `${p.ap_paterno} ${p.ap_materno} ${p.nombre}`
                    .toLowerCase()
                    .includes(term),
            );
        }

        // Filtro por pasantía
        if (searchPasantia) {
            const term = searchPasantia.toLowerCase();
            filtered = filtered.filter((p) =>
                p.pasantia_nombre?.toLowerCase().includes(term),
            );
        }

        // Filtro por mención
        if (searchMencion) {
            const term = searchMencion.toLowerCase();
            filtered = filtered.filter((p) =>
                p.mencion?.toLowerCase().includes(term),
            );
        }

        // Ordenamiento
        filtered.sort((a, b) => {
            let aVal = a[sortField];
            let bVal = b[sortField];
            if (typeof aVal === "string") {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }
            if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
            if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
            return 0;
        });

        return filtered;
    };

    const renderTabla = (
        lista,
        titulo,
        isAsignados,
        searchNom,
        setSearchNom,
        searchPasantia,
        setSearchPasantia,
        searchMencion,
        setSearchMencion,
    ) => {
        const filteredData = filtrarYOrdenar(
            lista,
            searchNom,
            searchPasantia,
            searchMencion,
            isAsignados ? sortFieldAsig : sortFieldSin,
            isAsignados ? sortDirectionAsig : sortDirectionSin,
        );
        const actionText = isAsignados ? "DESIGNAR" : "ASIGNAR";
        const actionColor = isAsignados
            ? "bg-red-500 hover:bg-red-600"
            : "bg-primary-blue hover:bg-primary-sky-blue";

        return (
            <div className="mb-8">
                <h3 className="text-lg font-bold text-primary-navy mb-4 pb-2 border-b">
                    {titulo} ({lista.length})
                </h3>

                {/* Buscadores */}
                <div className="grid md:grid-cols-3 gap-3 mb-4">
                    <div className="relative">
                        <Search
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                            type="text"
                            placeholder="Buscar por nombre/apellido..."
                            value={searchNom}
                            onChange={(e) => setSearchNom(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-primary-blue focus:ring-1 focus:ring-primary-blue/20"
                        />
                    </div>
                    <div className="relative">
                        <Search
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                            type="text"
                            placeholder="Buscar por pasantía..."
                            value={searchPasantia}
                            onChange={(e) => setSearchPasantia(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-primary-blue focus:ring-1 focus:ring-primary-blue/20"
                        />
                    </div>
                    <div className="relative">
                        <Search
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                            type="text"
                            placeholder="Buscar por mención..."
                            value={searchMencion}
                            onChange={(e) => setSearchMencion(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-primary-blue focus:ring-1 focus:ring-primary-blue/20"
                        />
                    </div>
                </div>

                {/* Tabla */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gradient-to-r from-primary-navy to-primary-slate">
                            <tr>
                                <th className="px-3 py-3 text-left text-xs font-bold text-white">
                                    Nro
                                </th>
                                <th
                                    className="px-3 py-3 text-left text-xs font-bold text-white cursor-pointer hover:bg-white/10"
                                    onClick={() =>
                                        handleSort("ap_paterno", isAsignados)
                                    }
                                >
                                    <div className="flex items-center gap-1">
                                        Apellido Paterno{" "}
                                        <SortIcon
                                            field="ap_paterno"
                                            isAsignados={isAsignados}
                                        />
                                    </div>
                                </th>
                                <th
                                    className="px-3 py-3 text-left text-xs font-bold text-white cursor-pointer hover:bg-white/10"
                                    onClick={() =>
                                        handleSort("ap_materno", isAsignados)
                                    }
                                >
                                    <div className="flex items-center gap-1">
                                        Apellido Materno{" "}
                                        <SortIcon
                                            field="ap_materno"
                                            isAsignados={isAsignados}
                                        />
                                    </div>
                                </th>
                                <th
                                    className="px-3 py-3 text-left text-xs font-bold text-white cursor-pointer hover:bg-white/10"
                                    onClick={() =>
                                        handleSort("nombre", isAsignados)
                                    }
                                >
                                    <div className="flex items-center gap-1">
                                        Nombres{" "}
                                        <SortIcon
                                            field="nombre"
                                            isAsignados={isAsignados}
                                        />
                                    </div>
                                </th>
                                <th className="px-3 py-3 text-center text-xs font-bold text-white">
                                    Perfil
                                </th>
                                <th
                                    className="px-3 py-3 text-left text-xs font-bold text-white cursor-pointer hover:bg-white/10"
                                    onClick={() =>
                                        handleSort(
                                            "pasantia_nombre",
                                            isAsignados,
                                        )
                                    }
                                >
                                    <div className="flex items-center gap-1">
                                        Pasantía{" "}
                                        <SortIcon
                                            field="pasantia_nombre"
                                            isAsignados={isAsignados}
                                        />
                                    </div>
                                </th>
                                <th
                                    className="px-3 py-3 text-left text-xs font-bold text-white cursor-pointer hover:bg-white/10"
                                    onClick={() =>
                                        handleSort("mencion", isAsignados)
                                    }
                                >
                                    <div className="flex items-center gap-1">
                                        Mención{" "}
                                        <SortIcon
                                            field="mencion"
                                            isAsignados={isAsignados}
                                        />
                                    </div>
                                </th>
                                <th className="px-3 py-3 text-left text-xs font-bold text-white">
                                    Fechas
                                </th>
                                <th className="px-3 py-3 text-center text-xs font-bold text-white">
                                    Estado
                                </th>
                                <th className="px-3 py-3 text-center text-xs font-bold text-white">
                                    Acción
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredData.map((pasante, idx) => (
                                <tr
                                    key={pasante.id}
                                    className="hover:bg-gray-50"
                                >
                                    <td className="px-3 py-3 text-gray-500">
                                        {idx + 1}
                                    </td>
                                    <td className="px-3 py-3 text-gray-900">
                                        {pasante.ap_paterno}
                                    </td>
                                    <td className="px-3 py-3 text-gray-900">
                                        {pasante.ap_materno}
                                    </td>
                                    <td className="px-3 py-3 text-gray-900">
                                        {pasante.nombre}
                                    </td>
                                    <td className="px-3 py-3 text-center">
                                        <button
                                            onClick={() =>
                                                setModalPerfil({
                                                    isOpen: true,
                                                    pasante: pasante,
                                                })
                                            }
                                            className="text-primary-blue hover:text-primary-sky-blue transition-colors cursor-pointer"
                                            title="Ver Perfil"
                                        >
                                            <Eye size={18} />
                                        </button>
                                    </td>
                                    <td className="px-3 py-3 text-gray-600">
                                        {pasante.pasantia_nombre}
                                    </td>
                                    <td className="px-3 py-3 text-gray-600">
                                        {pasante.mencion}
                                    </td>
                                    <td className="px-3 py-3 text-gray-500 text-xs">
                                        {pasante.fecha_ini && pasante.fecha_fin
                                            ? `${new Date(pasante.fecha_ini).toLocaleDateString()} - ${new Date(pasante.fecha_fin).toLocaleDateString()}`
                                            : "-"}
                                    </td>

                                    <td className="px-3 py-3 text-center">
                                        <span
                                            className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium
                                                    ${pasante.pasantia_estado === "ABIERTA" ? "bg-green-100 text-green-800" : ""}
                                                    ${pasante.pasantia_estado === "INICIADO" ? "bg-blue-100 text-blue-800" : ""}
                                                    ${pasante.pasantia_estado === "FINALIZADO" ? "bg-purple-100 text-purple-800" : ""}
                                                    ${pasante.pasantia_estado === "CANCELADO" ? "bg-gray-100 text-gray-800" : ""}
                                                `}
                                        >
                                            {pasante.pasantia_estado ===
                                            "ABIERTA"
                                                ? "Abierta"
                                                : ""}
                                            {pasante.pasantia_estado ===
                                            "INICIADO"
                                                ? "Iniciado"
                                                : ""}
                                            {pasante.pasantia_estado ===
                                            "FINALIZADO"
                                                ? "Finalizado"
                                                : ""}
                                            {pasante.pasantia_estado ===
                                            "CANCELADO"
                                                ? "Cancelado"
                                                : ""}
                                        </span>
                                    </td>

                                    <td className="px-3 py-3 text-center">
                                        {pasante.pasantia_estado !==
                                            "FINALIZADO" &&
                                        pasante.pasantia_estado !==
                                            "CANCELADO" ? (
                                            <button
                                                onClick={() =>
                                                    setModalConfirm({
                                                        isOpen: true,
                                                        id: pasante.id,
                                                        accion: isAsignados
                                                            ? "designar"
                                                            : "asignar",
                                                        pasante: pasante,
                                                    })
                                                }
                                                disabled={
                                                    loadingAction ||
                                                    pasante.pasantia_estado ===
                                                        "FINALIZADO" ||
                                                    pasante.pasantia_estado ===
                                                        "CANCELADO"
                                                }
                                                className={`px-3 py-1 rounded-lg text-white text-xs font-medium transition-all cursor-pointer shadow-sm hover:shadow-md 
                                                        ${
                                                            pasante.pasantia_estado ===
                                                                "FINALIZADO" ||
                                                            pasante.pasantia_estado ===
                                                                "CANCELADO"
                                                                ? "bg-gray-400 cursor-not-allowed"
                                                                : actionColor
                                                        }`}
                                            >
                                                {actionText}
                                            </button>
                                        ) : (
                                            <span className="text-gray-400 text-xs">
                                                No disponible
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredData.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        No hay pasantes{" "}
                        {isAsignados ? "asignados" : "sin asignar"}
                    </div>
                )}
            </div>
        );
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto">
                <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full mx-4 my-8">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary-navy to-primary-blue px-6 py-4 rounded-t-xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-white">
                                    Gestión de Pasantes
                                </h3>
                                <p className="text-primary-sky-blue text-sm">
                                    Asignar/Designar pasantes a:{" "}
                                    <strong>{jefeNombre}</strong>
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors cursor-pointer"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Contenido */}
                    <div className="p-6 max-h-[70vh] overflow-y-auto">
                        {loading ? (
                            <div className="text-center py-12 text-gray-500">
                                Cargando pasantes...
                            </div>
                        ) : (
                            <>
                                {renderTabla(
                                    asignados,
                                    "📋 PASANTES ASIGNADOS",
                                    true,
                                    searchNomAsig,
                                    setSearchNomAsig,
                                    searchPasantiaAsig,
                                    setSearchPasantiaAsig,
                                    searchMencionAsig,
                                    setSearchMencionAsig,
                                )}
                                {renderTabla(
                                    sinAsignar,
                                    "👥 PASANTES SIN ASIGNAR",
                                    false,
                                    searchNomSin,
                                    setSearchNomSin,
                                    searchPasantiaSin,
                                    setSearchPasantiaSin,
                                    searchMencionSin,
                                    setSearchMencionSin,
                                )}
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end p-4 border-t bg-gray-50 rounded-b-xl">
                        <button
                            onClick={onClose}
                            className="flex items-center gap-2 px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-all cursor-pointer"
                        >
                            <ArrowLeft size={18} />
                            Volver
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal de confirmación */}
            <ModalConfirmacion
                isOpen={modalConfirm.isOpen}
                onClose={() =>
                    setModalConfirm({
                        isOpen: false,
                        id: null,
                        accion: "",
                        pasante: null,
                    })
                }
                onConfirm={async () => {
                    await handleAsignarDesignar(
                        modalConfirm.id,
                        modalConfirm.accion,
                    );
                    setModalConfirm({
                        isOpen: false,
                        id: null,
                        accion: "",
                        pasante: null,
                    });
                }}
                titulo={`Confirmar ${modalConfirm.accion === "asignar" ? "asignación" : "desasignación"}`}
                mensaje={`¿Estás seguro de que deseas ${modalConfirm.accion === "asignar" ? "asignar" : "desasignar"} a ${modalConfirm.pasante?.nombre || "este pasante"}?`}
                type={modalConfirm.accion === "asignar" ? "info" : "danger"}
                confirmText={
                    modalConfirm.accion === "asignar" ? "Asignar" : "Designar"
                }
            />

            {/* Modal de perfil del pasante */}
            <ModalPerfilPasante
                isOpen={modalPerfil.isOpen}
                onClose={() => setModalPerfil({ isOpen: false, pasante: null })}
                pasante={modalPerfil.pasante}
            />
        </>
    );
}
