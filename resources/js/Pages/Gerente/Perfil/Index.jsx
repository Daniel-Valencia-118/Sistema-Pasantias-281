import React, { useState } from "react";
import { router, usePage } from "@inertiajs/react";
import GerenteLayout from "@/Components/Layout/GerenteLayout";
import {
    User,
    Mail,
    Phone,
    Calendar,
    CreditCard,
    ArrowLeft,
    Save,
    Edit2,
    X,
} from "lucide-react";

export default function Index({ auth, user, gerente }) {
    const [isEditing, setIsEditing] = useState(false);
    // Agrega esta función antes del return
    const formatDateForInput = (date) => {
        if (!date) return "";
        // Si ya viene en formato YYYY-MM-DD, devolverlo igual
        if (date.match(/^\d{4}-\d{2}-\d{2}$/)) return date;
        // Si viene en otro formato, convertirlo
        return new Date(date).toISOString().split("T")[0];
    };
    const [form, setForm] = useState({
        nombre_user: user.nombre_user,
        nombre: user.nombre,
        ap_paterno: user.ap_paterno,
        ap_materno: user.ap_materno,
        correo: user.correo,
        numero_cel: user.numero_cel,
        ci: user.ci,
        fecha_nac: formatDateForInput(user.fecha_nac),
        nro_secun: gerente.nro_secun || "",
        password: "",
        password_confirmation: "",
    });

    const { flash } = usePage().props;

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        router.put("/gerente/perfil", form, {
            onSuccess: () => {
                setIsEditing(false);
                setForm({ ...form, password: "", password_confirmation: "" });
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
                            Editar Perfil
                        </button>
                    )}
                </div>

                {/* Mensaje de éxito */}
                {flash?.success && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                        {flash.success}
                    </div>
                )}

                {/* Tarjeta de perfil */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-primary-navy px-6 py-4">
                        <h2 className="text-xl font-semibold text-white">
                            Mi Perfil
                        </h2>
                        <p className="text-primary-sky-blue text-sm">
                            Información personal del gerente
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6">
                        <div className="space-y-6">
                            {/* Datos personales */}
                            <div>
                                <h3 className="text-lg font-medium text-primary-navy mb-4 flex items-center gap-2">
                                    <User size={20} />
                                    Datos Personales
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nombre de usuario
                                        </label>
                                        <input
                                            type="text"
                                            name="nombre_user"
                                            value={form.nombre_user}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="w-full rounded-lg border-gray-200 bg-gray-50 px-4 py-2 focus:border-primary-blue focus:ring focus:ring-primary-blue/20 disabled:bg-gray-100 disabled:text-gray-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Carnet de Identidad
                                        </label>
                                        <input
                                            type="text"
                                            name="ci"
                                            value={form.ci}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="w-full rounded-lg border-gray-200 bg-gray-50 px-4 py-2 focus:border-primary-blue focus:ring focus:ring-primary-blue/20 disabled:bg-gray-100 disabled:text-gray-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nombres
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
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Apellido Paterno
                                        </label>
                                        <input
                                            type="text"
                                            name="ap_paterno"
                                            value={form.ap_paterno}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="w-full rounded-lg border-gray-200 bg-gray-50 px-4 py-2 focus:border-primary-blue focus:ring focus:ring-primary-blue/20 disabled:bg-gray-100 disabled:text-gray-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Apellido Materno
                                        </label>
                                        <input
                                            type="text"
                                            name="ap_materno"
                                            value={form.ap_materno}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="w-full rounded-lg border-gray-200 bg-gray-50 px-4 py-2 focus:border-primary-blue focus:ring focus:ring-primary-blue/20 disabled:bg-gray-100 disabled:text-gray-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Celular
                                        </label>
                                        <input
                                            type="text"
                                            name="numero_cel"
                                            value={form.numero_cel}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="w-full rounded-lg border-gray-200 bg-gray-50 px-4 py-2 focus:border-primary-blue focus:ring focus:ring-primary-blue/20 disabled:bg-gray-100 disabled:text-gray-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Celular secundario
                                        </label>
                                        <input
                                            type="text"
                                            name="nro_secun"
                                            value={form.nro_secun}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="w-full rounded-lg border-gray-200 bg-gray-50 px-4 py-2 focus:border-primary-blue focus:ring focus:ring-primary-blue/20 disabled:bg-gray-100 disabled:text-gray-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Fecha de Nacimiento
                                        </label>
                                        <input
                                            type="date"
                                            name="fecha_nac"
                                            value={form.fecha_nac}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="w-full rounded-lg border-gray-200 bg-gray-50 px-4 py-2 focus:border-primary-blue focus:ring focus:ring-primary-blue/20 disabled:bg-gray-100 disabled:text-gray-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Datos de contacto */}
                            <div className="border-t pt-6">
                                <h3 className="text-lg font-medium text-primary-navy mb-4 flex items-center gap-2">
                                    <Mail size={20} />
                                    Contacto
                                </h3>
                                <div className="grid md:grid-cols-1 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Correo electrónico
                                        </label>
                                        <input
                                            type="email"
                                            name="correo"
                                            value={form.correo}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="w-full rounded-lg border-gray-200 bg-gray-50 px-4 py-2 focus:border-primary-blue focus:ring focus:ring-primary-blue/20 disabled:bg-gray-100 disabled:text-gray-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Cambiar contraseña (solo en modo edición) */}
                            {isEditing && (
                                <div className="border-t pt-6">
                                    <h3 className="text-lg font-medium text-primary-navy mb-4 flex items-center gap-2">
                                        <CreditCard size={20} />
                                        Cambiar Contraseña
                                    </h3>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Nueva contraseña
                                            </label>
                                            <input
                                                type="password"
                                                name="password"
                                                value={form.password}
                                                onChange={handleChange}
                                                className="w-full rounded-lg border-gray-200 px-4 py-2 focus:border-primary-blue focus:ring focus:ring-primary-blue/20"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Confirmar contraseña
                                            </label>
                                            <input
                                                type="password"
                                                name="password_confirmation"
                                                value={
                                                    form.password_confirmation
                                                }
                                                onChange={handleChange}
                                                className="w-full rounded-lg border-gray-200 px-4 py-2 focus:border-primary-blue focus:ring focus:ring-primary-blue/20"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Botones de acción (solo en modo edición) */}
                            {isEditing && (
                                <div className="flex justify-end gap-3 pt-4 border-t">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
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
