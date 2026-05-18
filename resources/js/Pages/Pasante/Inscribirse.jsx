// resources/js/Pages/Pasante/Inscribirse.jsx
import React, { useState, useMemo } from "react";
import { Head } from "@inertiajs/react";
import axios from "axios";
import PasanteLayout from "@/Components/Layout/PasanteLayout";
import ModalDetallesEmpresa from "@/Components/Common/ModalDetallesEmpresa";
import ModalHorario from "@/Components/Common/ModalHorario";
import ModalActividadesPasante from "@/Components/Common/ModalActividadesPasante";
import ModalScoreEmpresa from "@/Components/Common/ModalScoreEmpresa";
import ModalConfirmacion from "@/Components/Common/ModalConfirmacion";
import ModalAlerta from "@/Components/Common/ModalAlerta";
import BadgeFecha from "@/Components/Common/BadgeFecha";
import {
    CheckCircle,
    XCircle,
    AlertTriangle,
    Users,
    Search,
    Building2,
    Clock,
    Calendar as CalendarIcon,
    ChevronUp,
    ChevronDown,
    Star,
    ArrowUpDown,
} from "lucide-react";

const MENCIONES_DISPONIBLES = [
    "Todos",
    "Desarrollo de Software e Innovación Tecnológica",
    "Inteligencia Artificial y Ciencias de Datos",
    "Ciencias de la Computación",
    "Informática Industrial",
    "Ingeniería de Sistemas",
    "Redes y TIC",
    "Seguridad de la Información",
];

