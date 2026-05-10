import React, { useState, useEffect } from "react";
import { X, Search, Eye, TrendingUp, TrendingDown } from "lucide-react";
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
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold bg-orange-100 text-orange-800 border-orange-200">
                    Abandono
                </div>
            );
        }
        return (
            <div
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${inscrito.color_promedio}`}
            >
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
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full mx-4 my-8">
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
                                className="text-white hover:bg-white/20 p-2 rounded-lg"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

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
                                    placeholder="Buscar por nombre..."
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
                                Cargando pasantes...
                            </div>
                        ) : filteredInscritos.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                No hay pasantes inscritos
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500">
                                                Nro
                                            </th>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500">
                                                Apellido Paterno
                                            </th>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500">
                                                Apellido Materno
                                            </th>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500">
                                                Nombres
                                            </th>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500">
                                                CI
                                            </th>
                                            <th className="px-3 py-3 text-center text-xs font-medium text-gray-500">
                                                Perfil
                                            </th>
                                            <th className="px-3 py-3 text-center text-xs font-medium text-gray-500">
                                                Jefe del Pasante
                                            </th>
                                            <th className="px-3 py-3 text-center text-xs font-medium text-gray-500">
                                                Actividades
                                            </th>
                                            <th className="px-3 py-3 text-center text-xs font-medium text-gray-500">
                                                Nota Final
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {filteredInscritos.map(
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
                                                            className="text-primary-blue hover:text-primary-sky-blue"
                                                            title="Ver perfil"
                                                        >
                                                            <Eye size={18} />
                                                        </button>
                                                    </td>
                                                    <td className="px-3 py-3 text-center">
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
                                                                className="text-primary-blue hover:text-primary-sky-blue text-sm"
                                                            >
                                                                {
                                                                    inscrito
                                                                        .jefe
                                                                        .ap_paterno
                                                                }{" "}
                                                                {
                                                                    inscrito
                                                                        .jefe
                                                                        .ap_materno
                                                                }{" "}
                                                                {
                                                                    inscrito
                                                                        .jefe
                                                                        .nombre
                                                                }
                                                            </button>
                                                        ) : (
                                                            <span className="text-gray-400 text-xs">
                                                                No tiene
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-3 text-center">
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
                                                            className="px-2 py-1 bg-primary-blue text-white text-xs rounded hover:bg-primary-sky-blue"
                                                        >
                                                            Ver
                                                        </button>
                                                    </td>
                                                    <td className="px-3 py-3 text-center">
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
                        )}
                    </div>

                    <div className="flex justify-end p-4 border-t bg-gray-50 rounded-b-xl">
                        <button
                            onClick={onClose}
                            className="px-5 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>

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

            <ModalActividadesEvaluadas
                isOpen={modalActividades.isOpen}
                onClose={() =>
                    setModalActividades({ isOpen: false, pasante: null })
                }
                pasante={modalActividades.pasante}
                actividades={actividades.map((act) => ({
                    ...act,
                    // Asegurar que la evaluación tiene todos los campos
                    evaluacion:
                        modalActividades.pasante?.evaluaciones?.find(
                            (e) => e.id_actividad === act.id,
                        )?.evaluacion || null,
                }))}
            />
        </>
    );
}
