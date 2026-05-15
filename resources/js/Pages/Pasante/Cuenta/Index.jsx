// resources/js/Pages/Pasante/Cuenta/Index.jsx
import React, { useState } from "react";
import { router, usePage } from "@inertiajs/react";
import PasanteLayout from "@/Components/Layout/PasanteLayout";
import ModalConfirmacion from "@/Components/Common/ModalConfirmacion";
import { User, Mail, Key, Lock, Save, Edit2, X, ArrowLeft } from "lucide-react";

export default function Index({ auth, user }) {
    const [isEditing, setIsEditing] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [showConfirmClose, setShowConfirmClose] = useState(false);

    const [form, setForm] = useState({
        nombre_user: user.nombre_user || "",
        correo: user.correo || "",
    });

    const [passwordForm, setPasswordForm] = useState({
        current_password: "",
        password: "",
        password_confirmation: "",
    });

    const [originalForm, setOriginalForm] = useState({ ...form });
    const [errors, setErrors] = useState({});
    const [passwordErrors, setPasswordErrors] = useState({});
    const { flash } = usePage().props;

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setHasChanges(true);
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: null });
        }
    };

    const handlePasswordChange = (e) => {
        setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
        if (passwordErrors[e.target.name]) {
            setPasswordErrors({ ...passwordErrors, [e.target.name]: null });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        router.put("/pasante/cuenta", form, {
            onSuccess: () => {
                setIsEditing(false);
                setHasChanges(false);
                setOriginalForm({ ...form });
            },
            onError: (error) => setErrors(error),
        });
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        router.put("/pasante/password", passwordForm, {
            onSuccess: () => {
                setIsChangingPassword(false);
                setPasswordForm({
                    current_password: "",
                    password: "",
                    password_confirmation: "",
                });
                setPasswordErrors({});
            },
            onError: (error) => setPasswordErrors(error),
        });
    };

    const handleCancel = () => {
        setForm({ ...originalForm });
        setIsEditing(false);
        setHasChanges(false);
        setErrors({});
    };

    const handleCancelPassword = () => {
        setPasswordForm({
            current_password: "",
            password: "",
            password_confirmation: "",
        });
        setIsChangingPassword(false);
        setPasswordErrors({});
    };

    const handleCloseAttempt = () => {
        if ((isEditing && hasChanges) || isChangingPassword) {
            setShowConfirmClose(true);
        } else {
            window.history.back();
        }
    };

    const handleConfirmClose = (shouldSave) => {
        setShowConfirmClose(false);
        if (shouldSave && isEditing) {
            router.put("/pasante/cuenta", form, {
                onSuccess: () => {
                    window.history.back();
                },
                onError: (error) => setErrors(error),
            });
        } else if (shouldSave && isChangingPassword) {
            router.put("/pasante/password", passwordForm, {
                onSuccess: () => {
                    window.history.back();
                },
                onError: (error) => setPasswordErrors(error),
            });
        } else {
            window.history.back();
        }
    };

    return (
        <PasanteLayout auth={auth}>
            <div className="max-w-3xl mx-auto">
                {/* Mensajes flash */}
                {flash?.success && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                        {flash.success}
                    </div>
                )}

                {/* Tarjeta principal */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-primary-navy to-primary-blue px-6 py-4">
                        <h2 className="text-xl font-semibold text-white">
                            Mi Cuenta
                        </h2>
                        <p className="text-primary-sky-blue text-sm">
                            Datos de acceso y seguridad
                        </p>
                    </div>

                    <div className="p-6">
                        {/* Formulario de edición de cuenta */}
                        {isEditing && (
                            <form onSubmit={handleSubmit} className="space-y-6">
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
                                                className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20"
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
                                                className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20"
                                            />
                                            {errors.correo && (
                                                <p className="text-red-500 text-xs mt-1">
                                                    {errors.correo}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t">
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                    >
                                        <X size={18} />
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex items-center gap-2 bg-primary-blue text-white px-5 py-2.5 rounded-lg hover:bg-primary-sky-blue"
                                    >
                                        <Save size={18} />
                                        Guardar cambios
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Formulario de cambio de contraseña */}
                        {isChangingPassword && (
                            <form
                                onSubmit={handlePasswordSubmit}
                                className="space-y-6"
                            >
                                <div className="bg-gray-50 rounded-lg p-5">
                                    <h3 className="text-md font-semibold text-primary-navy mb-4 flex items-center gap-2 border-b pb-2">
                                        <Lock
                                            size={18}
                                            className="text-primary-blue"
                                        />
                                        Cambiar Contraseña
                                    </h3>
                                    <div className="space-y-4">
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
                                                value={
                                                    passwordForm.current_password
                                                }
                                                onChange={handlePasswordChange}
                                                className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20"
                                            />
                                            {passwordErrors.current_password && (
                                                <p className="text-red-500 text-xs mt-1">
                                                    {
                                                        passwordErrors.current_password
                                                    }
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Nueva Contraseña{" "}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </label>
                                            <input
                                                type="password"
                                                name="password"
                                                value={passwordForm.password}
                                                onChange={handlePasswordChange}
                                                className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20"
                                            />
                                            {passwordErrors.password && (
                                                <p className="text-red-500 text-xs mt-1">
                                                    {passwordErrors.password}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Confirmar Contraseña{" "}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </label>
                                            <input
                                                type="password"
                                                name="password_confirmation"
                                                value={
                                                    passwordForm.password_confirmation
                                                }
                                                onChange={handlePasswordChange}
                                                className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t">
                                    <button
                                        type="button"
                                        onClick={handleCancelPassword}
                                        className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                    >
                                        <X size={18} />
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex items-center gap-2 bg-primary-blue text-white px-5 py-2.5 rounded-lg hover:bg-primary-sky-blue"
                                    >
                                        <Save size={18} />
                                        Cambiar contraseña
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Vista normal de datos (no edición) */}
                        {!isEditing && !isChangingPassword && (
                            <div className="space-y-6">
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
                                            <label className="block text-xs font-medium text-gray-500">
                                                Nombre de Usuario
                                            </label>
                                            <p className="text-gray-900 font-medium">
                                                {user.nombre_user}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500">
                                                Correo Electrónico
                                            </label>
                                            <p className="text-gray-900 font-medium">
                                                {user.correo}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    {/* Botón volver */}
                    <div className="mb-5 flex items-center justify-between pr-7">
                        <button
                            disabled
                            className="invisible pointer-events-none"
                        >
                            <ArrowLeft size={10} />
                            <span></span>
                        </button>

                        {!isEditing && !isChangingPassword && (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsChangingPassword(true)}
                                    className="flex items-center gap-2 bg-yellow-500 text-white px-5 py-2.5 rounded-lg hover:bg-yellow-600 transition-colors shadow-sm"
                                >
                                    <Key size={18} />
                                    Cambiar Contraseña
                                </button>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-2 bg-primary-blue text-white px-4 py-2.5 rounded-lg hover:bg-primary-sky-blue transition-colors shadow-sm"
                                >
                                    <Edit2 size={18} />
                                    Editar Cuenta
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal de confirmación al salir */}
            <ModalConfirmacion
                isOpen={showConfirmClose}
                onClose={() => setShowConfirmClose(false)}
                onConfirm={() => handleConfirmClose(true)}
                onCancel={() => handleConfirmClose(false)}
                titulo="Cambios sin guardar"
                mensaje="Tienes cambios sin guardar. ¿Deseas guardarlos antes de salir?"
                confirmText="Guardar y salir"
                cancelText="Salir sin guardar"
                type="warning"
            />
        </PasanteLayout>
    );
}
