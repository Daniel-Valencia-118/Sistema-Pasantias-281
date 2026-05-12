// resources/js/Pages/Pasante/Inscribirse.jsx
import React, { useState, useMemo } from "react";
import { Head } from "@inertiajs/react";
import axios from "axios";
import PasanteLayout from "@/Components/Layout/PasanteLayout";
import ModalDetallesEmpresa from "@/Components/Common/ModalDetallesEmpresa";
import ModalHorario from "@/Components/Common/ModalHorario";
import ModalActividadesPasante from "@/Components/Common/ModalActividadesPasante";
import ModalConfirmacion from "@/Components/Common/ModalConfirmacion";
import ModalAlerta from "@/Components/Common/ModalAlerta";
import BadgeFecha from "@/Components/Common/BadgeFecha";
import {
    Search,
    Building2,
    Clock,
    Calendar as CalendarIcon,
    ChevronUp,
    ChevronDown,
    ArrowUpDown,
} from "lucide-react";

const MENCIONES_DISPONIBLES = [
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

    // Modales
    const [modalEmpresa, setModalEmpresa] = useState({
        isOpen: false,
        empresa: null,
    });
    const [modalHorario, setModalHorario] = useState({
        isOpen: false,
        turno: null,
        cargaHoraria: null,
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
    const getBotonEstado = (pasantia) => {
        if (pasantia.ya_inscrito) {
            return { text: "INSCRITO", color: "bg-green-700", isButton: false };
        }
        if (pasantia.cupos_disponibles <= 0) {
            return { text: "SIN CUPO", color: "bg-red-500", isButton: false };
        }
        return {
            text: "INSCRIBIRSE",
            color: "bg-green-500 hover:bg-green-600",
            isButton: true,
        };
    };

    return (
        <PasanteLayout auth={auth}>
            <Head title="Inscribirse a Pasantía" />

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-primary-navy to-primary-slate px-6 py-4">
                    <h2 className="text-xl font-semibold text-white">
                        Pasantías Disponibles
                    </h2>
                    <p className="text-primary-sky-blue text-sm">
                        Inscríbete a las pasantías de tu interés
                    </p>
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
                                Filtro por mención:
                            </span>
                            <select
                                value={filtroMencion}
                                onChange={(e) =>
                                    setFiltroMencion(e.target.value)
                                }
                                className="px-4 py-2 border border-gray-200 rounded-lg focus:border-primary-blue"
                            >
                                {todasMenciones.map((m) => (
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
                                        Nombre Pasantía{" "}
                                        <SortIcon field="nombre" />
                                    </div>
                                </th>
                                <th
                                    className="px-3 py-3 text-left text-xs font-bold text-white cursor-pointer hover:bg-white/10"
                                    onClick={() => handleSort("empresa_nombre")}
                                >
                                    <div className="flex items-center gap-1">
                                        Empresa{" "}
                                        <SortIcon field="empresa_nombre" />
                                    </div>
                                </th>
                                <th className="px-3 py-3 text-left text-xs font-bold text-white">
                                    Mención
                                </th>
                                <th className="px-3 py-3 text-center text-xs font-bold text-white">
                                    Actividades
                                </th>
                                <th className="px-3 py-3 text-center text-xs font-bold text-white">
                                    Horario
                                </th>
                                <th
                                    className="px-3 py-3 text-left text-xs font-bold text-white cursor-pointer hover:bg-white/10"
                                    onClick={() => handleSort("fecha_ini")}
                                >
                                    <div className="flex items-center gap-1">
                                        Fecha Inicio{" "}
                                        <SortIcon field="fecha_ini" />
                                    </div>
                                </th>
                                <th
                                    className="px-3 py-3 text-left text-xs font-bold text-white cursor-pointer hover:bg-white/10"
                                    onClick={() => handleSort("fecha_fin")}
                                >
                                    <div className="flex items-center gap-1">
                                        Fecha Final{" "}
                                        <SortIcon field="fecha_fin" />
                                    </div>
                                </th>
                                <th className="px-3 py-3 text-center text-xs font-bold text-white">
                                    Cupos
                                </th>
                                <th className="px-3 py-3 text-center text-xs font-bold text-white">
                                    Acción
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
                                            <div className="flex items-center gap-2">
                                                <span>
                                                    {pasantia.empresa.nombre}
                                                </span>
                                                <button
                                                    onClick={() =>
                                                        setModalEmpresa({
                                                            isOpen: true,
                                                            empresa:
                                                                pasantia.empresa,
                                                        })
                                                    }
                                                    className="text-primary-blue hover:text-primary-sky-blue"
                                                    title="Ver detalles de la empresa"
                                                >
                                                    <Building2 size={16} />
                                                </button>
                                            </div>
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
                                                className="text-primary-blue hover:text-primary-sky-blue"
                                                title="Ver actividades"
                                            >
                                                <CalendarIcon size={18} />
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
                                                    })
                                                }
                                                className="text-primary-blue hover:text-primary-sky-blue"
                                                title="Ver horario"
                                            >
                                                <Clock size={18} />
                                            </button>
                                        </td>
                                        <td className="px-3 py-3">
                                            <BadgeFecha
                                                fecha={pasantia.fecha_ini}
                                            />
                                        </td>
                                        <td className="px-3 py-3">
                                            <BadgeFecha
                                                fecha={pasantia.fecha_fin}
                                            />
                                        </td>
                                        <td className="px-3 py-3 text-center">
                                            <span
                                                className={`inline-flex px-2 py-1 rounded-full text-base font-medium ${
                                                    pasantia.cupos_disponibles >
                                                    0
                                                        ? "bg-yellow-100 text-yellow-900"
                                                        : "bg-red-100 text-red-800"
                                                }`}
                                            >
                                                {pasantia.cupos_disponibles}
                                            </span>
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
                                                    className={`px-3 py-1 text-white text-xs font-medium rounded-lg transition-all ${boton.color} ${
                                                        inscribiendoId ===
                                                        pasantia.id
                                                            ? "opacity-50 cursor-not-allowed"
                                                            : ""
                                                    }`}
                                                >
                                                    {inscribiendoId ===
                                                    pasantia.id
                                                        ? "INSCRIBIENDO..."
                                                        : boton.text}
                                                </button>
                                            ) : (
                                                <span
                                                    className={`inline-flex px-3 py-1 text-white text-xs font-medium rounded-lg ${boton.color}`}
                                                >
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
                    })
                }
                turno={modalHorario.turno}
                cargaHoraria={modalHorario.cargaHoraria}
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
