// resources/js/Pages/Admin/Pasantias/Publicadas.jsx
import React, { useState, useMemo } from "react";
import { Head, useForm, router, Link } from "@inertiajs/react";
import DashboardLayout from "@/Components/Layout/DashboardLayout";
import Breadcrumbs from "@/Components/Breadcrumbs";
import DataTable from "@/Components/DataTable";
import Modal from "@/Components/Modal";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import TextInput from "@/Components/TextInput";
import InputLabel from "@/Components/InputLabel";
import InputError from "@/Components/InputError";
import SelectInput from "@/Components/SelectInput";
import ProgressBar from "@/Components/ProgressBar";
import {
    Search,
    Edit,
    Eye,
    Plus,
    Calendar,
    Users,
    Clock,
    Building2,
    Briefcase,
    ExternalLink,
    MapPin,
} from "lucide-react";

export default function Publicadas({ pasantias = [], empresas = [], auth }) {
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [SelectInputedPas, setSelectedPas] = useState(null);
    const [editMode, setEditMode] = useState(false);

    console.log(pasantias, empresas);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        id_pasantia: "",
        nombre_pas: "",
        mencion: "",
        fecha_ini: "",
        fecha_fin: "",
        cupos: "",
        carga_horaria: "",
        turno: "",
        id_empresa: "",
        estado: "ABIERTA",
    });

    const columns = [
        { key: "nombre_pas", sortable: true, label: "Título de la Pasantía" },
        { key: "empresa_nombre", sortable: true, label: "Empresa" },
        {
            key: "cupos_info",
            label: "Cupos (Disp/Total)",
            sortable: true,
            render: (val, row) => {
                const total = row?.cupos || 0;
                const disponibles = row?.cupos_disponibles || 0;
                const inscritos = total - disponibles;

                // Porcentaje de llenado (inscritos)
                const porcentajeInscritos =
                    total > 0 ? (inscritos / total) * 100 : 0;

                // Porcentaje de disponibilidad para la lógica de colores
                const porcentajeDisp = total > 0 ? disponibles / total : 0;

                // Determinar color según disponibilidad restante
                let colorBarra = "bg-rose-500"; // Menos del 20% disponible (Casi lleno)
                if (porcentajeDisp > 0.5) {
                    colorBarra = "bg-emerald-500"; // Más del 50% disponible (Vacío)
                } else if (porcentajeDisp > 0.2) {
                    colorBarra = "bg-yellow-500"; // Entre 20% y 50% disponible
                }

                return (
                    <div className="flex flex-col w-full text-sm text-gray-700 font-medium">
                        {/* Texto informativo superior */}
                        <div className="flex justify-between items-center mb-1">
                            <span>
                                {disponibles} / {total}
                            </span>
                            <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">
                                {porcentajeInscritos.toFixed(0)}%
                            </span>
                        </div>

                        <span className="text-xs text-gray-400 font-normal">
                            Inscritos en la pasantía
                        </span>

                        {/* Contenedor de la barra de progreso de inscritos */}
                        <div className="w-full h-2 rounded-full bg-gray-200 mt-1 overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-300 ${colorBarra}`}
                                style={{ width: `${porcentajeInscritos}%` }}
                            />
                        </div>
                    </div>
                );
            },
        },
        {
            key: "turno",
            label: "Turno",
            sortable: true,
            render: (val) => <span className="capitalize">{val}</span>,
        },
        {
            key: "estado",
            label: "Estado",
            sortable: true,
            render: (val) => (
                <span
                    className={`px-2 py-1 text-xs font-bold rounded-full uppercase ${
                        val === "INICIADO"
                            ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                            : val === "ABIERTA"
                              ? "bg-blue-50 text-blue-600 border-blue-200"
                              : val === "CERRADA"
                                ? "bg-rose-50 text-rose-600 border-rose-200"
                                : val === "FINALIZADO"
                                  ? "bg-purple-50 text-purple-600 border-purple-200"
                                  : ""
                    }`}
                >
                    {val}
                </span>
            ),
        },
    ];

    const processedData = useMemo(() => {
        return pasantias.map((p) => ({
            ...p,
            empresa_nombre: p.empresa?.nombre || "No asignada",
            fecha_ini_fmt: p.fecha_ini ? p.fecha_ini.split("T")[0] : "",
            fecha_fin_fmt: p.fecha_fin ? p.fecha_fin.split("T")[0] : "",
        }));
    }, [pasantias]);

    const filteredData = useMemo(() => {
        const s = search.toLowerCase();
        return processedData.filter(
            (p) =>
                p.nombre_pas.toLowerCase().includes(s) ||
                p.empresa_nombre.toLowerCase().includes(s) ||
                p.mencion.toLowerCase().includes(s),
        );
    }, [processedData, search]);

    const openCreateModal = () => {
        setEditMode(false);
        reset();
        setShowModal(true);
    };

    const openEditModal = (pas) => {
        setEditMode(true);
        setData({
            id_pasantia: pas.id_pasantia,
            nombre_pas: pas.nombre_pas,
            mencion: pas.mencion,
            fecha_ini: pas.fecha_ini_fmt,
            fecha_fin: pas.fecha_fin_fmt,
            cupos: pas.cupos,
            carga_horaria: pas.carga_horaria,
            turno: pas.turno,
            id_empresa: pas.id_empresa,
            estado: pas.estado,
        });
        setShowModal(true);
    };

    const openViewModal = (pas) => {
        setSelectedPas(pas);
        setShowViewModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editMode) {
            put(route("admin.pasantias.update", data.id_pasantia), {
                onSuccess: () => setShowModal(false),
            });
        } else {
            post(route("admin.pasantias.store"), {
                onSuccess: () => setShowModal(false),
            });
        }
    };

    return (
        <DashboardLayout auth={auth}>
            <Head title="Pasantías Publicadas" />

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-primary-navy">
                        Pasantías Publicadas
                    </h1>
                    <p className="text-sm text-gray-500">
                        Gestión de ofertas académicas para pasantes.
                    </p>
                </div>
                {/* <PrimaryButton onClick={openCreateModal}>
                    <Plus className="h-4 w-4 mr-2" /> Publicar Pasantía
                </PrimaryButton> */}
            </div>

            <div className="mb-4 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    placeholder="Buscar por título, empresa o mención..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <DataTable
                columns={columns}
                data={filteredData}
                actionsRender={(row) => (
                    <div className="flex items-center gap-2">
                        {/* BOTÓN VER PASANTÍA */}
                        <button
                            onClick={() => openViewModal(row)}
                            className="text-amber-600 hover:text-amber-800 p-2 rounded-lg hover:bg-amber-50"
                            title="Ver detalles"
                        >
                            <Eye className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => openEditModal(row)}
                            className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50"
                            title="Editar"
                        >
                            <Edit className="h-5 w-5" />
                        </button>
                    </div>
                )}
            />

            {/* MODAL DE EDICIÓN / CREACIÓN */}
            <Modal
                show={showModal}
                onClose={() => setShowModal(false)}
                title={
                    editMode ? "Editar Oferta de Pasantía" : "Nueva Publicación"
                }
                maxWidth="4xl"
            >
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* SECCIÓN EMPRESA (CON REDIRECCIÓN) */}
                        <div className="md:col-span-2 bg-blue-50 p-4 rounded-lg border border-blue-100">
                            <div className="flex justify-between items-center mb-2">
                                <InputLabel
                                    value="Empresa Solicitante"
                                    className="text-blue-800"
                                />
                                <Link
                                    href={route("admin.empresas")}
                                    className="text-xs flex items-center text-blue-600 hover:underline font-bold"
                                >
                                    <ExternalLink className="h-3 w-3 mr-1" />{" "}
                                    Gestionar Empresas
                                </Link>
                            </div>
                            {/* <SelectInput 
                                className="w-full border-gray-300 rounded-md text-sm"
                                value={data.id_empresa}
                                onChange={e => setData('id_empresa', e.target.value)}
                                required
                            >
                                <option value="">Seleccione la empresa...</option>
                                {empresas.map(emp => (
                                    <option key={emp.id_empresa} value={emp.id_empresa}>{emp.nombre}</option>
                                ))}
                            </SelectInput> */}
                            <InputError message={errors.id_empresa} />
                        </div>

                        <div className="md:col-span-2">
                            <InputLabel value="Título de la Pasantía" />
                            <TextInput
                                value={data.nombre_pas}
                                onChange={(e) =>
                                    setData("nombre_pas", e.target.value)
                                }
                                className="w-full"
                                required
                            />
                            <InputError message={errors.nombre_pas} />
                        </div>

                        <div>
                            <InputLabel value="Mención Sugerida" />
                            <SelectInput
                                className="w-full border-gray-300 rounded-md text-sm"
                                value={data.mencion}
                                onChange={(e) =>
                                    setData("mencion", e.target.value)
                                }
                                required
                            >
                                <option value="">Seleccione mención...</option>
                                <option value="Desarrollo de Software e Innovación Tecnológica">
                                    Desarrollo de Software e Innovación
                                    Tecnológica
                                </option>
                                <option value="Inteligencia Artificial y Ciencias de Datos">
                                    Inteligencia Artificial y Ciencias de Datos
                                </option>
                                <option value="Ciencias de la Computación">
                                    Ciencias de la Computación
                                </option>
                                <option value="Informática Industrial">
                                    Informática Industrial
                                </option>
                                <option value="Ingeniería de Sistemas">
                                    Ingeniería de Sistemas
                                </option>
                                <option value="Redes y TIC">Redes y TIC</option>
                                <option value="Seguridad de la Información">
                                    Seguridad de la Información
                                </option>
                            </SelectInput>
                        </div>

                        <div>
                            <InputLabel value="Turno" />
                            <SelectInput
                                className="w-full border-gray-300 rounded-md text-sm"
                                value={data.turno}
                                onChange={(e) =>
                                    setData("turno", e.target.value)
                                }
                                required
                            >
                                <option value="">Seleccione turno...</option>
                                <option value="Mañana">Mañana</option>
                                <option value="Tarde">Tarde</option>
                                <option value="Noche">Noche</option>
                                <option value="Tiempo Completo">
                                    Tiempo Completo
                                </option>
                                <option value="Medio Tiempo">
                                    Medio Tiempo
                                </option>
                            </SelectInput>
                        </div>

                        <div>
                            <InputLabel value="Fecha Inicio" />
                            <TextInput
                                type="date"
                                value={data.fecha_ini}
                                onChange={(e) =>
                                    setData("fecha_ini", e.target.value)
                                }
                                className="w-full"
                                required
                            />
                        </div>

                        <div>
                            <InputLabel value="Fecha Fin Estimada" />
                            <TextInput
                                type="date"
                                value={data.fecha_fin}
                                onChange={(e) =>
                                    setData("fecha_fin", e.target.value)
                                }
                                className="w-full"
                                required
                            />
                        </div>

                        <div>
                            <InputLabel value="Total de Cupos" />
                            <TextInput
                                type="number"
                                value={data.cupos}
                                onChange={(e) =>
                                    setData("cupos", e.target.value)
                                }
                                className="w-full"
                                required
                            />
                        </div>

                        {/* estado */}
                        <div>
                            <InputLabel value="Estado" />
                            <SelectInput
                                className="w-full border-gray-300 rounded-md text-sm"
                                value={data.estado}
                                onChange={(e) =>
                                    setData("estado", e.target.value)
                                }
                                required
                            >
                                <option value="">Seleccione estado...</option>
                                <option value="INICIADO">Iniciado</option>
                                <option value="ABIERTA">Abierta</option>
                                <option value="FINALIZADO">Finalizado</option>
                            </SelectInput>
                        </div>

                        <div>
                            <InputLabel value="Carga Horaria (Hrs/Semana)" />
                            <TextInput
                                type="number"
                                value={data.carga_horaria}
                                onChange={(e) =>
                                    setData("carga_horaria", e.target.value)
                                }
                                className="w-full"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t">
                        <SecondaryButton
                            type="button"
                            onClick={() => setShowModal(false)}
                        >
                            Cancelar
                        </SecondaryButton>
                        <PrimaryButton disabled={processing}>
                            {editMode ? "Actualizar" : "Publicar"}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* MODAL DE VISTA DE DETALLE */}
            <Modal
                show={showViewModal}
                onClose={() => setShowViewModal(false)}
                title="Detalle de la Pasantía"
                maxWidth="2xl"
            >
                <div className="p-6">
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-primary-navy">
                                {SelectInputedPas?.nombre_pas}
                            </h2>
                            <p className="text-primary-blue font-medium flex items-center mt-1">
                                <Building2 className="h-4 w-4 mr-2" />{" "}
                                {SelectInputedPas?.empresa?.nombre}
                            </p>
                        </div>
                        <span
                            className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                SelectInputedPas?.estado === "INICIADO"
                                    ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                                    : SelectInputedPas?.estado === "ABIERTA"
                                      ? "bg-blue-50 text-blue-600 border-blue-200"
                                      : SelectInputedPas?.estado === "CERRADA"
                                        ? "bg-rose-50 text-rose-600 border-rose-200"
                                        : SelectInputedPas?.estado ===
                                            "FINALIZADO"
                                          ? "bg-purple-50 text-purple-600 border-purple-200"
                                          : ""
                            }`}
                        >
                            {SelectInputedPas?.estado}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-y-6 gap-x-4 border-t pt-6">
                        <div className="flex items-center">
                            <Briefcase className="h-5 w-5 text-gray-400 mr-3" />
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold">
                                    Mención
                                </p>
                                <p className="text-sm font-semibold">
                                    {SelectInputedPas?.mencion}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <Clock className="h-5 w-5 text-gray-400 mr-3" />
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold">
                                    Turno / Carga
                                </p>
                                <p className="text-sm font-semibold capitalize">
                                    {SelectInputedPas?.turno} -{" "}
                                    {SelectInputedPas?.carga_horaria} hrs
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold">
                                    Periodo
                                </p>
                                <p className="text-sm font-semibold">
                                    {SelectInputedPas?.fecha_ini_fmt} al{" "}
                                    {SelectInputedPas?.fecha_fin_fmt}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <Users className="h-5 w-5 text-gray-400 mr-3" />
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold">
                                    Cupos Disponibles
                                </p>
                                <p className="text-sm font-semibold">
                                    {SelectInputedPas?.cupos_disponibles} de{" "}
                                    {SelectInputedPas?.cupos} totales
                                </p>
                            </div>
                        </div>
                        <div className="col-span-2 flex items-start">
                            <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-1" />
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold">
                                    Ubicación Empresa
                                </p>
                                <p className="text-sm">
                                    {SelectInputedPas?.empresa?.direccion}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end">
                        <SecondaryButton
                            type="button"
                            onClick={() => setShowViewModal(false)}
                        >
                            Cerrar
                        </SecondaryButton>
                    </div>
                </div>
            </Modal>
        </DashboardLayout>
    );
}
