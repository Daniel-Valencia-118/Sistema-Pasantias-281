import React, { useState, useMemo } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import { Play, Flag } from "lucide-react";
import ModalConfirmacion from "@/Components/Common/ModalConfirmacion";
import GerenteLayout from "@/Components/Layout/GerenteLayout";
import ModalHorario from "@/Components/Common/ModalHorario";
import ModalActividadesPasantia from "@/Components/Common/ModalActividadesPasantia";
import ModalEditarPasantia from "@/Components/Common/ModalEditarPasantia";
import ModalInscritos from "@/Components/Common/ModalInscritos";
import axios from "axios";
import {
    Eye,
    Calendar,
    Users,
    Award,
    AlertTriangle,
    CheckCircle,
    Minus,
    Clock,
    Plus,
    XCircle,
    Search,
    ArrowUpDown,
    ChevronUp,
    ChevronDown,
    Edit,
    Briefcase,
} from "lucide-react";

export default function Index({ auth, pasantias }) {
    const [pasantiasData, setPasantiasData] = useState(pasantias);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortField, setSortField] = useState("fecha_ini");
    const [modalEditar, setModalEditar] = useState({
        isOpen: false,
        pasantia: null,
    });
    const [sortDirection, setSortDirection] = useState("asc");
    const [modalDetalles, setModalDetalles] = useState({
        isOpen: false,
        pasantia: null,
    });
    const [modalActividades, setModalActividades] = useState({
        isOpen: false,
        pasantiaId: null,
        pasantiaNombre: null,
    });
    const [modalIniciar, setModalIniciar] = useState({
        isOpen: false,
        pasantiaId: null,
        infoInicio: null,
    });
    const [modalHorario, setModalHorario] = useState({
        isOpen: false,
        turno: null,
        cargaHoraria: null,
        fechaIni: null,
        fechaFin: null,
    });
    const [loadingIniciar, setLoadingIniciar] = useState(false);
    const formatDate = (date) => {
        if (!date) return "-";
        return date.split("-").reverse().join("/");
    };
    const handlePasantiaEditada = (pasantiaActualizada) => {
        setPasantiasData((prev) =>
            prev.map((p) =>
                p.id === pasantiaActualizada.id
                    ? { ...p, ...pasantiaActualizada }
                    : p,
            ),
        );
    };
    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    const SortIcon = ({ field }) => {
        if (sortField !== field)
            return <ArrowUpDown size={14} className="text-gray-400" />;
        return sortDirection === "asc" ? (
            <ChevronUp size={14} />
        ) : (
            <ChevronDown size={14} />
        );
    };
    const [modalInscritos, setModalInscritos] = useState({
        isOpen: false,
        pasantiaId: null,
        pasantiaNombre: null,
    });
    // Función para obtener info de inicio
    const handleAbrirConfirmacionInicio = async (pasantiaId) => {
        try {
            const response = await axios.get(
                `/gerente/pasantias/${pasantiaId}/info-inicio`,
            );
            setModalIniciar({
                isOpen: true,
                pasantiaId: pasantiaId,
                infoInicio: response.data,
            });
        } catch (error) {
            alert("Error al verificar fechas");
        }
    };
    const filteredAndSortedData = useMemo(() => {
        let filtered = [...pasantiasData];

        // Búsqueda por nombre
        if (searchTerm) {
            filtered = filtered.filter((p) =>
                p.nombre.toLowerCase().includes(searchTerm.toLowerCase()),
            );
        }

        // Ordenamiento
        filtered.sort((a, b) => {
            let aVal = a[sortField];
            let bVal = b[sortField];

            if (sortField === "fecha_ini") {
                aVal = new Date(aVal);
                bVal = new Date(bVal);
            }

            if (typeof aVal === "string") {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }

            if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
            if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;

            // Segundo orden por nombre
            if (a.nombre.toLowerCase() < b.nombre.toLowerCase()) return -1;
            if (a.nombre.toLowerCase() > b.nombre.toLowerCase()) return 1;
            return 0;
        });

        return filtered;
    }, [pasantiasData, searchTerm, sortField, sortDirection]);

    const handleCuposChange = async (id, nuevoCupos, inscritos) => {
        if (nuevoCupos < inscritos) {
            alert(
                `No puedes reducir los cupos por debajo de los inscritos (${inscritos})`,
            );
            return;
        }

        if (
            confirm(
                `¿Estás seguro de ${nuevoCupos > 0 ? "aumentar" : "disminuir"} los cupos?`,
            )
        ) {
            try {
                const response = await axios.patch(
                    `/gerente/pasantias/${id}/cupos`,
                    { cupos: nuevoCupos },
                );
                if (response.data.message) {
                    setPasantiasData((prev) =>
                        prev.map((p) =>
                            p.id === id
                                ? {
                                      ...p,
                                      cupos: response.data.cupos,
                                      cupos_disponibles:
                                          response.data.cupos_disponibles,
                                  }
                                : p,
                        ),
                    );
                }
            } catch (error) {
                alert(
                    error.response?.data?.message ||
                        "Error al actualizar cupos",
                );
            }
        }
    };

    const handleCancelarPasantia = async (id) => {
        if (
            confirm(
                "¿Estás seguro de cancelar esta pasantía? Esta acción no se puede deshacer.",
            )
        ) {
            try {
                await axios.patch(`/gerente/pasantias/${id}/cancelar`);
                setPasantiasData((prev) => prev.filter((p) => p.id !== id));
            } catch (error) {
                alert(error.response?.data?.message || "Error al cancelar");
            }
        }
    };
    // Función para iniciar
    const handleIniciarPasantia = async () => {
        setLoadingIniciar(true);
        try {
            const response = await axios.patch(
                `/gerente/pasantias/${modalIniciar.pasantiaId}/iniciar`,
            );
            if (response.data.message) {
                alert(response.data.message); // ← Mostrar mensaje de éxito
                window.location.reload();
            }
        } catch (error) {
            alert(
                error.response?.data?.message || "Error al iniciar la pasantía",
            );
            setModalIniciar({
                isOpen: false,
                pasantiaId: null,
                infoInicio: null,
            });
        } finally {
            setLoadingIniciar(false);
        }
    };

    const getEstadoBadge = (pasantia) => {
        const { cupos_disponibles, inscritos, todos_con_jefe, cupos } =
            pasantia;

        // PEOR ESTADO: No hay inscritos
        if (inscritos === 0) {
            return {
                text: "Sin Inscritos",
                bg: "bg-red-100",
                textColor: "text-red-800",
                icon: <Award size={12} />,
                showCancel: true,
            };
        }

        // MEJOR ESTADO: Cupos disponibles = 0 Y todos tienen jefe
        if (cupos_disponibles === 0 && todos_con_jefe) {
            return {
                text: "Todo Listo",
                bg: "bg-green-100",
                textColor: "text-green-800",
                icon: <CheckCircle size={12} />,
                showCancel: false,
            };
        }

        // NORMAL: Cupos disponibles = 0 pero no todos tienen jefe
        if (cupos_disponibles === 0 && !todos_con_jefe) {
            return {
                text: "Falta Asignar Jefe",
                bg: "bg-yellow-100",
                textColor: "text-yellow-800",
                icon: <AlertTriangle size={12} />,
                showCancel: false,
            };
        }
        if (cupos_disponibles > 0 && !todos_con_jefe) {
            return {
                text: "Falta Asignar Jefe",
                bg: "bg-yellow-100",
                textColor: "text-yellow-800",
                icon: <AlertTriangle size={12} />,
                showCancel: false,
            };
        }
        // NORMAL: Cupos disponibles > 0 pero todos tienen jefe
        if (cupos_disponibles > 0 && todos_con_jefe) {
            return {
                text: "Falta Completar Cupos",
                bg: "bg-blue-100",
                textColor: "text-blue-800",
                icon: <AlertTriangle size={12} />,
                showCancel: false,
            };
        }

        // Estado por defecto (no debería llegar aquí)
        return {
            text: "Pendiente",
            bg: "bg-gray-100",
            textColor: "text-gray-800",
            icon: null,
            showCancel: false,
        };
    };

    return (
        <GerenteLayout auth={auth}>
            <Head title="Pasantías Publicadas" />
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-primary-navy to-primary-slate px-6 py-5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
                            <Briefcase size={22} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">
                                PASANTÍAS PUBLICADAS
                            </h2>
                            <p className="text-white/70 text-sm mt-0.5 flex items-center gap-1.5">
                                <span className="inline-block w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                                Pasantías en publicadas, gestiona a los nuevos
                                inscritos y asígnales un jefe de pasante
                            </p>
                        </div>
                    </div>
                </div>
                {/* Barra de búsqueda */}
                <div className="p-4 border-b">
                    <div className="relative w-80">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                            type="text"
                            placeholder="Buscar por nombre de pasantía..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-primary-navy to-primary-slate">
                            <tr>
                                <th className="px-1 py-3 text-center text-xs font-bold text-white w-8">
                                    #
                                </th>
                                <th
                                    className="px-4 py-3 text-left text-xs font-bold text-white cursor-pointer hover:bg-white/10"
                                    onClick={() => handleSort("nombre")}
                                >
                                    <div className="flex items-center gap-1">
                                        NOMBRE PASANTÍA
                                        <SortIcon field="nombre" />
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-white">
                                    MENCIÓN
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-white">
                                    Hrs./Fechas
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-white">
                                    ACTIVIDADES
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-white">
                                    CUPOS DISPONIBLES
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-white">
                                    INSCRITOS
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-white">
                                    ESTADO
                                </th>
                                <th
                                    className="px-4 py-3 text-left text-xs font-bold text-white cursor-pointer hover:bg-white/10"
                                    onClick={() => handleSort("fecha_ini")}
                                >
                                    <div className="flex items-center gap-1">
                                        FECHA INI.{" "}
                                        <SortIcon field="fecha_ini" />
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-white">
                                    INICIAR
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredAndSortedData.map((pasantia, index) => (
                                <tr
                                    key={pasantia.id}
                                    className="hover:bg-gray-50"
                                >
                                    <td className="px-1 py-3 text-center text-xs text-gray-500">
                                        {index + 1}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold text-gray-800">
                                                {pasantia.nombre}
                                            </span>
                                            <button
                                                onClick={() =>
                                                    setModalEditar({
                                                        isOpen: true,
                                                        pasantia: pasantia,
                                                    })
                                                }
                                                className="text-primary-blue hover:text-primary-sky-blue transition-all cursor-pointer p-1 hover:bg-primary-blue/10 rounded-lg"
                                                title="Editar pasantía"
                                            >
                                                <Edit size={15} />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="inline-flex px-2.5 py-1 text-xs font-medium text-primary-blue bg-primary-blue/10 rounded-lg border border-primary-blue/20">
                                            {pasantia.mencion}
                                        </span>
                                    </td>

                                    <td className="px-3 py-3 text-center">
                                        <button
                                            onClick={() =>
                                                setModalHorario({
                                                    isOpen: true,
                                                    turno: pasantia.turno,
                                                    cargaHoraria:
                                                        pasantia.carga_horaria,
                                                    fechaIni:
                                                        pasantia.fecha_ini,
                                                    fechaFin:
                                                        pasantia.fecha_fin,
                                                })
                                            }
                                            className="flex flex-col items-center gap-0.5 mx-auto text-primary-blue hover:text-primary-sky-blue transition-colors group"
                                            title="Ver horario y fechas"
                                        >
                                            <Clock
                                                size={22}
                                                className="text-primary-blue group-hover:text-primary-sky-blue"
                                            />
                                            <span className="text-[12px] font-medium text-primary-blue/80 group-hover:text-primary-sky-blue transition-colors">
                                                Fechas/Horario
                                            </span>
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <button
                                            onClick={() =>
                                                setModalActividades({
                                                    isOpen: true,
                                                    pasantiaId: pasantia.id,
                                                    pasantiaNombre:
                                                        pasantia.nombre,
                                                })
                                            }
                                            className="flex flex-col items-center gap-0.5 mx-auto text-primary-blue hover:text-primary-sky-blue transition-colors group"
                                            title="Ver actividades de la pasantía"
                                        >
                                            <Calendar
                                                size={22}
                                                className="text-primary-blue group-hover:text-primary-sky-blue"
                                            />
                                            <span className="text-[12px] font-medium text-primary-blue/80 group-hover:text-primary-sky-blue transition-colors">
                                                Actividades
                                            </span>
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() =>
                                                    handleCuposChange(
                                                        pasantia.id,
                                                        pasantia.cupos - 1,
                                                        pasantia.inscritos,
                                                    )
                                                }
                                                disabled={
                                                    pasantia.cupos <=
                                                    pasantia.inscritos
                                                }
                                                className="p-1 rounded-lg bg-red-300 text-red-800 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <Minus size={15} />
                                            </button>
                                            <span className="font-medium">
                                                {pasantia.cupos_disponibles}
                                            </span>
                                            <button
                                                onClick={() =>
                                                    handleCuposChange(
                                                        pasantia.id,
                                                        pasantia.cupos + 1,
                                                        pasantia.inscritos,
                                                    )
                                                }
                                                className="p-1 rounded-lg bg-green-300 text-green-800 hover:bg-green-200 transition-all"
                                            >
                                                <Plus size={15} />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex flex-col items-center gap-0.5">
                                            <button
                                                onClick={() =>
                                                    setModalInscritos({
                                                        isOpen: true,
                                                        pasantiaId: pasantia.id,
                                                        pasantiaNombre:
                                                            pasantia.nombre,
                                                    })
                                                }
                                                className="text-primary-blue hover:text-primary-sky-blue transition-all cursor-pointer flex items-center justify-center gap-1"
                                                title="Ver inscritos"
                                            >
                                                <Users size={20} />
                                                <span className="text-base font-semibold">
                                                    {pasantia.inscritos}
                                                </span>
                                            </button>
                                            <div className="flex items-center gap-1">
                                                <span className="text-xs font-bold text-green-600">
                                                    +
                                                </span>
                                                <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">
                                                    ASIGNAR
                                                </span>
                                                <span className="text-xs font-bold text-red-600">
                                                    -
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {(() => {
                                            const estado =
                                                getEstadoBadge(pasantia);
                                            return (
                                                <div className="flex items-center justify-center gap-2">
                                                    <span
                                                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${estado.bg} ${estado.textColor}`}
                                                    >
                                                        {estado.icon}
                                                        {estado.text}
                                                    </span>
                                                    {estado.showCancel && (
                                                        <button
                                                            onClick={() =>
                                                                handleCancelarPasantia(
                                                                    pasantia.id,
                                                                )
                                                            }
                                                            className="text-red-500 hover:text-red-700 transition-all"
                                                            title="Cancelar pasantía"
                                                        >
                                                            <XCircle
                                                                size={16}
                                                            />
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })()}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-700 bg-gray-50 px-2 py-1 rounded-lg border border-gray-200">
                                            {formatDate(pasantia.fecha_ini)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <button
                                            onClick={() =>
                                                handleAbrirConfirmacionInicio(
                                                    pasantia.id,
                                                )
                                            }
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300 rounded-lg transition-all duration-200 font-medium text-sm cursor-pointer shadow-sm hover:shadow"
                                            title="Iniciar pasantía"
                                        >
                                            <Play
                                                size={11}
                                                className="text-green-600"
                                            />
                                            Iniciar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredAndSortedData.length === 0 && (
                    <div className="text-center py-16">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                            <Briefcase size={32} className="text-gray-400" />
                        </div>

                        {pasantiasData.length === 0 ? (
                            // No hay pasantías en absoluto
                            <>
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                    No hay pasantías Publicadas
                                </h3>
                                <p className="text-sm text-gray-500 mb-6">
                                    Aún no has creado ninguna pasantía. ¿Deseas
                                    crear una y publicarla?
                                </p>
                                <a
                                    href="/gerente/pasantias/crear"
                                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary-blue to-primary-sky-blue text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200"
                                >
                                    <Plus size={18} />
                                    Crear una nueva pasantía
                                </a>
                            </>
                        ) : (
                            // Hay pasantías pero no coinciden con los filtros
                            <>
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                    No se encontraron resultados
                                </h3>
                                <p className="text-sm text-gray-500 mb-4">
                                    No hay pasantías que coincidan con tu
                                    búsqueda.
                                </p>
                                <button
                                    onClick={() => setSearchTerm("")}
                                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200"
                                >
                                    <Search size={16} />
                                    Limpiar búsqueda
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
            {/* Modales */}
            <ModalHorario
                isOpen={modalHorario.isOpen}
                onClose={() =>
                    setModalHorario({
                        isOpen: false,
                        turno: null,
                        cargaHoraria: null,
                        fechaIni: null,
                        fechaFin: null,
                    })
                }
                turno={modalHorario.turno}
                cargaHoraria={modalHorario.cargaHoraria}
                fechaIni={modalHorario.fechaIni}
                fechaFin={modalHorario.fechaFin}
            />
            <ModalEditarPasantia
                isOpen={modalEditar.isOpen}
                onClose={() =>
                    setModalEditar({ isOpen: false, pasantia: null })
                }
                pasantia={modalEditar.pasantia}
                onUpdate={handlePasantiaEditada}
            />
            <ModalInscritos
                isOpen={modalInscritos.isOpen}
                onClose={() =>
                    setModalInscritos({
                        isOpen: false,
                        pasantiaId: null,
                        pasantiaNombre: null,
                    })
                }
                pasantiaId={modalInscritos.pasantiaId}
                pasantiaNombre={modalInscritos.pasantiaNombre}
            />

            <ModalConfirmacion
                isOpen={modalIniciar.isOpen}
                onClose={() =>
                    setModalIniciar({
                        isOpen: false,
                        pasantiaId: null,
                        infoInicio: null,
                    })
                }
                onConfirm={handleIniciarPasantia}
                titulo="Iniciar Pasantía"
                mensaje={
                    modalIniciar.infoInicio?.fecha_actual_es_menor
                        ? `¿Iniciar a pesar de que faltan ${Math.round(modalIniciar.infoInicio?.dias_restantes)} días para el inicio de la pasantía?`
                        : "¿Desea Iniciar la pasantía?"
                }
                type="info"
                confirmText="Iniciar"
                loading={loadingIniciar}
            />
            <ModalActividadesPasantia
                isOpen={modalActividades.isOpen}
                onClose={() =>
                    setModalActividades({
                        isOpen: false,
                        pasantiaId: null,
                        pasantiaNombre: null,
                    })
                }
                pasantiaId={modalActividades.pasantiaId}
                pasantiaNombre={modalActividades.pasantiaNombre}
                onUpdate={() => {
                    // En lugar de recargar la página, no hagas nada aquí
                    // o actualiza solo el estado local si necesitas reflejar cambios en la tabla
                }}
            />
        </GerenteLayout>
    );
}
