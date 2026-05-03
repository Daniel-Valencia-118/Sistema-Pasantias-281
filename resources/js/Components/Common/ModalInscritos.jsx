import React, { useState, useEffect } from "react";
import {
    X,
    Search,
    Eye,
    UserCheck,
    UserX,
    ChevronUp,
    ChevronDown,
    ArrowUpDown,
} from "lucide-react";
import axios from "axios";
import ModalConfirmacion from "./ModalConfirmacion";
import ModalPerfil from "./ModalPerfil";
import ModalAsignarJefe from "./ModalAsignarJefe";

export default function ModalInscritos({
    isOpen,
    onClose,
    pasantiaId,
    readOnly,
    pasantiaNombre,
}) {
    const [inscritos, setInscritos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortField, setSortField] = useState("ap_paterno");
    const [sortDirection, setSortDirection] = useState("asc");
    const [modalPerfil, setModalPerfil] = useState({
        isOpen: false,
        usuario: null,
        tipo: "pasante",
    });
    const [modalAsignar, setModalAsignar] = useState({
        isOpen: false,
        pasante: null,
    });
    const [modalConfirm, setModalConfirm] = useState({
        isOpen: false,
        accion: null,
        pasante: null,
    });

    useEffect(() => {
        if (isOpen && pasantiaId) {
            cargarInscritos();
        }
    }, [isOpen, pasantiaId]);

    const cargarInscritos = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                `/gerente/pasantias/${pasantiaId}/inscritos`,
            );
            setInscritos(response.data.inscritos);
        } catch (error) {
            console.error("Error:", error);
            alert("Error al cargar los inscritos");
        } finally {
            setLoading(false);
        }
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

    const handleAsignarJefe = (pasante) => {
        setModalAsignar({ isOpen: true, pasante: pasante });
    };

    const handleDesignarJefe = (pasante) => {
        setModalConfirm({ isOpen: true, accion: "designar", pasante: pasante });
    };

    const confirmDesignar = async () => {
        try {
            await axios.patch(
                `/gerente/pasantias/${pasantiaId}/designar-jefe/${modalConfirm.pasante.idU_pasante}`,
            );
            await cargarInscritos();
            setModalConfirm({ isOpen: false, accion: null, pasante: null });
        } catch (error) {
            alert(error.response?.data?.message || "Error al desasignar jefe");
        }
    };

    const formatFecha = (date) => {
        if (!date) return "-";
        return date.split("-").reverse().join("/");
    };

    const filteredAndSorted = [...inscritos]
        .filter((i) => {
            const fullName =
                `${i.ap_paterno} ${i.ap_materno} ${i.nombre}`.toLowerCase();
            return fullName.includes(searchTerm.toLowerCase());
        })
        .sort((a, b) => {
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

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="bg-white rounded-xl shadow-2xl max-w-7xl w-full mx-4 my-8">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary-navy to-primary-blue px-6 py-4 rounded-t-xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-white">
                                    Pasantes Inscritos
                                </h3>
                                <p className="text-primary-sky-blue text-sm">
                                    {pasantiaNombre}
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Contenido */}
                    <div className="p-6 max-h-[70vh] overflow-y-auto">
                        {/* Buscador */}
                        <div className="mb-4">
                            <div className="relative w-80">
                                <Search
                                    size={18}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                />
                                <input
                                    type="text"
                                    placeholder="Buscar por apellido o nombre..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20"
                                />
                            </div>
                        </div>

                        {loading ? (
                            <div className="text-center py-12 text-gray-500">
                                Cargando inscritos...
                            </div>
                        ) : filteredAndSorted.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                No hay pasantes inscritos
                            </div>
                        ) : (
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
                                                    handleSort("ap_paterno")
                                                }
                                            >
                                                <div className="flex items-center gap-1">
                                                    Apellido Paterno{" "}
                                                    <SortIcon field="ap_paterno" />
                                                </div>
                                            </th>
                                            <th
                                                className="px-3 py-3 text-left text-xs font-bold text-white cursor-pointer hover:bg-white/10"
                                                onClick={() =>
                                                    handleSort("ap_materno")
                                                }
                                            >
                                                <div className="flex items-center gap-1">
                                                    Apellido Materno{" "}
                                                    <SortIcon field="ap_materno" />
                                                </div>
                                            </th>
                                            <th
                                                className="px-3 py-3 text-left text-xs font-bold text-white cursor-pointer hover:bg-white/10"
                                                onClick={() =>
                                                    handleSort("nombre")
                                                }
                                            >
                                                <div className="flex items-center gap-1">
                                                    Nombres{" "}
                                                    <SortIcon field="nombre" />
                                                </div>
                                            </th>
                                            <th
                                                className="px-3 py-3 text-left text-xs font-bold text-white cursor-pointer hover:bg-white/10"
                                                onClick={() => handleSort("ci")}
                                            >
                                                <div className="flex items-center gap-1">
                                                    CI <SortIcon field="ci" />
                                                </div>
                                            </th>
                                            <th className="px-3 py-3 text-center text-xs font-bold text-white">
                                                Perfil
                                            </th>
                                            <th className="px-3 py-3 text-left text-xs font-bold text-white">
                                                Fec. Inscripción
                                            </th>
                                            <th className="px-3 py-3 text-left text-xs font-bold text-white">
                                                Hora Inscripción
                                            </th>
                                            <th className="px-3 py-3 text-center text-xs font-bold text-white">
                                                Jefe de Pasante
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {filteredAndSorted.map(
                                            (inscrito, index) => (
                                                <tr
                                                    key={inscrito.id}
                                                    className="hover:bg-gray-50"
                                                >
                                                    <td className="px-3 py-3 text-gray-500">
                                                        {index + 1}
                                                    </td>
                                                    <td className="px-3 py-3 text-gray-900">
                                                        {inscrito.ap_paterno}
                                                    </td>
                                                    <td className="px-3 py-3 text-gray-900">
                                                        {inscrito.ap_materno}
                                                    </td>
                                                    <td className="px-3 py-3 text-gray-900">
                                                        {inscrito.nombre}
                                                    </td>
                                                    <td className="px-3 py-3 text-gray-600">
                                                        {inscrito.ci}
                                                    </td>
                                                    <td className="px-3 py-3 text-center">
                                                        <button
                                                            onClick={() =>
                                                                setModalPerfil({
                                                                    isOpen: true,
                                                                    usuario:
                                                                        inscrito,
                                                                    tipo: "pasante",
                                                                })
                                                            }
                                                            className="text-primary-blue hover:text-primary-sky-blue transition-all"
                                                            title="Ver perfil"
                                                        >
                                                            <Eye size={18} />
                                                        </button>
                                                    </td>
                                                    <td className="px-3 py-3 text-gray-600">
                                                        {formatFecha(
                                                            inscrito.fecha_insc,
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-3 text-gray-600">
                                                        {inscrito.hora_insc ||
                                                            "-"}
                                                    </td>
                                                    <td className="px-3 py-3 text-center">
                                                        {inscrito.jefe ? (
                                                            <div className="flex items-center justify-center gap-2">
                                                                <button
                                                                    onClick={() =>
                                                                        setModalPerfil(
                                                                            {
                                                                                isOpen: true,
                                                                                usuario:
                                                                                    inscrito.jefe,
                                                                                tipo: "jefe",
                                                                            },
                                                                        )
                                                                    }
                                                                    className="text-primary-blue hover:text-primary-sky-blue transition-all"
                                                                    title="Ver perfil del jefe"
                                                                >
                                                                    <Eye
                                                                        size={
                                                                            16
                                                                        }
                                                                    />
                                                                </button>
                                                                <button
                                                                    onClick={() =>
                                                                        handleDesignarJefe(
                                                                            inscrito,
                                                                        )
                                                                    }
                                                                    className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-all"
                                                                    title="Desasignar jefe"
                                                                >
                                                                    DESIGNAR
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() =>
                                                                    handleAsignarJefe(
                                                                        inscrito,
                                                                    )
                                                                }
                                                                className="px-2 py-1 bg-primary-blue text-white text-xs rounded hover:bg-primary-sky-blue transition-all"
                                                            >
                                                                ASIGNAR
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ),
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end p-4 border-t bg-gray-50 rounded-b-xl">
                        <button
                            onClick={onClose}
                            className="px-5 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal de perfil (reutilizable) */}
            <ModalPerfil
                isOpen={modalPerfil.isOpen}
                onClose={() =>
                    setModalPerfil({
                        isOpen: false,
                        usuario: null,
                        tipo: "pasante",
                    })
                }
                usuario={modalPerfil.usuario}
                tipo={modalPerfil.tipo}
                readOnly={true}
            />

            {/* Modal para asignar jefe */}
            <ModalAsignarJefe
                isOpen={modalAsignar.isOpen}
                onClose={() =>
                    setModalAsignar({ isOpen: false, pasante: null })
                }
                pasante={modalAsignar.pasante}
                pasantiaId={pasantiaId}
                onAsignado={() => {
                    cargarInscritos();
                    setModalAsignar({ isOpen: false, pasante: null });
                }}
            />

            {/* Modal de confirmación para designar */}
            <ModalConfirmacion
                isOpen={modalConfirm.isOpen}
                onClose={() =>
                    setModalConfirm({
                        isOpen: false,
                        accion: null,
                        pasante: null,
                    })
                }
                onConfirm={confirmDesignar}
                titulo="Desasignar Jefe"
                mensaje={`¿Estás seguro de desasignar al jefe de ${modalConfirm.pasante?.nombre} ${modalConfirm.pasante?.ap_paterno}?`}
                type="danger"
                confirmText="Designar"
            />
        </>
    );
}
