import React, { useState, useEffect } from "react";
import { GraduationCap } from "lucide-react";
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
    Building2,
    Clock,
    CheckCircle,
    XCircle,
} from "lucide-react";
import axios from "axios";
import ModalConfirmacion from "./ModalConfirmacion";

export default function ModalPerfil({
    isOpen,
    onClose,
    usuario,
    tipo,
    readOnly,
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
            handleSubmit(new Event("submit"));
        } else {
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

    const formatFecha = (fechaStr) => {
        if (!fechaStr) return "-";
        const [anio, mes, dia] = fechaStr.split("-").map(Number);
        const fecha = new Date(anio, mes - 1, dia);
        return fecha.toLocaleDateString("es-ES", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    // Componente de campo de texto reutilizable (optimizado)
    const FieldValue = ({ label, value }) => (
        <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
                {label}
            </label>
            <div className="bg-gray-50 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800">
                {value || "-"}
            </div>
        </div>
    );

    const InputField = ({ label, name, value, onChange, disabled }) => (
        <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
                {label}
            </label>
            <input
                type="text"
                name={name}
                value={value || ""}
                onChange={onChange}
                disabled={disabled}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 focus:border-primary-blue focus:ring-1 focus:ring-primary-blue/20 disabled:bg-gray-50 disabled:text-gray-500"
            />
        </div>
    );

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto">
                <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full mx-4 my-8">
                    {/* Header simplificado */}
                    <div className="bg-primary-navy px-6 py-4 rounded-t-xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 p-2 rounded-lg">
                                    {tipo === "jefe" ? (
                                        <Briefcase
                                            size={22}
                                            className="text-white"
                                        />
                                    ) : (
                                        <GraduationCap
                                            size={22}
                                            className="text-white"
                                        />
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">
                                        {tipo === "jefe"
                                            ? "Perfil del Jefe"
                                            : "Perfil del Pasante"}
                                    </h3>
                                    <p className="text-white/70 text-base">
                                        {!isEditing
                                            ? "Visualización de datos"
                                            : "Edición de datos"}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleClose}
                                className="text-white hover:bg-white/20 p-1.5 rounded-lg transition-colors cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="p-5 max-h-[70vh] overflow-y-auto"
                    >
                        <div className="space-y-4">
                            {/* Avatar */}
                            <div className="flex justify-center mb-2">
                                <div className="relative">
                                    <div className="w-20 h-20 rounded-full bg-primary-blue flex items-center justify-center text-white text-xl font-bold shadow-md overflow-hidden">
                                        {usuario?.avatar_url ? (
                                            <img
                                                src={usuario.avatar_url}
                                                alt="Avatar"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <User
                                                size={32}
                                                className="text-white"
                                            />
                                        )}
                                    </div>
                                    <div className="absolute -bottom-1 -right-1">
                                        {usuario?.avatar_url ? (
                                            <CheckCircle
                                                size={16}
                                                className="text-green-500 bg-white rounded-full"
                                            />
                                        ) : (
                                            <XCircle
                                                size={16}
                                                className="text-gray-400 bg-white rounded-full"
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Nombre Completo */}
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <h4 className="font-medium text-primary-navy mb-3 flex items-center gap-2 text-sm border-b border-gray-200 pb-2">
                                    <User
                                        size={16}
                                        className="text-primary-blue"
                                    />
                                    Información Personal
                                </h4>
                                <div className="grid md:grid-cols-3 gap-3">
                                    <FieldValue
                                        label="Apellido Paterno"
                                        value={displayData.ap_paterno}
                                    />
                                    <FieldValue
                                        label="Apellido Materno"
                                        value={displayData.ap_materno}
                                    />
                                    <FieldValue
                                        label="Nombres"
                                        value={displayData.nombre}
                                    />
                                </div>
                            </div>

                            {/* Datos Académicos */}
                            {tipo === "pasante" && (
                                <div className="bg-blue-50/50 rounded-lg p-4 border border-blue-200">
                                    <h4 className="font-medium text-primary-navy mb-3 flex items-center gap-2 text-sm border-b border-blue-200 pb-2">
                                        <GraduationCap
                                            size={16}
                                            className="text-primary-blue"
                                        />
                                        Datos Académicos
                                    </h4>
                                    <div className="grid md:grid-cols-3 gap-3">
                                        <FieldValue
                                            label="Semestre"
                                            value={displayData.semestre}
                                        />
                                        <FieldValue
                                            label="Mención"
                                            value={displayData.mencion}
                                        />
                                        <FieldValue
                                            label="Matrícula"
                                            value={displayData.matricula}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Datos Laborales */}
                            {tipo === "jefe" && (
                                <div className="bg-indigo-50/50 rounded-lg p-4 border border-indigo-200">
                                    <h4 className="font-medium text-primary-navy mb-3 flex items-center gap-2 text-sm border-b border-indigo-200 pb-2">
                                        <Briefcase
                                            size={16}
                                            className="text-primary-blue"
                                        />
                                        Datos Laborales
                                    </h4>
                                    <div className="grid md:grid-cols-2 gap-3">
                                        {isEditing ? (
                                            <>
                                                <InputField
                                                    label="Área de Trabajo"
                                                    name="area"
                                                    value={displayData.area}
                                                    onChange={handleChange}
                                                />
                                                <InputField
                                                    label="Cargo"
                                                    name="cargo"
                                                    value={displayData.cargo}
                                                    onChange={handleChange}
                                                />
                                            </>
                                        ) : (
                                            <>
                                                <FieldValue
                                                    label="Área de Trabajo"
                                                    value={displayData.area}
                                                />
                                                <FieldValue
                                                    label="Cargo"
                                                    value={displayData.cargo}
                                                />
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Documentos y Contacto */}
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <h4 className="font-medium text-primary-navy mb-3 flex items-center gap-2 text-sm border-b border-gray-200 pb-2">
                                    <Tag
                                        size={16}
                                        className="text-primary-blue"
                                    />
                                    Documentos y Contacto
                                </h4>
                                <div className="grid md:grid-cols-2 gap-3">
                                    <FieldValue
                                        label="CI"
                                        value={displayData.ci}
                                    />
                                    <FieldValue
                                        label="Celular"
                                        value={displayData.numero_cel}
                                    />
                                    <FieldValue
                                        label="Fecha de Nacimiento"
                                        value={formatFecha(
                                            displayData.fecha_nac,
                                        )}
                                    />
                                    <FieldValue
                                        label="Correo Electrónico"
                                        value={displayData.correo}
                                    />
                                </div>
                            </div>

                            {/* Datos de Cuenta */}
                            {!readOnly && (
                                <div className="bg-purple-50/50 rounded-lg p-4 border border-purple-200">
                                    <h4 className="font-medium text-primary-navy mb-3 flex items-center gap-2 text-sm border-b border-purple-200 pb-2">
                                        <Mail
                                            size={16}
                                            className="text-primary-blue"
                                        />
                                        Datos de Cuenta
                                    </h4>
                                    <div className="grid md:grid-cols-2 gap-3">
                                        <FieldValue
                                            label="Nombre de Usuario"
                                            value={displayData.nombre_user}
                                        />
                                        <FieldValue
                                            label="Fecha de Registro"
                                            value={formatFecha(
                                                usuario.fecha_registro,
                                            )}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Botones de acción */}
                        {!readOnly && (
                            <div className="flex justify-end gap-3 mt-5 pt-3 border-t border-gray-200">
                                {!isEditing ? (
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(true)}
                                        className="flex items-center gap-1.5 px-4 py-2 bg-primary-blue text-white text-sm font-medium rounded-lg hover:bg-primary-sky-blue transition-colors cursor-pointer"
                                    >
                                        <Edit size={16} />
                                        Editar Datos Laborales
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            type="button"
                                            onClick={handleCancelEdit}
                                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors cursor-pointer disabled:opacity-50"
                                        >
                                            <Save size={16} />
                                            {loading
                                                ? "Guardando..."
                                                : "Guardar cambios"}
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </form>
                </div>
            </div>

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
