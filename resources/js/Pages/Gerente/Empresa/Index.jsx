import React, { useState } from "react";
import { router, usePage } from "@inertiajs/react";
import GerenteLayout from "@/Components/Layout/GerenteLayout";
import {
    Building2,
    MapPin,
    Phone,
    Mail,
    Hash,
    User,
    ArrowLeft,
    Save,
    Edit2,
    X,
} from "lucide-react";

export default function Index({ auth, empresa, gerente }) {
    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState({
        nombre: empresa.nombre || "",
        nit: empresa.nit || "",
        direccion: empresa.direccion || "",
        telefono: empresa.telefono || "",
        email: empresa.email || "",
    });

    const { flash } = usePage().props;

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        router.put("/gerente/empresa", form, {
            onSuccess: () => {
                setIsEditing(false);
            },
        });
    };

    const goBack = () => {
        window.history.back();
    };

    return (
        <GerenteLayout auth={auth}>
            <div className="max-w-3xl mx-auto">
                {/* Header con botón volver */}
                <div className="mb-6 flex items-center justify-between">
                    <button
                        onClick={goBack}
                        className="flex items-center gap-2 text-primary-slate hover:text-primary-blue transition-colors"
                    >
                        <ArrowLeft size={20} />
                        <span>Volver</span>
                    </button>
                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-2 bg-primary-blue text-white px-4 py-2 rounded-lg hover:bg-primary-sky-blue transition-colors"
                        >
                            <Edit2 size={18} />
                            Editar Empresa
                        </button>
                    )}
                </div>

                {/* Mensaje de éxito */}
                {flash?.success && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                        {flash.success}
                    </div>
                )}

                {/* Tarjeta de empresa */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-primary-navy px-6 py-4">
                        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                            <Building2 size={22} />
                            Mi Empresa
                        </h2>
                        <p className="text-primary-sky-blue text-sm">
                            Información de la empresa
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6">
                        <div className="space-y-6">
                            {/* Fila 1: Nombre empresa y NIT */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                        <Building2 size={16} />
                                        Nombre de la Empresa
                                    </label>
                                    <input
                                        type="text"
                                        name="nombre"
                                        value={form.nombre}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className="w-full rounded-lg border-gray-200 bg-gray-50 px-4 py-2 focus:border-primary-blue focus:ring focus:ring-primary-blue/20 disabled:bg-gray-100 disabled:text-gray-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                        <Hash size={16} />
                                        NIT
                                    </label>
                                    <input
                                        type="text"
                                        name="nit"
                                        value={form.nit}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className="w-full rounded-lg border-gray-200 bg-gray-50 px-4 py-2 focus:border-primary-blue focus:ring focus:ring-primary-blue/20 disabled:bg-gray-100 disabled:text-gray-500"
                                    />
                                </div>
                            </div>

                            {/* Fila 2: Gerente (solo lectura) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                    <User size={16} />
                                    Gerente
                                </label>
                                <input
                                    type="text"
                                    value={gerente.nombre_completo}
                                    disabled
                                    className="w-full rounded-lg border-gray-200 bg-gray-100 px-4 py-2 text-gray-500 cursor-not-allowed"
                                />
                            </div>

                            {/* Fila 3: Dirección y Teléfono */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                        <MapPin size={16} />
                                        Dirección
                                    </label>
                                    <input
                                        type="text"
                                        name="direccion"
                                        value={form.direccion}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className="w-full rounded-lg border-gray-200 bg-gray-50 px-4 py-2 focus:border-primary-blue focus:ring focus:ring-primary-blue/20 disabled:bg-gray-100 disabled:text-gray-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                        <Phone size={16} />
                                        Teléfono Empresa
                                    </label>
                                    <input
                                        type="text"
                                        name="telefono"
                                        value={form.telefono}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className="w-full rounded-lg border-gray-200 bg-gray-50 px-4 py-2 focus:border-primary-blue focus:ring focus:ring-primary-blue/20 disabled:bg-gray-100 disabled:text-gray-500"
                                    />
                                </div>
                            </div>

                            {/* Fila 4: Email empresa */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                    <Mail size={16} />
                                    Email Empresa
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="w-full rounded-lg border-gray-200 bg-gray-50 px-4 py-2 focus:border-primary-blue focus:ring focus:ring-primary-blue/20 disabled:bg-gray-100 disabled:text-gray-500"
                                />
                            </div>

                            {/* Botones de acción (solo en modo edición) */}
                            {isEditing && (
                                <div className="flex justify-end gap-3 pt-4 border-t">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsEditing(false);
                                            setForm({
                                                nombre: empresa.nombre || "",
                                                nit: empresa.nit || "",
                                                direccion:
                                                    empresa.direccion || "",
                                                telefono:
                                                    empresa.telefono || "",
                                                email: empresa.email || "",
                                            });
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        <X size={18} />
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex items-center gap-2 bg-primary-blue text-white px-4 py-2 rounded-lg hover:bg-primary-sky-blue transition-colors"
                                    >
                                        <Save size={18} />
                                        Guardar cambios
                                    </button>
                                </div>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </GerenteLayout>
    );
}
