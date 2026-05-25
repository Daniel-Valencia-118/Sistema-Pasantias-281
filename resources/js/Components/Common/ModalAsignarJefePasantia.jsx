import React, { useState, useEffect } from "react";
import { X, Search, Eye, UserPlus } from "lucide-react";
import axios from "axios";
import ModalConfirmacion from "./ModalConfirmacion";
import ModalPerfil from "./ModalPerfil";

export default function ModalAsignarJefePasantia({
    isOpen,
    onClose,
    pasantiaId,
    onAsignado,
}) {
    const [jefes, setJefes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [modalConfirm, setModalConfirm] = useState({
        isOpen: false,
        jefe: null,
    });
    const [modalPerfil, setModalPerfil] = useState({
        isOpen: false,
        usuario: null,
    });

    useEffect(() => {
        if (isOpen) {
            cargarJefes();
        }
    }, [isOpen]);

    const cargarJefes = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                "/gerente/pasantias/jefes-disponibles",
            );
            setJefes(response.data.jefes);
        } catch (error) {
            console.error("Error:", error);
            alert("Error al cargar los jefes");
        } finally {
            setLoading(false);
        }
    };

    const handleAsignar = (jefe) => {
        setModalConfirm({ isOpen: true, jefe: jefe });
    };

    const confirmAsignar = async () => {
        try {
            const response = await axios.patch(
                `/gerente/pasantias/${pasantiaId}/asignar-jefe-pasantia`,
                {
                    idU_jefe: modalConfirm.jefe.id,
                },
            );
            if (response.data.message && onAsignado) {
                onAsignado(response.data.jefe);
            }
            setModalConfirm({ isOpen: false, jefe: null });
            onClose();
        } catch (error) {
            alert(error.response?.data?.message || "Error al asignar jefe");
        }
    };

    const filteredJefes = jefes.filter((j) => {
        const fullName =
            `${j.ap_paterno} ${j.ap_materno} ${j.nombre}`.toLowerCase();
        return fullName.includes(searchTerm.toLowerCase());
    });

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary-navy to-primary-blue px-6 py-4 rounded-t-xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-white">
                                    Asignar Jefe Responsable
                                </h3>
                                <p className="text-primary-sky-blue text-sm">
                                    Seleccione un jefe de pasante para esta
                                    pasantía
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
                    <div className="p-6 max-h-[60vh] overflow-y-auto">
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
                                Cargando jefes...
                            </div>
                        ) : filteredJefes.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                No hay jefes disponibles
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
                                                Acción
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {filteredJefes.map((jefe, index) => (
                                            <tr
                                                key={jefe.id}
                                                className="hover:bg-gray-50"
                                            >
                                                <td className="px-3 py-3 text-gray-500">
                                                    {index + 1}
                                                </td>
                                                <td className="px-3 py-3 text-gray-900">
                                                    {jefe.ap_paterno}
                                                </td>
                                                <td className="px-3 py-3 text-gray-900">
                                                    {jefe.ap_materno}
                                                </td>
                                                <td className="px-3 py-3 text-gray-900">
                                                    {jefe.nombre}
                                                </td>
                                                <td className="px-3 py-3 text-gray-600">
                                                    {jefe.ci}
                                                </td>
                                                <td className="px-3 py-3 text-center">
                                                    <button
                                                        onClick={() =>
                                                            setModalPerfil({
                                                                isOpen: true,
                                                                usuario: jefe,
                                                            })
                                                        }
                                                        className="text-primary-blue hover:text-primary-sky-blue transition-all"
                                                        title="Ver perfil"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                </td>
                                                <td className="px-3 py-3 text-center">
                                                    <button
                                                        onClick={() =>
                                                            handleAsignar(jefe)
                                                        }
                                                        className="flex items-center gap-1 px-3 py-1 bg-primary-blue text-white text-xs rounded hover:bg-primary-sky-blue transition-all"
                                                    >
                                                        <UserPlus size={14} />
                                                        ASIGNAR
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
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
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal de confirmación */}
            <ModalConfirmacion
                isOpen={modalConfirm.isOpen}
                onClose={() => setModalConfirm({ isOpen: false, jefe: null })}
                onConfirm={confirmAsignar}
                titulo="Asignar Jefe a Pasantía"
                mensaje={`¿Estás seguro de asignar a ${modalConfirm.jefe?.nombre} ${modalConfirm.jefe?.ap_paterno} como jefe responsable de esta pasantía?`}
                type="info"
                confirmText="Asignar"
            />

            {/* Modal de perfil */}
            <ModalPerfil
                isOpen={modalPerfil.isOpen}
                onClose={() => setModalPerfil({ isOpen: false, usuario: null })}
                usuario={modalPerfil.usuario}
                tipo="jefe"
                readOnly={true}
            />
        </>
    );
}
