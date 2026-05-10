import React, { useState, useMemo } from "react";
import axios from "axios";
import { Head } from "@inertiajs/react";
import GerenteLayout from "@/Components/Layout/GerenteLayout";
import ModalDetallesPasantia from "@/Components/Common/ModalDetallesPasantia";
import ModalActividadesPasantia from "@/Components/Common/ModalActividadesPasantia";
import ModalPasantesPromedio from "@/Components/Common/ModalPasantesPromedio";
import ModalCalificaciones from "@/Components/Common/ModalCalificaciones";
import ModalActividadesFinalizadas from "@/Components/Common/ModalActividadesFinalizadas";
import BadgeFecha from "@/Components/Common/BadgeFecha";
import {
    Eye,
    Calendar,
    Users,
    Star,
    Search,
    ArrowUpDown,
    ChevronUp,
    ChevronDown,
    CheckCircle,
} from "lucide-react";

export default function Finalizadas({ auth, pasantias }) {
    const [pasantiasData, setPasantiasData] = useState(pasantias);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortField, setSortField] = useState("fecha_ini");
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
    const [modalPasantes, setModalPasantes] = useState({
        isOpen: false,
        pasantiaId: null,
        pasantiaNombre: null,
    });
    const [modalCalificaciones, setModalCalificaciones] = useState({
        isOpen: false,
        pasantiaId: null,
        pasantiaNombre: null,
        promedio: null,
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

    const renderStars = (rating) => {
        const fullStars = Math.floor(rating);
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Star
                    key={i}
                    size={14}
                    className={
                        i <= fullStars
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                    }
                />,
            );
        }
        return (
            <div className="flex items-center gap-0.5">
                {stars}
                <span className="ml-1 text-xs text-gray-600">({rating})</span>
            </div>
        );
    };

    const filteredAndSorted = useMemo(() => {
        let filtered = [...pasantiasData];

        if (searchTerm) {
            filtered = filtered.filter(
                (p) =>
                    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    p.mencion.toLowerCase().includes(searchTerm.toLowerCase()),
            );
        }

        filtered.sort((a, b) => {
            let aVal = a[sortField];
            let bVal = b[sortField];

            if (sortField === "fecha_ini" || sortField === "fecha_fin") {
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
            <Head title="Pasantías Finalizadas" />

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-primary-navy to-primary-slate px-6 py-4">
                    <h2 className="text-xl font-semibold text-white">
                        Pasantías Finalizadas
                    </h2>
                    <p className="text-primary-sky-blue text-sm">
                        Historial de pasantías completadas
                    </p>
                </div>

                {/* Búsqueda */}
                <div className="p-4 border-b">
                    <div className="relative w-80">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o mención..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20"
                        />
                    </div>
                </div>

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
                                        Nombre <SortIcon field="nombre" />
                                    </div>
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
                                        Fecha Fin <SortIcon field="fecha_fin" />
                                    </div>
                                </th>
                                <th
                                    className="px-3 py-3 text-left text-xs font-bold text-white cursor-pointer hover:bg-white/10"
                                    onClick={() => handleSort("mencion")}
                                >
                                    <div className="flex items-center gap-1">
                                        Mención <SortIcon field="mencion" />
                                    </div>
                                </th>
                                <th className="px-3 py-3 text-center text-xs font-bold text-white">
                                    Detalles
                                </th>
                                <th className="px-3 py-3 text-center text-xs font-bold text-white">
                                    Actividades
                                </th>
                                <th className="px-3 py-3 text-center text-xs font-bold text-white">
                                    Pasantes
                                </th>
                                <th className="px-3 py-3 text-center text-xs font-bold text-white">
                                    Estado
                                </th>
                                <th className="px-3 py-3 text-center text-xs font-bold text-white">
                                    Calificaciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredAndSorted.map((pasantia, index) => (
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
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
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
                                            className="text-primary-blue hover:text-primary-sky-blue"
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
                                                })
                                            }
                                            className="text-primary-blue hover:text-primary-sky-blue"
                                        >
                                            <Calendar size={18} />
                                        </button>
                                    </td>

                                    <td className="px-3 py-3 text-center">
                                        <button
                                            onClick={() =>
                                                setModalPasantes({
                                                    isOpen: true,
                                                    pasantiaId: pasantia.id,
                                                    pasantiaNombre:
                                                        pasantia.nombre,
                                                })
                                            }
                                            className="text-primary-blue hover:text-primary-sky-blue flex items-center justify-center gap-1 mx-auto"
                                        >
                                            <Users size={16} />
                                            <span className="text-sm">
                                                {pasantia.inscritos}
                                            </span>
                                        </button>
                                    </td>
                                    <td className="px-3 py-3 text-center">
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            <CheckCircle size={12} /> Finalizado
                                        </span>
                                    </td>
                                    <td className="px-3 py-3 text-center">
                                        <button
                                            onClick={() =>
                                                setModalCalificaciones({
                                                    isOpen: true,
                                                    pasantiaId: pasantia.id,
                                                    pasantiaNombre:
                                                        pasantia.nombre,
                                                    promedio:
                                                        pasantia.promedio_calificaciones,
                                                })
                                            }
                                            className="flex flex-col items-center gap-1 hover:opacity-80"
                                        >
                                            {renderStars(
                                                pasantia.promedio_calificaciones,
                                            )}
                                            <span className="text-xs text-gray-500">
                                                {pasantia.total_calificaciones}{" "}
                                                opiniones
                                            </span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <ModalDetallesPasantia
                isOpen={modalDetalles.isOpen}
                onClose={() =>
                    setModalDetalles({ isOpen: false, pasantia: null })
                }
                pasantia={modalDetalles.pasantia}
            />

            <ModalPasantesPromedio
                isOpen={modalPasantes.isOpen}
                onClose={() =>
                    setModalPasantes({
                        isOpen: false,
                        pasantiaId: null,
                        pasantiaNombre: null,
                    })
                }
                pasantiaId={modalPasantes.pasantiaId}
                pasantiaNombre={modalPasantes.pasantiaNombre}
            />

            <ModalCalificaciones
                isOpen={modalCalificaciones.isOpen}
                onClose={() =>
                    setModalCalificaciones({
                        isOpen: false,
                        pasantiaId: null,
                        pasantiaNombre: null,
                        promedio: null,
                    })
                }
                pasantiaId={modalCalificaciones.pasantiaId}
                pasantiaNombre={modalCalificaciones.pasantiaNombre}
                promedio={modalCalificaciones.promedio}
            />
            <ModalActividadesFinalizadas
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
            />
        </GerenteLayout>
    );
}
