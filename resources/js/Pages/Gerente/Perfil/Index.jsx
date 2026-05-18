import React, { useState } from "react";
import { router, usePage } from "@inertiajs/react";
import GerenteLayout from "@/Components/Layout/GerenteLayout";
import {
    User,
    Mail,
    Phone,
    Calendar,
    ArrowLeft,
    Save,
    Edit2,
    X,
    Camera,
} from "lucide-react";

export default function Index({ auth, user, gerente }) {
    const [isEditing, setIsEditing] = useState(false);

    const formatDateForInput = (date) => {
        if (!date) return "";
        if (date.match(/^\d{4}-\d{2}-\d{2}$/)) return date;
        return new Date(date).toISOString().split("T")[0];
    };

    const [form, setForm] = useState({
        nombre: user.nombre,
        ap_paterno: user.ap_paterno,
        ap_materno: user.ap_materno,
        ci: user.ci,
        numero_cel: user.numero_cel,
        correo: user.correo,
        fecha_nac: formatDateForInput(user.fecha_nac),
        nro_secun: gerente.nro_secun || "",
    });

    const { flash } = usePage().props;

    // AVATAR
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const [subiendoAvatar, setSubiendoAvatar] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        router.put("/gerente/perfil", form, {
            onSuccess: () => setIsEditing(false),
        });
    };

    const goBack = () => window.history.back();

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
        <GerenteLayout auth={auth}>
            <div className="max-w-4xl mx-auto">
                {/* Mensaje de éxito */}
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
                {/* Tarjeta de perfil */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-primary-navy to-primary-blue px-6 py-4">
                        <h2 className="text-xl font-semibold text-white">
                            Datos Personales
                        </h2>
                        <p className="text-primary-sky-blue text-sm">
                            Información Personal
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6">
                        <div className="space-y-1">
                            {/* Datos Personales */}
                            <div className="bg-gray-50 rounded-lg p-5">
                                <h3 className="text-md font-semibold text-primary-navy mb-4 flex items-center gap-2 border-b pb-2">
                                    <User
                                        size={18}
                                        className="text-primary-blue"
                                    />
                                    Información Básica
                                </h3>
                                <div className="grid md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Apellido Paterno{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            name="ap_paterno"
                                            value={form.ap_paterno}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 disabled:bg-gray-100 disabled:text-gray-500 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Apellido Materno{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            name="ap_materno"
                                            value={form.ap_materno}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 disabled:bg-gray-100 disabled:text-gray-500 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nombres{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            name="nombre"
                                            value={form.nombre}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 disabled:bg-gray-100 disabled:text-gray-500 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Documentos */}
                            <div className="bg-gray-50 rounded-lg p-5">
                                <h3 className="text-md font-semibold text-primary-navy mb-4 flex items-center gap-2 border-b pb-2">
                                    <Calendar
                                        size={18}
                                        className="text-primary-blue"
                                    />
                                    Documentos
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Carnet de Identidad{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            name="ci"
                                            value={form.ci}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 disabled:bg-gray-100 disabled:text-gray-500 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Fecha de Nacimiento{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>
                                        <input
                                            type="date"
                                            name="fecha_nac"
                                            value={form.fecha_nac}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 disabled:bg-gray-100 disabled:text-gray-500 transition-all"
                                        />
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
                                            Celular{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            name="numero_cel"
                                            value={form.numero_cel}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 disabled:bg-gray-100 disabled:text-gray-500 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Celular Secundario
                                        </label>
                                        <input
                                            type="text"
                                            name="nro_secun"
                                            value={form.nro_secun}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 disabled:bg-gray-100 disabled:text-gray-500 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="bg-gray-50 rounded-lg p-5">
                                <h3 className="text-md font-semibold text-primary-navy mb-4 flex items-center gap-2 border-b pb-2">
                                    <Mail
                                        size={18}
                                        className="text-primary-blue"
                                    />
                                    Correo Electrónico
                                </h3>
                                <div className="grid md:grid-cols-1 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Correo{" "}
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
                                    </div>
                                </div>
                            </div>
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
                                        Editar Perfil
                                    </button>
                                )}
                            </div>
                            {/* Botones */}
                            {isEditing && (
                                <div className="flex justify-end gap-3 pt-4 border-t">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
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
