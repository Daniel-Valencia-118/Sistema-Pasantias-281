import React, { useState, useEffect } from "react";
import {
    X,
    User,
    Phone,
    Mail,
    Calendar,
    Briefcase,
    Tag,
    Save,
    Key,
    Edit,
    Eye,
} from "lucide-react";
import axios from "axios";
import ModalConfirmacion from "./ModalConfirmacion";

export default function ModalPerfil({
    isOpen,
    onClose,
    usuario,
    tipo,
    onUpdate,
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [form, setForm] = useState({});
    const [originalForm, setOriginalForm] = useState({});
    const [loading, setLoading] = useState(false);
    const [showConfirmClose, setShowConfirmClose] = useState(false);

    useEffect(() => {
        if (usuario) {
            const newForm = {
                nombre: usuario.nombre || "",
                ap_paterno: usuario.ap_paterno || "",
                ap_materno: usuario.ap_materno || "",
                ci: usuario.ci || "",
                numero_cel: usuario.numero_cel || "",
                fecha_nac: usuario.fecha_nac || "",
                correo: usuario.correo || "",
                nombre_user: usuario.nombre_user || "",
                cargo: usuario.cargo || "",
                area: usuario.area || "",
                password: "",
                password_confirmation: "",
            };
            setForm(newForm);
            setOriginalForm(newForm);
            setHasChanges(false);
        }
    }, [usuario]);

    if (!isOpen || !usuario) return null;

    const handleChange = (e) => {
        const newForm = { ...form, [e.target.name]: e.target.value };
        setForm(newForm);

        // Verificar si hay cambios respecto al original
        const hasAnyChange = Object.keys(newForm).some((key) => {
            if (key === "password" || key === "password_confirmation") {
                return (
                    newForm[key] !== "" && newForm[key] !== originalForm[key]
                );
            }
            return newForm[key] !== originalForm[key];
        });
        setHasChanges(hasAnyChange);
    };

    const handleClose = () => {
        if (isEditing && hasChanges) {
            setShowConfirmClose(true);
        } else {
            onClose();
            setIsEditing(false);
            setHasChanges(false);
        }
    };

    const handleConfirmClose = (shouldSave) => {
        setShowConfirmClose(false);
        if (shouldSave) {
            // Guardar cambios antes de cerrar
            handleSubmit(new Event("submit"));
        } else {
            // Cancelar y cerrar
            onClose();
            setIsEditing(false);
            setHasChanges(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.put(
                `/gerente/jefes/${usuario.id}`,
                form,
            );
            if (response.data.message) {
                if (onUpdate) onUpdate();
                setIsEditing(false);
                setHasChanges(false);
                setOriginalForm(form);
                alert(response.data.message);
            }
        } catch (error) {
            alert(error.response?.data?.message || "Error al actualizar");
        } finally {
            setLoading(false);
        }
    };

    const handleCancelEdit = () => {
        setForm(originalForm);
        setIsEditing(false);
        setHasChanges(false);
    };

    const displayData = isEditing ? form : usuario;

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto">
                <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full mx-4 my-8">
                    {/* Header con gradiente */}
                    <div className="bg-gradient-to-r from-primary-navy to-primary-blue px-6 py-4 rounded-t-xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 p-2 rounded-lg">
                                    <User size={24} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">
                                        Perfil de{" "}
                                        {tipo === "jefe"
                                            ? "Jefe de Pasante"
                                            : "Pasante"}
                                    </h3>
                                    <p className="text-primary-sky-blue text-sm">
                                        {!isEditing
                                            ? "Visualización de datos"
                                            : "Edición de datos"}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleClose}
                                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors cursor-pointer"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="p-6 max-h-[70vh] overflow-y-auto"
                    >
                        <div className="space-y-6">
                            {/* Datos personales */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-semibold text-primary-navy mb-4 flex items-center gap-2 border-b pb-2">
                                    <User
                                        size={18}
                                        className="text-primary-blue"
                                    />
                                    Datos Personales
                                </h4>
                                <div className="grid md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">
                                            Apellido Paterno
                                        </label>
                                        <input
                                            type="text"
                                            name="ap_paterno"
                                            value={displayData.ap_paterno || ""}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="w-full rounded-lg border-gray-200 px-3 py-2 text-sm focus:border-primary-blue focus:ring-1 focus:ring-primary-blue/20 disabled:bg-gray-100 disabled:text-gray-500 transition-all cursor-pointer"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">
                                            Apellido Materno
                                        </label>
                                        <input
                                            type="text"
                                            name="ap_materno"
                                            value={displayData.ap_materno || ""}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="w-full rounded-lg border-gray-200 px-3 py-2 text-sm focus:border-primary-blue focus:ring-1 focus:ring-primary-blue/20 disabled:bg-gray-100 disabled:text-gray-500 transition-all cursor-pointer"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">
                                            Nombres
                                        </label>
                                        <input
                                            type="text"
                                            name="nombre"
                                            value={displayData.nombre || ""}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="w-full rounded-lg border-gray-200 px-3 py-2 text-sm focus:border-primary-blue focus:ring-1 focus:ring-primary-blue/20 disabled:bg-gray-100 disabled:text-gray-500 transition-all cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Documentos y contacto */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-semibold text-primary-navy mb-4 flex items-center gap-2 border-b pb-2">
                                    <Tag
                                        size={18}
                                        className="text-primary-blue"
                                    />
                                    Documentos y Contacto
                                </h4>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">
                                            Carnet de Identidad
                                        </label>
                                        <input
                                            type="text"
                                            name="ci"
                                            value={displayData.ci || ""}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="w-full rounded-lg border-gray-200 px-3 py-2 text-sm focus:border-primary-blue focus:ring-1 focus:ring-primary-blue/20 disabled:bg-gray-100 disabled:text-gray-500 transition-all cursor-pointer"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">
                                            Celular
                                        </label>
                                        <input
                                            type="text"
                                            name="numero_cel"
                                            value={displayData.numero_cel || ""}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="w-full rounded-lg border-gray-200 px-3 py-2 text-sm focus:border-primary-blue focus:ring-1 focus:ring-primary-blue/20 disabled:bg-gray-100 disabled:text-gray-500 transition-all cursor-pointer"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">
                                            Fecha de Nacimiento
                                        </label>
                                        <input
                                            type="date"
                                            name="fecha_nac"
                                            value={displayData.fecha_nac || ""}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="w-full rounded-lg border-gray-200 px-3 py-2 text-sm focus:border-primary-blue focus:ring-1 focus:ring-primary-blue/20 disabled:bg-gray-100 disabled:text-gray-500 transition-all cursor-pointer"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">
                                            Correo Electrónico
                                        </label>
                                        <input
                                            type="email"
                                            name="correo"
                                            value={displayData.correo || ""}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="w-full rounded-lg border-gray-200 px-3 py-2 text-sm focus:border-primary-blue focus:ring-1 focus:ring-primary-blue/20 disabled:bg-gray-100 disabled:text-gray-500 transition-all cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Datos laborales (solo para jefe) */}
                            {tipo === "jefe" && (
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="font-semibold text-primary-navy mb-4 flex items-center gap-2 border-b pb-2">
                                        <Briefcase
                                            size={18}
                                            className="text-primary-blue"
                                        />
                                        Datos Laborales
                                    </h4>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">
                                                Área de Trabajo
                                            </label>
                                            <input
                                                type="text"
                                                name="area"
                                                value={displayData.area || ""}
                                                onChange={handleChange}
                                                disabled={!isEditing}
                                                className="w-full rounded-lg border-gray-200 px-3 py-2 text-sm focus:border-primary-blue focus:ring-1 focus:ring-primary-blue/20 disabled:bg-gray-100 disabled:text-gray-500 transition-all cursor-pointer"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">
                                                Cargo
                                            </label>
                                            <input
                                                type="text"
                                                name="cargo"
                                                value={displayData.cargo || ""}
                                                onChange={handleChange}
                                                disabled={!isEditing}
                                                className="w-full rounded-lg border-gray-200 px-3 py-2 text-sm focus:border-primary-blue focus:ring-1 focus:ring-primary-blue/20 disabled:bg-gray-100 disabled:text-gray-500 transition-all cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Datos de cuenta */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-semibold text-primary-navy mb-4 flex items-center gap-2 border-b pb-2">
                                    <Mail
                                        size={18}
                                        className="text-primary-blue"
                                    />
                                    Datos de Cuenta
                                </h4>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">
                                            Nombre de Usuario
                                        </label>
                                        <input
                                            type="text"
                                            name="nombre_user"
                                            value={
                                                displayData.nombre_user || ""
                                            }
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="w-full rounded-lg border-gray-200 px-3 py-2 text-sm focus:border-primary-blue focus:ring-1 focus:ring-primary-blue/20 disabled:bg-gray-100 disabled:text-gray-500 transition-all cursor-pointer"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">
                                            Fecha de Registro
                                        </label>
                                        <input
                                            type="text"
                                            value={usuario.fecha_registro || ""}
                                            disabled
                                            className="w-full rounded-lg border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-500 cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Cambio de contraseña (solo edición) */}
                            {isEditing && tipo === "jefe" && (
                                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                                    <h4 className="font-semibold text-yellow-800 mb-4 flex items-center gap-2">
                                        <Key size={18} />
                                        Cambiar Contraseña (Opcional)
                                    </h4>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                Nueva Contraseña
                                            </label>
                                            <input
                                                type="password"
                                                name="password"
                                                value={form.password || ""}
                                                onChange={handleChange}
                                                className="w-full rounded-lg border-gray-200 px-3 py-2 text-sm focus:border-primary-blue focus:ring-1 focus:ring-primary-blue/20 transition-all cursor-pointer"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                Confirmar Contraseña
                                            </label>
                                            <input
                                                type="password"
                                                name="password_confirmation"
                                                value={
                                                    form.password_confirmation ||
                                                    ""
                                                }
                                                onChange={handleChange}
                                                className="w-full rounded-lg border-gray-200 px-3 py-2 text-sm focus:border-primary-blue focus:ring-1 focus:ring-primary-blue/20 transition-all cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Botones de acción */}
                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                            {!isEditing ? (
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-2 bg-primary-blue text-white px-5 py-2.5 rounded-lg hover:bg-primary-sky-blue transition-all cursor-pointer shadow-sm hover:shadow-md"
                                >
                                    <Edit size={18} />
                                    Editar Perfil
                                </button>
                            ) : (
                                <>
                                    <button
                                        type="button"
                                        onClick={handleCancelEdit}
                                        className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all cursor-pointer"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-lg hover:bg-green-700 transition-all cursor-pointer disabled:opacity-50 shadow-sm hover:shadow-md"
                                    >
                                        <Save size={18} />
                                        {loading
                                            ? "Guardando..."
                                            : "Guardar cambios"}
                                    </button>
                                </>
                            )}
                        </div>
                    </form>
                </div>
            </div>

            {/* Modal de confirmación al cerrar */}
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
        </>
    );
}
