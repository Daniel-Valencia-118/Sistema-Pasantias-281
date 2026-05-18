// resources/js/Pages/Pasante/Perfil/Index.jsx
import React, { useState } from "react";
import { router, usePage } from "@inertiajs/react";
import PasanteLayout from "@/Components/Layout/PasanteLayout";
import ModalConfirmacion from "@/Components/Common/ModalConfirmacion";
import {
    User,
    Phone,
    Mail,
    Calendar,
    BookOpen,
    GraduationCap,
    Save,
    Edit2,
    X,
    ArrowLeft,
    Camera,
} from "lucide-react";

const MENCIONES = [
    "Desarrollo de Software e Innovación Tecnológica",
    "Inteligencia Artificial y Ciencias de Datos",
    "Ciencias de la Computación",
    "Informática Industrial",
    "Ingeniería de Sistemas",
    "Redes y TIC",
    "Seguridad de la Información",
];

const SEMESTRES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function Index({ auth, user, pasante }) {
    const [isEditing, setIsEditing] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [showConfirmClose, setShowConfirmClose] = useState(false);

    const [form, setForm] = useState({
        // Datos personales
        nombre: user.nombre || "",
        ap_paterno: user.ap_paterno || "",
        ap_materno: user.ap_materno || "",
        ci: user.ci || "",
        fecha_nac: user.fecha_nac || "",
        numero_cel: user.numero_cel || "",
        // Datos académicos
        ru: pasante.ru || "",
        matricula: pasante.matricula || "",
        semestre: pasante.semestre || "",
        mencion: pasante.mencion || "",
    });

    const [originalForm, setOriginalForm] = useState({ ...form });
    const [errors, setErrors] = useState({});
    const { flash } = usePage().props;

    // AVATAR
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const [subiendoAvatar, setSubiendoAvatar] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setHasChanges(true);
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: null });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        router.put("/pasante/perfil", form, {
            onSuccess: () => {
                setIsEditing(false);
                setHasChanges(false);
                setOriginalForm({ ...form });
            },
            onError: (error) => setErrors(error),
        });
    };

    const handleCancel = () => {
        setForm({ ...originalForm });
        setIsEditing(false);
        setHasChanges(false);
        setErrors({});
    };

    const handleCloseAttempt = () => {
        if (isEditing && hasChanges) {
            setShowConfirmClose(true);
        } else {
            window.history.back();
        }
    };

    const handleConfirmClose = (shouldSave) => {
        setShowConfirmClose(false);
        if (shouldSave) {
            router.put("/pasante/perfil", form, {
                onSuccess: () => {
                    setIsEditing(false);
                    setHasChanges(false);
                    window.history.back();
                },
                onError: (error) => setErrors(error),
            });
        } else {
            window.history.back();
        }
    };
    // =============================================
    // Funciones para avatar
    // =============================================
    // Función para subir avatar
    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (
                !file.type.match("image/jpeg") &&
                !file.type.match("image/png")
            ) {
                alert("Solo se permiten archivos JPG y PNG");
                return;
            }
            if (file.size > 2 * 1024 * 1024) {
                alert("La imagen no debe superar los 2MB");
                return;
            }
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };
    const handleAvatarSubmit = async () => {
        if (!avatarFile) return;

        const formData = new FormData();
        formData.append("avatar", avatarFile);

        setSubiendoAvatar(true);
        try {
            await axios.post("/avatar/actualizar", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            window.location.reload();
        } catch (error) {
            alert(error.response?.data?.message || "Error al subir la foto");
        } finally {
            setSubiendoAvatar(false);
        }
    };
    const cancelAvatar = () => {
        setAvatarFile(null);
        setAvatarPreview(null);
    };

    // Obtener URL del avatar actual
    const avatarUrl = auth.user?.avatar_url;

    return (
        <PasanteLayout auth={auth}>
            <div className="max-w-4xl mx-auto">
                {/* Mensajes flash */}
                {flash?.success && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                        {flash.success}
                    </div>
                )}
                {/* Sección Avatar */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                    <div className="bg-gradient-to-r from-primary-navy to-primary-blue px-6 py-4">
                        <h2 className="text-xl font-semibold text-white">
                            Foto de Perfil
                        </h2>
                        <p className="text-primary-sky-blue text-sm">
                            Tu imagen personal
                        </p>
                    </div>
                    <div className="p-6 flex flex-col items-center">
                        <div className="relative">
                            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary-blue to-primary-sky-blue flex items-center justify-center text-white text-3xl font-bold shadow-md overflow-hidden">
                                {avatarPreview ? (
                                    <img
                                        src={avatarPreview}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                ) : avatarUrl ? (
                                    <img
                                        src={avatarUrl}
                                        alt="Avatar"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span>
                                        {user.nombre?.charAt(0)}
                                        {user.ap_paterno?.charAt(0)}
                                    </span>
                                )}
                            </div>
                            <label className="absolute bottom-0 right-0 p-1.5 bg-primary-blue rounded-full cursor-pointer hover:bg-primary-sky-blue transition shadow-md">
                                <Camera size={16} className="text-white" />
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/jpeg,image/png"
                                    onChange={handleAvatarChange}
                                />
                            </label>
                        </div>

                        {avatarFile && (
                            <div className="mt-4 flex gap-3">
                                <button
                                    onClick={handleAvatarSubmit}
                                    disabled={subiendoAvatar}
                                    className="px-4 py-2 bg-primary-blue text-white text-sm rounded-lg hover:bg-primary-sky-blue transition"
                                >
                                    {subiendoAvatar
                                        ? "Subiendo..."
                                        : "Guardar foto"}
                                </button>
                                <button
                                    onClick={cancelAvatar}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-400 transition"
                                >
                                    Cancelar
                                </button>
                            </div>
                        )}

                        <p className="text-xs text-gray-400 mt-3">
                            Formatos: JPG, PNG | Máximo: 2MB
                        </p>
                    </div>
                </div>
                {/* Formulario */}
                <form
                    onSubmit={handleSubmit}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                >
                    <div className="bg-gradient-to-r from-primary-navy to-primary-blue px-6 py-4">
                        <h2 className="text-xl font-semibold text-white">
                            Mi Perfil
                        </h2>
                        <p className="text-primary-sky-blue text-sm">
                            Datos personales y académicos
                        </p>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Datos Personales */}
                        <div className="bg-gray-50 rounded-lg p-5">
                            <h3 className="text-md font-semibold text-primary-navy mb-4 flex items-center gap-2 border-b pb-2">
                                <User size={18} className="text-primary-blue" />
                                Datos Personales
                            </h3>
                            <div className="grid md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Apellido Paterno{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="ap_paterno"
                                        value={form.ap_paterno}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 disabled:bg-gray-100 disabled:text-gray-500 transition-all"
                                    />
                                    {errors.ap_paterno && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.ap_paterno}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Apellido Materno{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="ap_materno"
                                        value={form.ap_materno}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 disabled:bg-gray-100 disabled:text-gray-500 transition-all"
                                    />
                                    {errors.ap_materno && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.ap_materno}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nombres{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="nombre"
                                        value={form.nombre}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 disabled:bg-gray-100 disabled:text-gray-500 transition-all"
                                    />
                                    {errors.nombre && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.nombre}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        CI{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="ci"
                                        value={form.ci}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 disabled:bg-gray-100 disabled:text-gray-500 transition-all"
                                    />
                                    {errors.ci && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.ci}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Fecha de Nacimiento{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        name="fecha_nac"
                                        value={form.fecha_nac}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 disabled:bg-gray-100 disabled:text-gray-500 transition-all"
                                    />
                                    {errors.fecha_nac && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.fecha_nac}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Datos Académicos */}
                        <div className="bg-gray-50 rounded-lg p-5">
                            <h3 className="text-md font-semibold text-primary-navy mb-4 flex items-center gap-2 border-b pb-2">
                                <GraduationCap
                                    size={18}
                                    className="text-primary-blue"
                                />
                                Datos Académicos
                            </h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Mención{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    {isEditing ? (
                                        <select
                                            name="mencion"
                                            value={form.mencion}
                                            onChange={handleChange}
                                            className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 transition-all"
                                        >
                                            <option value="">
                                                Seleccionar mención
                                            </option>
                                            {MENCIONES.map((m) => (
                                                <option key={m} value={m}>
                                                    {m}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input
                                            type="text"
                                            value={form.mencion}
                                            disabled
                                            className="w-full rounded-lg border-2 border-gray-200 bg-gray-100 px-4 py-2.5 text-gray-500"
                                        />
                                    )}
                                    {errors.mencion && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.mencion}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Semestre{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    {isEditing ? (
                                        <select
                                            name="semestre"
                                            value={form.semestre}
                                            onChange={handleChange}
                                            className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 transition-all"
                                        >
                                            <option value="">
                                                Seleccionar semestre
                                            </option>
                                            {SEMESTRES.map((s) => (
                                                <option key={s} value={s}>
                                                    {s}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input
                                            type="text"
                                            value={form.semestre}
                                            disabled
                                            className="w-full rounded-lg border-2 border-gray-200 bg-gray-100 px-4 py-2.5 text-gray-500"
                                        />
                                    )}
                                    {errors.semestre && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.semestre}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Matrícula{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="matricula"
                                        value={form.matricula}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 disabled:bg-gray-100 disabled:text-gray-500 transition-all"
                                    />
                                    {errors.matricula && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.matricula}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        RU (Registro Universitario){" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="ru"
                                        value={form.ru}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 disabled:bg-gray-100 disabled:text-gray-500 transition-all"
                                    />
                                    {errors.ru && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.ru}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Contacto */}
                        <div className="bg-gray-50 rounded-lg p-5">
                            <h3 className="text-md font-semibold text-primary-navy mb-4 flex items-center gap-2 border-b pb-2">
                                <Phone
                                    size={18}
                                    className="text-primary-blue"
                                />
                                Contacto
                            </h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Número de Celular{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="numero_cel"
                                        value={form.numero_cel}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 disabled:bg-gray-100 disabled:text-gray-500 transition-all"
                                    />
                                    {errors.numero_cel && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.numero_cel}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Correo Electrónico
                                    </label>
                                    <input
                                        type="email"
                                        value={user.correo}
                                        disabled
                                        className="w-full rounded-lg border-2 border-gray-200 bg-gray-100 px-4 py-2.5 text-gray-500"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">
                                        El correo se edita en "Mi Cuenta"
                                    </p>
                                </div>
                            </div>
                        </div>
                        {/* Botón volver */}
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
                                    Editar Perfil
                                </button>
                            )}
                        </div>
                        {/* Botones de acción */}
                        {isEditing && (
                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={handleCancel}
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

            {/* Modal de confirmación al salir */}
            <ModalConfirmacion
                isOpen={showConfirmClose}
                onClose={() => setShowConfirmClose(false)}
                onConfirm={() => handleConfirmClose(true)}
                onCancel={() => handleConfirmClose(false)}
                titulo="Cambios sin guardar"
                mensaje="Tienes cambios sin guardar en tu perfil. ¿Deseas guardarlos antes de salir?"
                confirmText="Guardar y salir"
                cancelText="Salir sin guardar"
                type="warning"
            />
        </PasanteLayout>
    );
}