export default function Inscribirse({
    auth,
    pasantias,
    menciones,
    mencionPorDefecto,
    mencionPasante,
}) {
    const [pasantiasData, setPasantiasData] = useState(pasantias);
    const [searchNombre, setSearchNombre] = useState("");
    const [searchEmpresa, setSearchEmpresa] = useState("");
    const [filtroMencion, setFiltroMencion] = useState(mencionPorDefecto);
    const [sortField, setSortField] = useState("fecha_ini");
    const [sortDirection, setSortDirection] = useState("asc");
    const [modalScore, setModalScore] = useState({
        isOpen: false,
        empresaId: null,
        empresaNombre: null,
    });
    // Modales
    const [modalEmpresa, setModalEmpresa] = useState({
        isOpen: false,
        empresa: null,
    });
    const [modalHorario, setModalHorario] = useState({
        isOpen: false,
        turno: null,
        cargaHoraria: null,
        fechaIni: null,
        fechaFin: null,
    });
    const [modalActividades, setModalActividades] = useState({
        isOpen: false,
        nombre: null,
        actividades: [],
    });
    const [modalConfirm, setModalConfirm] = useState({
        isOpen: false,
        pasantia: null,
    });
    const [modalAlerta, setModalAlerta] = useState({
        isOpen: false,
        titulo: "",
        mensaje: "",
        type: "error",
    });

    const [inscribiendoId, setInscribiendoId] = useState(null);

    const todasMenciones = [
        "Todos",
        ...MENCIONES_DISPONIBLES.filter((m) => menciones.includes(m)),
    ];

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

    const mostrarAlerta = (titulo, mensaje, type = "error") => {
        setModalAlerta({ isOpen: true, titulo, mensaje, type });
    };

    const confirmarInscripcion = (pasantia) => {
        setModalConfirm({ isOpen: true, pasantia });
    };

    const ejecutarInscripcion = async () => {
        const pasantia = modalConfirm.pasantia;
        if (!pasantia) return;

        setModalConfirm({ isOpen: false, pasantia: null });
        setInscribiendoId(pasantia.id);

        try {
            const response = await axios.post(
                `/pasante/inscribirse/${pasantia.id}`,
            );

            if (response.data.success) {
                mostrarAlerta(
                    "¡Inscripción exitosa!",
                    response.data.message,
                    "success",
                );

                //(window.location.href = "/pasante/inscripciones/activas");
                // Actualizar la lista localmente
                setPasantiasData((prevData) =>
                    prevData.map((p) => {
                        if (p.id === pasantia.id) {
                            return {
                                ...p,
                                cupos_disponibles: p.cupos_disponibles - 1,
                                ya_inscrito: true,
                            };
                        }
                        return p;
                    }),
                );
            }
        } catch (error) {
            const mensaje =
                error.response?.data?.message || "Error al inscribirse";
            mostrarAlerta("Error", mensaje, "error");
        } finally {
            setInscribiendoId(null);
        }
    };

    // Filtrar y ordenar datos
    const filteredAndSortedData = useMemo(() => {
        let filtered = [...pasantiasData];

        if (searchNombre) {
            filtered = filtered.filter((p) =>
                p.nombre.toLowerCase().includes(searchNombre.toLowerCase()),
            );
        }

        if (searchEmpresa) {
            filtered = filtered.filter((p) =>
                p.empresa.nombre
                    .toLowerCase()
                    .includes(searchEmpresa.toLowerCase()),
            );
        }

        if (filtroMencion !== "Todos") {
            filtered = filtered.filter((p) => p.mencion === filtroMencion);
        }

        filtered.sort((a, b) => {
            let aVal = a[sortField];
            let bVal = b[sortField];

            if (sortField === "fecha_ini" || sortField === "fecha_fin") {
                aVal = new Date(aVal);
                bVal = new Date(bVal);
            } else if (sortField === "empresa_nombre") {
                aVal = a.empresa.nombre.toLowerCase();
                bVal = b.empresa.nombre.toLowerCase();
            } else if (typeof aVal === "string") {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }

            if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
            if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
            return 0;
        });

        return filtered;
    }, [
        pasantiasData,
        searchNombre,
        searchEmpresa,
        filtroMencion,
        sortField,
        sortDirection,
    ]);

    // Determinar el estado del botón de acción
    // Determinar el estado del botón de acción
    const getBotonEstado = (pasantia) => {
        // Si ya está inscrito
        if (pasantia.ya_inscrito) {
            return {
                text: "INSCRITO",
                color: "bg-gradient-to-r from-green-600 to-emerald-600",
                icon: <CheckCircle size={14} className="-mr-1" />,
                isButton: false,
            };
        }
        // Si no hay cupos disponibles
        if (pasantia.cupos_disponibles <= 0) {
            return {
                text: "SIN CUPO",
                color: "bg-gradient-to-r from-red-600 to-rose-500",
                icon: <XCircle size={14} className="-mr-1" />,
                isButton: false,
            };
        }
        // Si la mención del pasante NO coincide con la mención de la pasantía
        if (!pasantia.mencion_coincide) {
            return {
                text: "Inhabilitado",
                color: "bg-gradient-to-r from-orange-500 to-amber-500",
                icon: <AlertTriangle size={14} className="-mr-1" />,
                isButton: false,
            };
        }
        // Botón normal para inscribirse
        return {
            text: "INSCRIBIRSE",
            color: "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-md hover:shadow-lg",
            icon: <Users size={14} className="-mr-1" />,
            isButton: true,
        };
    };

    return (
        <PasanteLayout auth={auth}>
            <Head title="Inscribirse a Pasantía" />

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Hero Section */}
                <div className="bg-gradient-to-br from-primary-navy via-primary-slate to-gray-800 rounded-2xl shadow-xl p-6 mb-1 text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm"></div>
                            <h1 className="text-3xl font-bold">
                                Ofertas de Pasantías
                            </h1>
                        </div>
                        <p className="text-white/80 text-lg mb-6">
                            Inscríbete a las pasantías de tu mencion (Puedes
                            estar inscrito maximo a 2 pasantias)
                        </p>
                    </div>
                </div>

                {/* Filtros y búsqueda */}
                <div className="p-4 border-b space-y-3">
                    <div className="flex flex-wrap gap-3">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                            <input
                                type="text"
                                placeholder="Buscar por nombre de pasantía..."
                                value={searchNombre}
                                onChange={(e) =>
                                    setSearchNombre(e.target.value)
                                }
                                className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20"
                            />
                        </div>
                        <div className="relative flex-1 min-w-[200px]">
                            <Search
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                            <input
                                type="text"
                                placeholder="Buscar por nombre de empresa..."
                                value={searchEmpresa}
                                onChange={(e) =>
                                    setSearchEmpresa(e.target.value)
                                }
                                className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">
                                Mención:
                            </span>
                            <select
                                value={filtroMencion}
                                onChange={(e) =>
                                    setFiltroMencion(e.target.value)
                                }
                                className="px-4 py-2 border border-gray-200 rounded-lg focus:border-primary-blue"
                            >
                                {MENCIONES_DISPONIBLES.map((m) => (
                                    <option key={m} value={m}>
                                        {m}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Tabla */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-primary-navy to-primary-slate">
                            <tr>
                                <th className="px-3 py-3 text-left text-xs font-bold text-white">
                                    Nro
                                </th>
                                <th
                                    className="px-3 py-3 text-left text-xs font-bold text-white cursor-pointer hover:bg-white/10"
                                    onClick={() => handleSort("nombre")}
                                >
                                    <div className="flex items-center gap-1">
                                        NOMBRE PASANTÍA{" "}
                                        <SortIcon field="nombre" />
                                    </div>
                                </th>
                                <th
                                    className="px-3 py-3 text-left text-xs font-bold text-white cursor-pointer hover:bg-white/10"
                                    onClick={() => handleSort("empresa_nombre")}
                                >
                                    <div className="flex items-center gap-1">
                                        EMPRESA{" "}
                                        <SortIcon field="empresa_nombre" />
                                    </div>
                                </th>
                                <th className="px-3 py-3 text-center text-xs font-bold text-white">
                                    SCORE
                                </th>

                                <th className="px-3 py-3 text-left text-xs font-bold text-white">
                                    MENCIÓN
                                </th>
                                <th className="px-3 py-3 text-center text-xs font-bold text-white">
                                    ACTVIDA.
                                </th>
                                <th className="px-3 py-3 text-center text-xs font-bold text-white">
                                    HRS./FECHAS
                                </th>
                                <th
                                    className="px-3 py-3 text-left text-xs font-bold text-white cursor-pointer hover:bg-white/10"
                                    onClick={() => handleSort("fecha_ini")}
                                >
                                    <div className="flex items-center gap-1">
                                        FECHA INICIO{" "}
                                        <SortIcon field="fecha_ini" />
                                    </div>
                                </th>
                                {/* <th
                                    className="px-3 py-3 text-left text-xs font-bold text-white cursor-pointer hover:bg-white/10"
                                    onClick={() => handleSort("fecha_fin")}
                                >
                                    <div className="flex items-center gap-1">
                                        Fecha Final{" "}
                                        <SortIcon field="fecha_fin" />
                                    </div>
                                </th> */}
                                <th className="px-3 py-3 text-center text-xs font-bold text-white">
                                    CUPOS DISPONIBLES
                                </th>
                                <th className="px-3 py-3 text-center text-xs font-bold text-white">
                                    INSCRIBIRSE
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredAndSortedData.map((pasantia, index) => {
                                const boton = getBotonEstado(pasantia);
                                return (
                                    <tr
                                        key={pasantia.id}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-3 py-3 text-sm text-gray-500">
                                            {index + 1}
                                        </td>
                                        <td className="px-3 py-3 text-sm font-medium text-gray-900">
                                            {pasantia.nombre}
                                        </td>
                                        <td className="px-3 py-3 text-sm text-gray-600">
                                            <button
                                                onClick={() =>
                                                    setModalEmpresa({
                                                        isOpen: true,
                                                        empresa:
                                                            pasantia.empresa,
                                                    })
                                                }
                                                className="inline-flex items-center gap-1 text-gray-700 hover:text-primary-blue transition-colors group"
                                                title="Ver detalles de la empresa"
                                            >
                                                <span className="group-hover:text-primary-blue">
                                                    {pasantia.empresa.nombre}
                                                </span>
                                                <Building2
                                                    size={20}
                                                    className="text-primary-blue"
                                                />
                                            </button>
                                        </td>

                                        <td className="px-3 py-3 text-center">
                                            <button
                                                onClick={() =>
                                                    setModalScore({
                                                        isOpen: true,
                                                        empresaId:
                                                            pasantia.empresa.id,
                                                        empresaNombre:
                                                            pasantia.empresa
                                                                .nombre,
                                                    })
                                                }
                                                className="text-yellow-500 hover:text-yellow-600 transition-transform hover:scale-110"
                                                title="Ver calificaciones de la empresa"
                                            >
                                                <Star
                                                    size={18}
                                                    fill="currentColor"
                                                />
                                            </button>
                                        </td>

                                        <td className="px-3 py-3 text-sm text-gray-600">
                                            <span
                                                className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                                                    pasantia.mencion ===
                                                    mencionPasante
                                                        ? "bg-blue-100 text-blue-800"
                                                        : "bg-gray-100 text-gray-600"
                                                }`}
                                            >
                                                {pasantia.mencion}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3 text-center">
                                            <button
                                                onClick={() =>
                                                    setModalActividades({
                                                        isOpen: true,
                                                        nombre: pasantia.nombre,
                                                        actividades:
                                                            pasantia.actividades ||
                                                            [],
                                                    })
                                                }
                                                className="flex flex-col items-center gap-0.5 text-primary-blue hover:text-primary-sky-blue transition-colors"
                                                title="Ver actividades"
                                            >
                                                <CalendarIcon size={20} />
                                                <span className="text-[9px] font-medium">
                                                    Actividades
                                                </span>
                                            </button>
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
                                                className="flex flex-col items-center gap-0.5 text-gray-500 hover:text-primary-blue transition-colors"
                                                title="Ver fecha y horario"
                                            >
                                                <Clock size={20} />
                                                <span className="text-[9px] font-medium">
                                                    Hora/Fecha
                                                </span>
                                            </button>
                                        </td>
                                        <td className="px-3 py-3">
                                            <BadgeFecha
                                                fecha={pasantia.fecha_ini}
                                            />
                                        </td>
                                        {/* <td className="px-3 py-3">
                                            <BadgeFecha
                                                fecha={pasantia.fecha_fin}
                                            />
                                        </td> */}
                                        <td className="px-3 py-3 text-center">
                                            <div className="flex flex-col items-center gap-0.5">
                                                <span
                                                    className={`inline-flex items-center justify-center w-10 h-10 rounded-xl text-base font-bold shadow-sm ${
                                                        pasantia.cupos_disponibles >
                                                        0
                                                            ? "bg-gradient-to-br from-green-100 to-green-200 text-green-700 border border-green-200"
                                                            : "bg-gradient-to-br from-red-100 to-red-200 text-red-700 border border-red-200"
                                                    }`}
                                                >
                                                    {pasantia.cupos_disponibles}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="px-3 py-3 text-center">
                                            {boton.isButton ? (
                                                <button
                                                    onClick={() =>
                                                        confirmarInscripcion(
                                                            pasantia,
                                                        )
                                                    }
                                                    disabled={
                                                        inscribiendoId ===
                                                        pasantia.id
                                                    }
                                                    className={`inline-flex items-center gap-1.5 px-4 py-2 text-white text-xs font-semibold rounded-lg transition-all duration-200 ${boton.color} ${
                                                        inscribiendoId ===
                                                        pasantia.id
                                                            ? "opacity-50 cursor-not-allowed"
                                                            : "transform hover:scale-105 active:scale-95"
                                                    }`}
                                                >
                                                    {inscribiendoId ===
                                                    pasantia.id ? (
                                                        <>
                                                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                            INSCRIBIENDO...
                                                        </>
                                                    ) : (
                                                        <>
                                                            {boton.icon}
                                                            {boton.text}
                                                        </>
                                                    )}
                                                </button>
                                            ) : (
                                                <span
                                                    className={`inline-flex items-center gap-1.5 px-4 py-2 text-white text-xs font-semibold rounded-lg shadow-sm ${boton.color}`}
                                                >
                                                    {boton.icon}
                                                    {boton.text}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {filteredAndSortedData.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        No hay pasantías que coincidan con los filtros
                    </div>
                )}
            </div>

            {/* Modales */}
            <ModalDetallesEmpresa
                isOpen={modalEmpresa.isOpen}
                onClose={() =>
                    setModalEmpresa({ isOpen: false, empresa: null })
                }
                empresa={modalEmpresa.empresa}
            />

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

            <ModalActividadesPasante
                isOpen={modalActividades.isOpen}
                onClose={() =>
                    setModalActividades({
                        isOpen: false,
                        nombre: null,
                        actividades: [],
                    })
                }
                pasantiaNombre={modalActividades.nombre}
                actividades={modalActividades.actividades}
            />

            <ModalConfirmacion
                isOpen={modalConfirm.isOpen}
                onClose={() =>
                    setModalConfirm({ isOpen: false, pasantia: null })
                }
                onConfirm={ejecutarInscripcion}
                titulo="Confirmar inscripción"
                mensaje={`¿Estás seguro de que deseas inscribirte en la pasantía "${modalConfirm.pasantia?.nombre}"?`}
                type="info"
                confirmText="Sí, inscribirme"
            />
            <ModalScoreEmpresa
                isOpen={modalScore.isOpen}
                onClose={() =>
                    setModalScore({
                        isOpen: false,
                        empresaId: null,
                        empresaNombre: null,
                    })
                }
                empresaId={modalScore.empresaId}
                empresaNombre={modalScore.empresaNombre}
            />
            <ModalAlerta
                isOpen={modalAlerta.isOpen}
                onClose={() =>
                    setModalAlerta({
                        isOpen: false,
                        titulo: "",
                        mensaje: "",
                        type: "error",
                    })
                }
                titulo={modalAlerta.titulo}
                mensaje={modalAlerta.mensaje}
                type={modalAlerta.type}
            />
        </PasanteLayout>
    );
}
