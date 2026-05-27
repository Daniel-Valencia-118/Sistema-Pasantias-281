import React, { useState, useEffect } from "react";
import {
    X,
    Search,
    Eye,
    TrendingUp,
    TrendingDown,
    ClipboardList,
    Trophy,
    UserX,
    ChevronRight,
} from "lucide-react";
import axios from "axios";
import ModalPerfil from "./ModalPerfil";
import ModalActividadesEvaluadas from "./ModalActividadesEvaluadas";

export default function ModalPasantesPromedio({
    isOpen,
    onClose,
    pasantiaId,
    pasantiaNombre,
}) {
    const [inscritos, setInscritos] = useState([]);
    const [actividades, setActividades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const [modalPerfil, setModalPerfil] = useState({
        isOpen: false,
        usuario: null,
        tipo: "pasante",
    });

    const [modalActividades, setModalActividades] = useState({
        isOpen: false,
        pasante: null,
    });

    useEffect(() => {
        if (isOpen && pasantiaId) {
            cargarDatos();
        }
    }, [isOpen, pasantiaId]);

    const cargarDatos = async () => {
        setLoading(true);

        try {
            const response = await axios.get(
                `/gerente/pasantias/${pasantiaId}/pasantes-promedio`,
            );

            setInscritos(response.data.inscritos);
            setActividades(response.data.actividades || []);
        } catch (error) {
            console.error("Error:", error);
            alert("Error al cargar los datos");
        } finally {
            setLoading(false);
        }
    };

    const getPromedioDisplay = (inscrito) => {
        if (inscrito.abandono) {
            return (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold bg-orange-100 text-orange-800">
                    <TrendingDown size={14} />
                    Abandono
                </div>
            );
        }

        return (
            <div
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold ${inscrito.color_promedio}`}
            >
                <Trophy size={14} />
                {inscrito.promedio}/100
            </div>
        );
    };

    const filteredInscritos = inscritos.filter((i) => {
        const fullName =
            `${i.ap_paterno} ${i.ap_materno} ${i.nombre}`.toLowerCase();

        return fullName.includes(searchTerm.toLowerCase());
    });

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
                <div className="bg-white rounded-2xl border border-gray-200 max-w-7xl w-full overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary-navy to-primary-blue px-6 py-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-bold text-white">
                                    Pasantes Inscritos
                                </h3>

                                <p className="text-base text-white">
                                    {pasantiaNombre}
                                </p>
                            </div>

                            <button
                                onClick={onClose}
                                className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 text-white hover:bg-white/20"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Contenido */}
                    <div className="bg-gray-50 p-6 max-h-[70vh] overflow-y-auto">
                        {/* Buscador */}
                        <div className="mb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <h4 className="text-lg font-semibold text-gray-800">
                                    Promedio de Pasantes
                                </h4>

                                <p className="text-sm text-gray-500">
                                    Total registrados:{" "}
                                    <span className="font-semibold text-gray-700">
                                        {filteredInscritos.length}
                                    </span>
                                </p>
                            </div>

                            <div className="relative w-full md:w-96">
                                <Search
                                    size={18}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                />

                                <input
                                    type="text"
                                    placeholder="Buscar por nombre..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="pl-10 pr-4 py-3 w-full bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-blue"
                                />
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="w-12 h-12 border-4 border-gray-200 border-t-primary-blue rounded-full animate-spin"></div>

                                <p className="mt-4 text-gray-500 font-medium">
                                    Cargando pasantes...
                                </p>
                            </div>
                        ) : filteredInscritos.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                                    <UserX
                                        size={30}
                                        className="text-gray-400"
                                    />
                                </div>

                                <h4 className="text-lg font-semibold text-gray-700">
                                    No hay pasantes inscritos
                                </h4>

                                <p className="mt-2 text-sm text-gray-500">
                                    No existen registros disponibles para esta
                                    pasantía.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                                <div className="overflow-x-auto">
                                    <table className="w-full border-separate border-spacing-0">
                                        <thead>
                                            <tr className="bg-gradient-to-r from-primary-navy to-primary-slate">
                                                <th className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-white">
                                                    Nro
                                                </th>

                                                <th className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-white">
                                                    Apellido Paterno
                                                </th>

                                                <th className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-white">
                                                    Apellido Materno
                                                </th>

                                                <th className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-white">
                                                    Nombres
                                                </th>

                                                <th className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-white">
                                                    CI
                                                </th>

                                                <th className="px-4 py-4 text-center text-[11px] font-bold uppercase tracking-wider text-white">
                                                    Perfil
                                                </th>

                                                <th className="px-4 py-4 text-center text-[11px] font-bold uppercase tracking-wider text-white">
                                                    Jefe del Pasante
                                                </th>

                                                <th className="px-4 py-4 text-center text-[11px] font-bold uppercase tracking-wider text-white">
                                                    Actividades
                                                </th>

                                                <th className="px-4 py-4 text-center text-[11px] font-bold uppercase tracking-wider text-white">
                                                    Nota Final
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody className="bg-white">
                                            {filteredInscritos.map(
                                                (inscrito, index) => (
                                                    <tr
                                                        key={inscrito.id}
                                                        className="hover:bg-gray-50"
                                                    >
                                                        <td className="px-4 py-4 border-b border-gray-100">
                                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                                                                {index + 1}
                                                            </div>
                                                        </td>

                                                        <td className="px-4 py-4 text-sm font-medium text-gray-800 border-b border-gray-100">
                                                            {
                                                                inscrito.ap_paterno
                                                            }
                                                        </td>

                                                        <td className="px-4 py-4 text-sm font-medium text-gray-800 border-b border-gray-100">
                                                            {
                                                                inscrito.ap_materno
                                                            }
                                                        </td>

                                                        <td className="px-4 py-4 text-sm font-medium text-gray-800 border-b border-gray-100">
                                                            {inscrito.nombre}
                                                        </td>

                                                        <td className="px-4 py-4 text-sm text-gray-600 border-b border-gray-100">
                                                            {inscrito.ci}
                                                        </td>

                                                        <td className="px-4 py-4 text-center border-b border-gray-100">
                                                            <button
                                                                onClick={() =>
                                                                    setModalPerfil(
                                                                        {
                                                                            isOpen: true,
                                                                            usuario:
                                                                                inscrito,
                                                                            tipo: "pasante",
                                                                        },
                                                                    )
                                                                }
                                                                className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-blue-100 text-primary-blue hover:bg-blue-200 cursor-pointer"
                                                                title="Ver perfil"
                                                            >
                                                                <Eye
                                                                    size={20}
                                                                />
                                                            </button>
                                                        </td>

                                                        <td className="px-4 py-4 text-center border-b border-gray-100 ">
                                                            {inscrito.jefe ? (
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
                                                                    className="px-3 py-1.5 bg-blue-50 text-primary-blue rounded-lg text-base font-medium hover:bg-blue-100 cursor-pointer"
                                                                >
                                                                    {
                                                                        inscrito
                                                                            .jefe
                                                                            .ap_paterno
                                                                    }{" "}
                                                                    {
                                                                        inscrito
                                                                            .jefe
                                                                            .nombre
                                                                    }
                                                                </button>
                                                            ) : (
                                                                <span className="text-base text-gray-400">
                                                                    No tiene
                                                                </span>
                                                            )}
                                                        </td>

                                                        <td className="px-4 py-4 text-center border-b border-gray-100">
                                                            <button
                                                                onClick={() =>
                                                                    setModalActividades(
                                                                        {
                                                                            isOpen: true,
                                                                            pasante:
                                                                                inscrito,
                                                                        },
                                                                    )
                                                                }
                                                                className="group relative overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-semibold rounded-xl transition-all duration-300 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                                                            >
                                                                {/* Efecto de brillo en hover */}
                                                                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

                                                                <div className="relative flex items-center gap-3 px-5 py-2.5 ">
                                                                    {/* Icono con efecto */}
                                                                    <div className="p-1 bg-white/20 rounded-lg group-hover:rotate-12 transition-transform duration-300 ">
                                                                        <ClipboardList
                                                                            size={
                                                                                16
                                                                            }
                                                                            className="text-white"
                                                                        />
                                                                    </div>

                                                                    {/* Texto */}
                                                                    <div className="text-left cursor-pointer">
                                                                        <p className="text-[10px] text-white/70 uppercase tracking-wider">
                                                                            Evaluación
                                                                        </p>
                                                                        <p className="text-sm font-bold leading-tight">
                                                                            de
                                                                            Actividades
                                                                        </p>
                                                                    </div>

                                                                    {/* Flecha decorativa */}
                                                                    <ChevronRight
                                                                        size={
                                                                            18
                                                                        }
                                                                        className="ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300"
                                                                    />
                                                                </div>
                                                            </button>
                                                        </td>

                                                        <td className="px-4 py-4 text-center border-b border-gray-100">
                                                            {getPromedioDisplay(
                                                                inscrito,
                                                            )}
                                                        </td>
                                                    </tr>
                                                ),
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between px-6 py-4 border-t bg-white">
                        <div className="text-sm text-gray-500">
                            Mostrando{" "}
                            <span className="font-semibold text-gray-700">
                                {filteredInscritos.length}
                            </span>{" "}
                            registros
                        </div>

                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 bg-gray-600 text-white text-sm font-semibold rounded-xl hover:bg-gray-700"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal Perfil */}
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

            {/* Modal Actividades */}
            <ModalActividadesEvaluadas
                isOpen={modalActividades.isOpen}
                onClose={() =>
                    setModalActividades({
                        isOpen: false,
                        pasante: null,
                    })
                }
                pasante={modalActividades.pasante}
                actividades={actividades.map((act) => ({
                    ...act,

                    evaluacion:
                        modalActividades.pasante?.evaluaciones?.find(
                            (e) => e.id_actividad === act.id,
                        )?.evaluacion || null,
                }))}
            />
        </>
    );
}
