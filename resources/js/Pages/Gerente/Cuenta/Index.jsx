import React, { useState } from "react";
import { router, usePage } from "@inertiajs/react";
import GerenteLayout from "@/Components/Layout/GerenteLayout";
import {
    User,
    Mail,
    Key,
    ArrowLeft,
    Save,
    Edit2,
    X,
    Lock,
    Shield,
} from "lucide-react";

export default function Index({ auth, user }) {
    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState({
        nombre_user: user.nombre_user,
        correo: user.correo,
        current_password: "",
        password: "",
        password_confirmation: "",
    });
    const [errors, setErrors] = useState({});

    const { flash } = usePage().props;

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: null });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        router.put("/gerente/cuenta", form, {
            onSuccess: () => {
                setIsEditing(false);
                setForm({
                    ...form,
                    current_password: "",
                    password: "",
                    password_confirmation: "",
                });
            },
            onError: (error) => setErrors(error),
        });
    };

    const goBack = () => window.history.back();

    return (
        <GerenteLayout auth={auth}>
            <div className="max-w-4xl mx-auto">
                {/* Mensajes */}
                {flash?.success && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                        {flash.error}
                    </div>
                )}

                {/* Tarjeta */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-primary-navy to-primary-blue px-6 py-4">
                        <h2 className="text-xl font-semibold text-white">
                            Mi Cuenta
                        </h2>
                        <p className="text-primary-sky-blue text-sm">
                            Datos de acceso y seguridad
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6">
                        <div className="space-y-3">
                            {/* Datos de la cuenta */}
                            <div className="bg-gray-50 rounded-lg p-5">
                                <h3 className="text-md font-semibold text-primary-navy mb-4 flex items-center gap-2 border-b pb-2">
                                    <User
                                        size={18}
                                        className="text-primary-blue"
                                    />
                                    Datos de la Cuenta
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nombre de Usuario{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            name="nombre_user"
                                            value={form.nombre_user}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 disabled:bg-gray-100 disabled:text-gray-500 transition-all"
                                        />
                                        {errors.nombre_user && (
                                            <p className="text-red-500 text-xs mt-1">
                                                {errors.nombre_user}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Correo Electrónico{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>
                                        <input
                                            type="email"
                                            name="correo"
                                            value={form.correo}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 disabled:bg-gray-100 disabled:text-gray-500 transition-all"
                                        />
                                        {errors.correo && (
                                            <p className="text-red-500 text-xs mt-1">
                                                {errors.correo}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Cambiar contraseña */}
                            {isEditing && (
                                <div className="bg-gray-50 rounded-lg p-5">
                                    <h3 className="text-md font-semibold text-primary-navy mb-4 flex items-center gap-2 border-b pb-2">
                                        <Lock
                                            size={18}
                                            className="text-primary-blue"
                                        />
                                        Contraseña y Seguridad
                                    </h3>
                                    <div className="space-y-1">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Contraseña Actual{" "}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </label>
                                            <input
                                                type="password"
                                                name="current_password"
                                                value={form.current_password}
                                                onChange={handleChange}
                                                className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 transition-all"
                                            />
                                            {errors.current_password && (
                                                <p className="text-red-500 text-xs mt-1">
                                                    {errors.current_password}
                                                </p>
                                            )}
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Nueva Contraseña
                                                </label>
                                                <input
                                                    type="password"
                                                    name="password"
                                                    value={form.password}
                                                    onChange={handleChange}
                                                    className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 transition-all"
                                                />
                                                {errors.password && (
                                                    <p className="text-red-500 text-xs mt-1">
                                                        {errors.password}
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Confirmar Contraseña
                                                </label>
                                                <input
                                                    type="password"
                                                    name="password_confirmation"
                                                    value={
                                                        form.password_confirmation
                                                    }
                                                    onChange={handleChange}
                                                    className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {/* Header */}
                            <div className="mb-6 flex items-center justify-between">
                                <button
                                    disabled
                                    className="invisible pointer-events-none"
                                >
                                    <ArrowLeft size={20} />
                                    <span></span>
                                </button>
                                {!isEditing && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="flex items-center gap-2 bg-primary-blue text-white px-5 py-2.5 rounded-lg hover:bg-primary-sky-blue transition-colors shadow-sm"
                                    >
                                        <Edit2 size={18} />
                                        Editar Cuenta y Contraseña
                                    </button>
                                )}
                            </div>

                            {/* Botones */}
                            {isEditing && (
                                <div className="flex justify-end gap-3 pt-4 border-t">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsEditing(false);
                                            setForm({
                                                nombre_user: user.nombre_user,
                                                correo: user.correo,
                                                current_password: "",
                                                password: "",
                                                password_confirmation: "",
                                            });
                                        }}
                                        className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        <X size={18} />
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex items-center gap-2 bg-primary-blue text-white px-5 py-2.5 rounded-lg hover:bg-primary-sky-blue transition-colors shadow-sm"
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
