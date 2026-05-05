import React, { useState, useMemo } from "react";
import { Head, router } from "@inertiajs/react";
import GerenteLayout from "@/Components/Layout/GerenteLayout";
import ModalDetallesPasantia from "@/Components/Common/ModalDetallesPasantia";
import ModalActividadesPasantia from "@/Components/Common/ModalActividadesPasantia";
import ModalInscritosActivos from "@/Components/Common/ModalInscritosActivos";
import BadgeFecha from "@/Components/Common/BadgeFecha";
import {
    Eye,
    Calendar,
    Users,
    Search,
    ArrowUpDown,
    AlertTriangle,
    CheckCircle,
    ChevronUp,
    ChevronDown,
} from "lucide-react";

export default function Activas({ auth, pasantias }) {
    const [pasantiasData, setPasantiasData] = useState(pasantias);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortField, setSortField] = useState("fecha_ini");
    const [sortDirection, setSortDirection] = useState("asc");
    const [modalDetalles, setModalDetalles] = useState({
        isOpen: false,
        pasantia: null,
    });
    const [modalActividades, setModalActividades] = useState({
        isOpen: false,
        pasantiaId: null,
        pasantiaNombre: null,
        pasantiaFechaIni: null,
        pasantiaFechaFin: null,
    });
    const [modalInscritos, setModalInscritos] = useState({
        isOpen: false,
        pasantiaId: null,
        pasantiaNombre: null,
    });

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

    const filteredAndSortedData = useMemo(() => {
        let filtered = [...pasantiasData];

        if (searchTerm) {
            filtered = filtered.filter((p) =>
                p.nombre.toLowerCase().includes(searchTerm.toLowerCase()),
            );
        }

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
            return 0;
        });

        return filtered;
    }, [pasantiasData, searchTerm, sortField, sortDirection]);

    return (
        <GerenteLayout auth={auth}>
            <Head title="Pasantías Activas" />

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-primary-navy to-primary-slate px-6 py-4">
                    <h2 className="text-xl font-semibold text-white">
                        Pasantías Activas
                    </h2>
                    <p className="text-primary-sky-blue text-sm">
                        Pasantías en estado INICIADO
                    </p>
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
                                <th className="px-4 py-3 text-left text-xs font-bold text-white">
                                    Nro
                                </th>
                                <th
                                    className="px-4 py-3 text-left text-xs font-bold text-white cursor-pointer hover:bg-white/10"
                                    onClick={() => handleSort("nombre")}
                                >
                                    <div className="flex items-center gap-1">
                                        Nombre <SortIcon field="nombre" />
                                    </div>
                                </th>
                                <th
                                    className="px-4 py-3 text-left text-xs font-bold text-white cursor-pointer hover:bg-white/10"
                                    onClick={() => handleSort("fecha_ini")}
                                >
                                    <div className="flex items-center gap-1">
                                        Fecha Inicio{" "}
                                        <SortIcon field="fecha_ini" />
                                    </div>
                                </th>
                                <th
                                    className="px-4 py-3 text-left text-xs font-bold text-white cursor-pointer hover:bg-white/10"
                                    onClick={() => handleSort("fecha_fin")}
                                >
                                    <div className="flex items-center gap-1">
                                        Fecha Fin <SortIcon field="fecha_fin" />
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-white">
                                    Mencion
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-white">
                                    Detalles
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-white">
                                    Actividades
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-white">
                                    Pasantes
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-white">
                                    Estado
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredAndSortedData.map((pasantia, index) => (
                                <tr
                                    key={pasantia.id}
                                    className="hover:bg-gray-50"
                                >
                                    <td className="px-4 py-3 text-sm text-gray-500">
                                        {index + 1}
                                    </td>
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                        {pasantia.nombre}
                                    </td>
                                    <td className="px-4 py-3">
                                        <BadgeFecha
                                            fecha={pasantia.fecha_ini}
                                        />
                                    </td>
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                        <BadgeFecha
                                            fecha={pasantia.fecha_fin}
                                        />
                                    </td>
                                    <td className="px-2 py-1 text-xs font-medium text-gray-900">
                                        {pasantia.mencion}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <button
                                            onClick={() =>
                                                setModalDetalles({
                                                    isOpen: true,
                                                    pasantia: pasantia,
                                                })
                                            }
                                            className="text-primary-blue hover:text-primary-sky-blue transition-all cursor-pointer"
                                            title="Ver detalles"
                                        >
                                            <Eye size={18} />
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
                                                    pasantiaFechaIni:
                                                        pasantia.fecha_ini,
                                                    pasantiaFechaFin:
                                                        pasantia.fecha_fin,
                                                })
                                            }
                                            className="text-primary-blue hover:text-primary-sky-blue transition-all cursor-pointer"
                                            title="Ver actividades"
                                        >
                                            <Calendar size={18} />
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <button
                                            onClick={() =>
                                                setModalInscritos({
                                                    isOpen: true,
                                                    pasantiaId: pasantia.id,
                                                    pasantiaNombre:
                                                        pasantia.nombre,
                                                })
                                            }
                                            className="text-primary-blue hover:text-primary-sky-blue transition-all cursor-pointer flex items-center justify-center gap-1 mx-auto"
                                            title="Ver pasantes"
                                        >
                                            <Users size={16} />
                                            <span className="text-sm">
                                                {pasantia.inscritos}
                                            </span>
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {(() => {
                                            const { todos_con_jefe } = pasantia;
                                            if (todos_con_jefe) {
                                                return (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        <CheckCircle
                                                            size={12}
                                                        />{" "}
                                                        En Orden
                                                    </span>
                                                );
                                            } else {
                                                return (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                        <AlertTriangle
                                                            size={12}
                                                        />{" "}
                                                        Falta Asignar Jefe
                                                    </span>
                                                );
                                            }
                                        })()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredAndSortedData.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        No hay pasantías activas
                    </div>
                )}
            </div>

            {/* Modales reutilizables */}
            <ModalDetallesPasantia
                isOpen={modalDetalles.isOpen}
                onClose={() =>
                    setModalDetalles({ isOpen: false, pasantia: null })
                }
                pasantia={modalDetalles.pasantia}
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
                esActiva={true}
                onUpdate={() => {}}
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
        </GerenteLayout>
    );
}
