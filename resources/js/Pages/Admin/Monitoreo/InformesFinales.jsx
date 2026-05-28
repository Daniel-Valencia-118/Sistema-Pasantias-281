import React, { useState, useMemo } from "react";
import { Head, useForm, router } from "@inertiajs/react";
import DashboardLayout from "@/Components/Layout/DashboardLayout";
import Breadcrumbs from "@/Components/Breadcrumbs";
import DataTable from "@/Components/DataTable";
import Modal from "@/Components/Modal";
import ConfirmDialog from "@/Components/ConfirmDialog";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import TextInput from "@/Components/TextInput";
import InputLabel from "@/Components/InputLabel";
import InputError from "@/Components/InputError";
import { FileText, Edit3, Trash2 } from "lucide-react";

export default function InformesFinales({ informes, auth }) {
    const [showModal, setShowModal] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState({
        show: false,
        id: null,
    });
    const [showViewModal, setShowViewModal] = useState(false);
    const [viewTarget, setViewTarget] = useState(null);

    console.log(informes);

    const { data, setData, put, processing, errors, reset } = useForm({
        nota_final: "",
        promedio: "",
        nota_final: "",
        resultado: "",
    });

    const breadcrumbs = [
        { label: "Gestión académica", url: route("admin.informes.index") },
        { label: "Informes Finales" },
    ];

    const columns = [
        { key: "pasante_name", label: "Pasante" },
        { key: "promedio", label: "Promedio", align: "center" },
        { key: "nota_final", label: "Nota Final", align: "center" },
        {
            key: "resultado",
            label: "Resultado",
            render: (val) => (
                <span
                    className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                        val?.toLowerCase() === "aprobado"
                            ? "bg-green-50 text-green-700 border border-green-100"
                            : "bg-red-50 text-red-700 border border-red-100"
                    }`}
                >
                    {val}
                </span>
            ),
        },
        { key: "fecha_format", label: "Fecha" },
    ];

    const processedData = useMemo(() => {
        return informes.map((i) => {
            const pasanteUser = i.inscripcion?.pasante?.user;
            return {
                ...i,
                pasante_name: pasanteUser
                    ? `${pasanteUser.nombre} ${pasanteUser.ap_paterno}`.trim()
                    : "No asignado",
                fecha_format: i.fecha
                    ? new Date(i.fecha).toLocaleDateString()
                    : "S/F",
            };
        });
    }, [informes]);

    const openEditModal = (informe) => {
        setEditTarget(informe);
        setData({
            nota_final: informe.nota_final || "",
            promedio: informe.promedio || "",
            resultado: informe.resultado || "",
        });
        setShowModal(true);
    };

    const openViewModal = (informe) => {
        setViewTarget(informe);
        setShowViewModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route("admin.informes.update", editTarget.id_informe), {
            onSuccess: () => {
                setShowModal(false);
                reset();
            },
            preserveScroll: true,
        });
    };

    const handleDelete = (id) => setConfirmDelete({ show: true, id });

    const confirmDestroy = () => {
        if (confirmDelete.id) {
            router.delete(route("admin.informes.destroy", confirmDelete.id), {
                preserveScroll: true,
                onSuccess: () => setConfirmDelete({ show: false, id: null }),
            });
        }
    };

    return (
        <DashboardLayout auth={auth}>
            <Head title="Informes Finales" />
            {/* <Breadcrumbs items={breadcrumbs} /> */}

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <FileText className="text-blue-500" size={24} />
                    Informes Finales de Pasantía
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                    Supervisión y control de notas y actas académicas emitidas.
                </p>
            </div>

            <DataTable
                columns={columns}
                data={processedData}
                searchPlaceholder="Buscar por pasante o resultado..."
                actionsRender={(row) => (
                    <div className="flex items-center gap-1">
                        {/* Ver Informe Final: Abre el Modal que muestra a detalle promedio, resultado, fecha, id_inscripcion, idU_jefe -> nombre del Jefe evaluador */}
                        <button
                            onClick={() => openViewModal(row)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                            <FileText size={16} />
                        </button>
                        <button
                            onClick={() => openEditModal(row)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                            <Edit3 size={16} />
                        </button>
                        <button onClick={() => handleDelete(row.id_informe)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={16} />
                        </button>
                    </div>
                )}
            />

            {/* Modal de Modificación */}
            <Modal
                show={showModal}
                onClose={() => setShowModal(false)}
                title="Modificar Calificaciones de Informe"
            >
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <InputLabel
                                htmlFor="promedio"
                                value="Promedio Ponderado"
                            />
                            <TextInput
                                id="promedio"
                                type="number"
                                step="0.01"
                                value={data.promedio}
                                onChange={(e) =>
                                    setData("promedio", e.target.value)
                                }
                                className="w-full mt-1"
                                required
                            />
                            <InputError message={errors.promedio} />
                        </div>
                        <div>
                            <InputLabel
                                htmlFor="nota_final"
                                value="Nota Final Acta"
                            />
                            <TextInput
                                id="nota_final"
                                type="number"
                                value={data.nota_final}
                                onChange={(e) =>
                                    setData("nota_final", e.target.value)
                                }
                                className="w-full mt-1"
                                required
                            />
                            <InputError message={errors.nota_final} />
                        </div>
                        <div className="md:col-span-2">
                            <InputLabel
                                htmlFor="resultado"
                                value="Estado Resultante"
                            />
                            <select
                                id="resultado"
                                value={data.resultado}
                                onChange={(e) =>
                                    setData("resultado", e.target.value)
                                }
                                className="w-full mt-1 bg-white border border-slate-200 rounded-xl text-sm px-3 py-2.5 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 focus:outline-none transition-all shadow-sm"
                                required
                            >
                                <option value="">Seleccione una opción</option>
                                <option value="APROBADO">Aprobado</option>
                                <option value="REPROBADO">Reprobado</option>
                            </select>
                            <InputError message={errors.resultado} />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <SecondaryButton
                            type="button"
                            onClick={() => setShowModal(false)}
                        >
                            Cancelar
                        </SecondaryButton>
                        <PrimaryButton type="submit" disabled={processing}>
                            Guardar Cambios
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Modal de visualización del informe final del pasante */}
            <Modal
                show={showViewModal}
                onClose={() => setShowViewModal(false)}
                title="Detalles del Informe Final"
            >
                <div className="p-6 space-y-6 bg-slate-50/50">
                    {/* Sección Principal: Información del Pasante */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
                        <div className="space-y-1">
                            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400 block">
                                Pasante
                            </span>
                            <p className="text-lg font-bold text-slate-800">
                                {viewTarget?.inscripcion?.pasante?.user
                                    ? `${viewTarget.inscripcion.pasante.user.nombre} ${viewTarget.inscripcion.pasante.user.ap_paterno}`.trim()
                                    : "No asignado"}
                            </p>
                        </div>

                        {/* Badge de Resultado */}
                        <div className="text-right">
                            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400 block mb-1.5">
                                Resultado
                            </span>
                            <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide border ${
                                    viewTarget?.resultado?.toLowerCase() ===
                                    "aprobado"
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                        : "bg-rose-50 text-rose-700 border-rose-200"
                                }`}
                            >
                                <span
                                    className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                        viewTarget?.resultado?.toLowerCase() ===
                                        "aprobado"
                                            ? "bg-emerald-500"
                                            : "bg-rose-500"
                                    }`}
                                ></span>
                                {viewTarget?.resultado || "N/A"}
                            </span>
                        </div>
                    </div>

                    {/* Sección Secundaria: Calificaciones y Fechas en Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Promedio Ponderado */}
                        <div className="bg-white p-4 rounded-xl border border-slate-150 shadow-sm space-y-1">
                            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400 block">
                                Promedio Ponderado
                            </span>
                            <p className="text-2xl font-black text-slate-700">
                                {viewTarget?.promedio || "N/A"}
                            </p>
                        </div>

                        {/* Nota Final Acta */}
                        <div className="bg-white p-4 rounded-xl border border-slate-150 shadow-sm space-y-1">
                            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400 block">
                                Nota Final Acta
                            </span>
                            <p className="text-2xl font-black text-slate-700">
                                {viewTarget?.nota_final || "N/A"}
                            </p>
                        </div>

                        {/* Jefe Evaluador */}
                        <div className="bg-white p-4 rounded-xl border border-slate-150 shadow-sm space-y-1 md:col-span-1">
                            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400 block">
                                Jefe Evaluador
                            </span>
                            <p className="text-sm font-semibold text-slate-600 truncate">
                                {viewTarget?.jefe?.user
                                    ? `${viewTarget.jefe.user.nombre} ${viewTarget.jefe.user.ap_paterno}`.trim()
                                    : "No asignado"}
                            </p>
                        </div>

                        {/* Fecha de Registro */}
                        <div className="bg-white p-4 rounded-xl border border-slate-150 shadow-sm space-y-1 md:col-span-1">
                            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400 block">
                                Fecha de Registro
                            </span>
                            <p className="text-sm font-semibold text-slate-600">
                                {viewTarget?.fecha
                                    ? new Date(
                                          viewTarget.fecha,
                                      ).toLocaleDateString()
                                    : "S/F"}
                            </p>
                        </div>
                    </div>
                </div>
            </Modal>

            <ConfirmDialog
                show={confirmDelete.show}
                onClose={() => setConfirmDelete({ show: false, id: null })}
                onConfirm={confirmDestroy}
                title="Eliminar Informe Permanente"
                message="¿Estás completamente seguro de remover esta acta? Esta acción puede alterar los flujos de titulación o pasantía del alumno."
                confirmText="Eliminar de todos modos"
                type="danger"
            />
        </DashboardLayout>
    );
}
