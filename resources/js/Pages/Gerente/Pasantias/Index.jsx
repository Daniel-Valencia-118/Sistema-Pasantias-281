import React, { useState, useMemo } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import { Play, Flag, RefreshCw } from "lucide-react";
import ModalConfirmacion from "@/Components/Common/ModalConfirmacion";
import GerenteLayout from "@/Components/Layout/GerenteLayout";
import ModalHorario from "@/Components/Common/ModalHorario";
import ModalActividadesPasantia from "@/Components/Common/ModalActividadesPasantia";
import ModalEditarPasantia from "@/Components/Common/ModalEditarPasantia";
import ModalInscritosActivos from "@/Components/Common/ModalInscritosActivos";
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
    const [loadingAbrir, setLoadingAbrir] = useState(false);
    const [modalEditar, setModalEditar] = useState({
        isOpen: false,
        pasantia: null,
    });

    const [sortDirection, setSortDirection] = useState("desc");
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
    const [modalAbrir, setModalAbrir] = useState({
        isOpen: false,
        pasantiaId: null,
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
    // Función para abrir pasantía (cambiar a ABIERTA)
    const handleAbrirPasantia = async () => {
        setLoadingAbrir(true);
        try {
            const response = await axios.patch(
                `/gerente/pasantias/${modalAbrir.pasantiaId}/abrir`,
            );
            if (response.data.message) {
                // Actualizar el estado local de la pasantía
                setPasantiasData((prev) =>
                    prev.map((p) =>
                        p.id === modalAbrir.pasantiaId
                            ? { ...p, estado: "ABIERTA" }
                            : p,
                    ),
                );
            }
            setModalAbrir({ isOpen: false, pasantiaId: null });
        } catch (error) {
            alert(
                error.response?.data?.message || "Error al abrir la pasantía",
            );
            setModalAbrir({ isOpen: false, pasantiaId: null });
        } finally {
            setLoadingAbrir(false);
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
                text: "Eiminar Pasantia",
                bg: "bg-red-100",
                textColor: "text-red-800",
                showCancel: true,
            };
        }

        // MEJOR ESTADO: Cupos disponibles = 0 Y todos tienen jefe
        if (todos_con_jefe) {
            return {
                text: "En Orden",
                bg: "bg-green-100",
                textColor: "text-green-800",
                icon: <CheckCircle size={12} />,
                showCancel: false,
            };
        }

        // NORMAL: Cupos disponibles = 0 pero no todos tienen jefe
        // if (cupos_disponibles === 0 && !todos_con_jefe) {
        //     return {
        //         text: "Falta Asignar Jefe",
        //         bg: "bg-yellow-100",
        //         textColor: "text-yellow-800",
        //         icon: <AlertTriangle size={12} />,
        //         showCancel: false,
        //     };
        // }
        if (!todos_con_jefe) {
            return {
                text: "Asignar Jefe Pas.",
                bg: "bg-yellow-100",
                textColor: "text-yellow-800",
                icon: <AlertTriangle size={17} />,
                showCancel: false,
            };
        }
        // // NORMAL: Cupos disponibles > 0 pero todos tienen jefe
        // if (cupos_disponibles > 0 && todos_con_jefe) {
        //     return {
        //         text: "Falta Completar Cupos",
        //         bg: "bg-blue-100",
        //         textColor: "text-blue-800",
        //         icon: <AlertTriangle size={12} />,
        //         showCancel: false,
        //     };
        // }

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
                                    FECHAS Y HORARIO
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-white">
                                    ACTIVIDADES
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-white">
                                    CUPOS DISPONIBLES
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-white">
                                    PASANTES INSCRITOS
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-white">
                                    JEFE PASANTIA
                                </th>
                                {/* <th
                                    className="px-4 py-3 text-left text-xs font-bold text-white cursor-pointer hover:bg-white/10"
                                    onClick={() => handleSort("fecha_ini")}
                                >
                                    <div className="flex items-center gap-1">
                                        FECHA INI.{" "}
                                        <SortIcon field="fecha_ini" />
                                    </div>
                                </th> */}
                                <th className="px-4 py-3 text-center text-xs font-bold text-white">
                                    ABRIR/CERRAR INSCRIPCIÓN
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
                                            className="flex flex-col items-center gap-0.5 mx-auto text-primary-blue hover:text-primary-sky-blue transition-colors group cursor-pointer"
                                            title="Ver horario y fechas"
                                        >
                                            <Clock
                                                size={22}
                                                className="text-primary-blue group-hover:text-primary-sky-blue cursor-pointer"
                                            />
                                            <span className="text-[12px] font-medium text-primary-blue/80 group-hover:text-primary-sky-blue transition-colors cursor-pointer">
                                                Fechas/Horario
                                            </span>
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex flex-col items-center gap-1">
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
                                                    size={20}
                                                    className="text-primary-blue group-hover:text-primary-sky-blue cursor-pointer"
                                                />
                                            </button>

                                            <button
                                                onClick={() =>
                                                    setModalActividades({
                                                        isOpen: true,
                                                        pasantiaId: pasantia.id,
                                                        pasantiaNombre:
                                                            pasantia.nombre,
                                                    })
                                                }
                                                className="px-3 py-1 bg-primary-blue text-white text-[10px] font-semibold rounded-md shadow-sm hover:bg-primary-sky-blue transition-all duration-200 cursor-pointer"
                                                title="Ver actividades"
                                            >
                                                Actividades
                                            </button>
                                        </div>
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
                                                className="p-1 rounded-lg bg-red-600 text-red-200 hover:bg-red-400 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
                                                className="p-1 rounded-lg bg-green-600 text-green-200 hover:bg-green-400 transition-all cursor-pointer"
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
                                                className="flex items-center justify-center gap-1.5 text-primary-blue hover:text-primary-sky-blue transition-all cursor-pointer group"
                                                title="Ver inscritos"
                                            >
                                                <Users size={20} />
                                                <span className="text-base font-semibold">
                                                    {pasantia.inscritos}
                                                </span>
                                            </button>

                                            <button
                                                onClick={() =>
                                                    setModalInscritos({
                                                        isOpen: true,
                                                        pasantiaId: pasantia.id,
                                                        pasantiaNombre:
                                                            pasantia.nombre,
                                                    })
                                                }
                                                className="px-3 py-1 bg-primary-blue text-white text-[10px] font-semibold rounded-md shadow-sm hover:bg-primary-sky-blue transition-all duration-200 cursor-pointer"
                                                title="Gestionar pasantes (asignar/desasignar)"
                                            >
                                                GESTIONAR
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {(() => {
                                            const estado =
                                                getEstadoBadge(pasantia);
                                            return (
                                                <div className="flex items-center justify-center gap-0">
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
                                                                size={15}
                                                            />
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })()}
                                    </td>
                                    {/* <td className="px-4 py-3">
                                        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-700 bg-gray-50 px-2 py-1 rounded-lg border border-gray-200">
                                            {formatDate(pasantia.fecha_ini)}
                                        </span>
                                    </td> */}
                                    <td className="px-4 py-3 text-center">
                                        {pasantia.estado === "ABIERTA" ? (
                                            <button
                                                onClick={() =>
                                                    handleAbrirConfirmacionInicio(
                                                        pasantia.id,
                                                    )
                                                }
                                                className="px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded-md shadow-sm hover:bg-red-700 transition-all duration-200 cursor-pointer"
                                                title="Cerrar Inscripciones"
                                            >
                                                Cerrar Inscripciones
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() =>
                                                    setModalAbrir({
                                                        isOpen: true,
                                                        pasantiaId: pasantia.id,
                                                    })
                                                }
                                                className="px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded-md shadow-sm hover:bg-green-700 transition-all duration-200 cursor-pointer"
                                                title="Habilitar Inscripciones"
                                            >
                                                Abrir Inscripciones
                                            </button>
                                        )}
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

            <ModalInscritosActivos
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
                titulo="Cerrar Inscripciones"
                mensaje={
                    modalIniciar.infoInicio?.fecha_actual_es_menor
                        ? `¿Cerrar incripcion a pesar de que faltan ${Math.round(modalIniciar.infoInicio?.dias_restantes)} días para el inicio de la pasantía? Ya no se pondrán inscribir a esta pasantia`
                        : "¿Desea cerrar las incripciones de la pasantía? Ya no se pondrán inscribir a esta pasantia"
                }
                type="info"
                confirmText="Confirmar"
                loading={loadingIniciar}
            />
            <ModalConfirmacion
                isOpen={modalAbrir.isOpen}
                onClose={() =>
                    setModalAbrir({ isOpen: false, pasantiaId: null })
                }
                onConfirm={handleAbrirPasantia}
                titulo="Abrir Incripciones"
                mensaje="¿Estás seguro de que deseas abrir la inscripción de la pasantia? Volverá a estar disponible para que puedan inscribirse."
                type="info"
                confirmText="Confirmar"
                loading={loadingAbrir}
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
