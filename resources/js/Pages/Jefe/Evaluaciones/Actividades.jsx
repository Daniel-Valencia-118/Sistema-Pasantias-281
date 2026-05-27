import React, { useState } from "react";
import { Head, useForm } from "@inertiajs/react";
import DashboardLayout from "@/Components/Layout/DashboardLayout";
import Breadcrumbs from "@/Components/Breadcrumbs";
import DataTable from "@/Components/DataTable";
import Modal from "@/Components/Modal";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import InputLabel from "@/Components/InputLabel";
import InputError from "@/Components/InputError";
import TextArea from "@/Components/TextArea";
import SelectInput from "@/Components/SelectInput";
import { meses, formatDateToSpanish, getFechaStyle } from '@/Utils/dateUtils';
import BadgeFecha from '@/Components/BadgeFecha';
import axios from "axios";
import {
    PlusCircle,
    Eye,
    BarChart3,
    Calendar,
    Clock,
    UserCheck,
} from "lucide-react";

export default function Actividades({
    pasantia,
    actividades = [],
    pasantes = [],
    auth,
}) {
    const [modalAsignar, setModalAsignar] = useState(false);

    console.log(pasantia, actividades, pasantes);

    // Estados para los nuevos modales dinámicos
    const [modalDetalle, setModalDetalle] = useState(false);
    const [selectedActividad, setSelectedActividad] = useState(null);

    const [modalProgresos, setModalProgresos] = useState(false);
    const [progresosLista, setProgresosLista] = useState([]);

    const [loading, setLoading] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        id_pasante: "",
        id_actividad: "",
        descripcion: "",
    });

    // Acción 1: Cargar y ver el detalle de la actividad
    const abrirDetalle = async (id) => {
        setLoading(true);
        try {
            const response = await axios.get(
                route("jefe.actividades.detalle", id),
            );
            setSelectedActividad(response.data);
            setModalDetalle(true);
        } catch (error) {
            console.error("Error cargando detalles de la actividad", error);
        } finally {
            setLoading(false);
        }
    };

    // Acción 2: Cargar y ver los progresos de los pasantes
    const abrirProgresos = async (id) => {
        setLoading(true);
        try {
            const response = await axios.get(
                route("jefe.actividades.progresos", id),
            );
            // console.log(response);

            setProgresosLista(response.data);
            setModalProgresos(true);
        } catch (error) {
            console.error("Error cargando progresos", error);
        } finally {
            setLoading(false);
        }
    };

    const abrirAsignar = () => {
        reset();
        setModalAsignar(true);
    };

    const handleAsignar = (e) => {
        e.preventDefault();
        post(route("jefe.asignarActividad"), {
            onSuccess: () => {
                setModalAsignar(false);
                reset();
            },
        });
    };

    // Configuración de las columnas requeridas
    const columns = [
        {
            key: "nombre",
            label: "Actividad",
            sortable: true,
            render: (value) => (
                <span className="font-bold text-primary-navy">{value}</span>
            ),
        },
        {
            key: "tipo",
            label: "Tipo",
            sortable: true,
            align: "center",
            // Si es TECNICA mostrar badge azul, si es ADMINISTRATIVA mostrar badge verde
            render: (value) => {
                const colorBadge =
                    value === "TECNICA"
                        ? "bg-blue-50 text-primary-blue border-blue-200"
                        : "bg-emerald-50 text-emerald-600 border-emerald-200";
                return (
                    <span
                        className={`px-2.5 py-1 rounded-lg text-xs border inline-flex items-center gap-1 font-medium ${colorBadge}`}
                    >
                        {value}
                    </span>
                );
            },
        },
        { key: "fecha_ini", label: "Fecha Inicio", sortable: true, render: (value) => <BadgeFecha fecha={value} /> },
        { key: "fecha_fin", label: "Fecha Fin", sortable: true, render: (value) => <BadgeFecha fecha={value} />  },
        {
            key: "tiempo_restante",
            label: "Tiempo Restante / Estado",
            sortable: true,
            align: "center",
            render: (value) => {
                const esFinalizada = value === "Finalizada";
                const esHoy = value.includes("hoy");
                const colorBadge = esFinalizada
                    ? "bg-blue-100 text-slate-500 border-slate-200"
                    : esHoy
                      ? "bg-amber-50 text-amber-600 border-amber-200 font-bold"
                      : "bg-blue-50 text-primary-blue border-blue-200";
                return (
                    <span
                        className={`px-2.5 py-1 rounded-lg text-xs border inline-flex items-center gap-1 font-medium ${colorBadge}`}
                    >
                        <Clock size={12} /> {value}
                    </span>
                );
            },
        },
    ];

    const renderAcciones = (row) => (
        <div className="flex gap-2 justify-end">
            {/* Botón Acción 1: Ver Detalle */}
            <button
                onClick={() => abrirDetalle(row.id)}
                disabled={loading}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                title="Ver detalles de la actividad"
            >
                <Eye size={16} />
            </button>

            {/* Botón Acción 2: Ver Progresos */}
            <button
                onClick={() => abrirProgresos(row.id)}
                disabled={loading}
                className="p-2 text-primary-blue hover:bg-primary-blue/10 rounded-lg transition-all"
                title="Ver progresos de pasantes"
            >
                <BarChart3 size={16} />
            </button>
        </div>
    );

    return (
        <DashboardLayout auth={auth}>
            <Head title={`Actividades - ${pasantia.nombre}`} />

            <Breadcrumbs
                items={[
                    { label: "Inicio", url: route("jefe.dashboard") },
                    {
                        label: "Pasantías",
                        url: route("jefe.pasantias.tarjetas", {
                            origen: "actividades",
                        }),
                    },
                    { label: "Actividades" },
                ]}
            />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-black text-primary-navy uppercase">
                        {pasantia.nombre}
                    </h1>
                    <p className="text-slate-500">
                        Cronograma técnico y auditoría de avances por
                        asignación.
                    </p>
                </div>
                {/* <PrimaryButton onClick={abrirAsignar} className="gap-2 shrink-0">
                    <PlusCircle size={18} /> Asignar Actividad
                </PrimaryButton> */}
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-4">
                <DataTable
                    columns={columns}
                    data={actividades}
                    actionsRender={renderAcciones}
                    searchPlaceholder="Buscar por actividad o tipo..."
                />
            </div>

            {/* MODAL 1: VER DETALLE DE LA ACTIVIDAD */}
            <Modal
                show={modalDetalle}
                onClose={() => setModalDetalle(false)}
                title="Detalle Estructurado de Actividad"
                maxWidth="md"
            >
                {selectedActividad && (
                    <div className="space-y-4">
                        <div className="border-b border-slate-100 pb-3">
                            {/* <span className="text-[10px] font-bold text-primary-blue uppercase tracking-wider block">ID: #{selectedActividad.id_actividad}</span> */}
                            <h3 className="text-lg font-bold text-slate-800 uppercase">
                                {selectedActividad.nombre_act}
                            </h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                            <div>
                                <span className="font-bold text-slate-400 uppercase block">
                                    Clasificación / Tipo
                                </span>
                                <span className="font-semibold text-slate-700 mt-0.5 block">
                                    {selectedActividad.tipo}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-6 text-xs text-slate-600 bg-white border p-3 rounded-xl">
                            <div className="flex items-center gap-1.5">
                                <Calendar
                                    size={14}
                                    className="text-slate-400"
                                />
                                <div>
                                    <b className="text-slate-400 block uppercase text-[12px]">
                                        Inicio
                                    </b>{" "}
                                    {new Date(
                                        selectedActividad.fecha_ini,
                                    ).toLocaleDateString("es-ES")}
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Calendar
                                    size={14}
                                    className="text-slate-400"
                                />
                                <div>
                                    <b className="text-slate-400 block uppercase text-[12px]">
                                        Termina
                                    </b>{" "}
                                    {new Date(
                                        selectedActividad.fecha_fin,
                                    ).toLocaleDateString("es-ES")}
                                </div>
                            </div>
                        </div>

                        <div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                Descripción del Encargo
                            </span>
                            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-600 whitespace-pre-line leading-relaxed">
                                {selectedActividad.descripcion ||
                                    "Esta actividad no contiene una descripción detallada registrada."}
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <SecondaryButton
                                onClick={() => setModalDetalle(false)}
                            >
                                Cerrar Ventana
                            </SecondaryButton>
                        </div>
                    </div>
                )}
            </Modal>

            {/* MODAL 2: VER PROGRESOS EN ACTIVIDAD */}
            <Modal
                show={modalProgresos}
                onClose={() => setModalProgresos(false)}
                title="Seguimiento de Avances y Bitácoras"
                maxWidth="2xl"
            >
                <div className="space-y-4">
                    <p className="text-xs text-slate-500">
                        Listado exclusivo de pasantes que han reportado un
                        estado de avance o incremento en esta asignación.
                    </p>

                    {progresosLista.length === 0 ? (
                        <div className="text-center p-8 bg-slate-50 border border-dashed rounded-xl text-slate-400 text-sm">
                            Ningún pasante ha registrado hitos o avances en esta
                            actividad técnica todavía.
                        </div>
                    ) : (
                        <div className="overflow-x-auto border border-slate-100 rounded-xl">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-100">
                                    <tr>
                                        <th className="p-3">Pasante</th>
                                        <th className="p-3">
                                            Hito Reportado / Descripción
                                        </th>
                                        <th className="p-3 text-center">
                                            Progreso
                                        </th>
                                        <th className="p-3 text-center">
                                            Calificación Bitácora
                                        </th>
                                        <th className="p-3 text-right">
                                            Sincronización
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-600">
                                    {progresosLista.map((prog) => (
                                        <tr
                                            key={prog.id_progreso}
                                            className="hover:bg-slate-50/50 transition-colors"
                                        >
                                            <td className="p-3 font-bold text-primary-navy whitespace-nowrap">
                                                {prog.pasante}
                                            </td>
                                            <td
                                                className="p-3 max-w-xs truncate"
                                                title={prog.descripcion}
                                            >
                                                {prog.descripcion}
                                            </td>
                                            <td className="p-3 text-center">
                                                <span className="inline-block px-2 py-0.5 font-black bg-emerald-50 text-emerald-600 border border-emerald-100 rounded">
                                                    {prog.porcentaje}%
                                                </span>
                                            </td>
                                            <td className="p-3 text-center">
                                                {prog.nota_bitacora !== null ? (
                                                    <span className="font-bold text-primary-blue bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                                                        {prog.nota_bitacora} pts
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 italic">
                                                        Sin Bitácora
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-3 text-right text-slate-400 whitespace-nowrap">
                                                {prog.fecha_hora}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="flex justify-end pt-2">
                        <SecondaryButton
                            onClick={() => setModalProgresos(false)}
                        >
                            Cerrar Monitor
                        </SecondaryButton>
                    </div>
                </div>
            </Modal>

            {/* MODAL EXISTENTE: ASIGNAR ACTIVIDAD */}
            <Modal
                show={modalAsignar}
                onClose={() => setModalAsignar(false)}
                title="Asignar Actividad Técnica"
                maxWidth="lg"
            >
                <form onSubmit={handleAsignar} className="space-y-4">
                    <div>
                        <InputLabel
                            htmlFor="id_pasante"
                            value="Seleccionar Pasante Destinatario"
                        />
                        <SelectInput
                            id="id_pasante"
                            value={data.id_pasante}
                            onChange={(e) =>
                                setData("id_pasante", e.target.value)
                            }
                            className="w-full rounded-xl border-slate-200 mt-1"
                            required
                        >
                            <option value="">Seleccione pasante</option>
                            {pasantes.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.nombre}
                                </option>
                            ))}
                        </SelectInput>
                        <InputError message={errors.id_pasante} />
                    </div>
                    <div>
                        <InputLabel
                            htmlFor="id_actividad"
                            value="Vincular a Actividad del Programa"
                        />
                        <SelectInput
                            id="id_actividad"
                            value={data.id_actividad}
                            onChange={(e) =>
                                setData("id_actividad", e.target.value)
                            }
                            className="w-full rounded-xl border-slate-200 mt-1"
                            required
                        >
                            <option value="">Seleccione actividad</option>
                            {actividades.map((a) => (
                                <option key={a.id} value={a.id}>
                                    {a.nombre}
                                </option>
                            ))}
                        </SelectInput>
                        <InputError message={errors.id_actividad} />
                    </div>
                    <div>
                        <InputLabel
                            htmlFor="descripcion"
                            value="Instrucciones Particulares u Observaciones"
                        />
                        <TextArea
                            id="descripcion"
                            value={data.descripcion}
                            onChange={(e) =>
                                setData("descripcion", e.target.value)
                            }
                            rows="3"
                            className="w-full rounded-xl border-slate-200 mt-1"
                            required
                        />
                        <InputError message={errors.descripcion} />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <SecondaryButton
                            type="button"
                            onClick={() => setModalAsignar(false)}
                        >
                            Cancelar
                        </SecondaryButton>
                        <PrimaryButton type="submit" disabled={processing}>
                            Confirmar Asignación
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </DashboardLayout>
    );
}
