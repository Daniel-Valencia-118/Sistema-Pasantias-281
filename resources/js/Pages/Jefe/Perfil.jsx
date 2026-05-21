import React, { useState } from "react";
import { Head, useForm, usePage } from "@inertiajs/react";
import DashboardLayout from "@/Components/Layout/DashboardLayout";
import Breadcrumbs from "@/Components/Breadcrumbs";
import InputError from "@/Components/InputError";
import axios from "axios";
import {
    User,
    Mail,
    Phone,
    Briefcase,
    Lock,
    Save,
    Edit2,
    X,
    Camera,
} from "lucide-react";

export default function Perfil({ usuario, jefe, auth }) {
    const [isEditing, setIsEditing] = useState(false);
    const [cambiandoPassword, setCambiandoPassword] = useState(false);

    // Formulario principal usando useForm de Inertia
    const { data, setData, put, processing, errors, reset } = useForm({
        nombre: usuario.nombre || "",
        ap_paterno: usuario.ap_paterno || "",
        ap_materno: usuario.ap_materno || "",
        ci: usuario.ci || "",
        numero_cel: usuario.numero_cel || "",
        correo: usuario.correo || "",
        cargo: jefe.cargo || "",
        area: jefe.area || "",
        password_actual: "",
        password: "",
        password_confirmation: "",
    });

    const { flash } = usePage().props;

    // ESTADOS PARA EL AVATAR
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const [subiendoAvatar, setSubiendoAvatar] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        put("/jefe/perfil", {
            onSuccess: () => {
                setIsEditing(false);
                setCambiandoPassword(false);
                reset("password_actual", "password", "password_confirmation");
            },
        });
    };

    // =============================================
    // Funciones para gestión del Avatar
    // =============================================
    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.match("image/jpeg") && !file.type.match("image/png")) {
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

    const avatarUrl = auth.user?.avatar_url;
    const breadcrumbs = [
        { label: "Inicio", href: "/jefe" },
        { label: "Perfil" },
    ];

    return (
        <DashboardLayout auth={auth}>
            <Head title="Mi Perfil" />
            <Breadcrumbs items={breadcrumbs} />

            <div className="max-w-4xl mx-auto mt-4">
                {/* Mensaje de éxito */}
                {flash?.success && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg shadow-sm">
                        {flash.success}
                    </div>
                )}

                {/* Sección de Avatar (Foto de Perfil) */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                    <div className="bg-gradient-to-r from-primary-navy to-primary-blue px-6 py-4">
                        <h2 className="text-xl font-semibold text-white">Foto de Perfil</h2>
                        <p className="text-primary-sky-blue text-sm">Tu imagen de identidad en la plataforma</p>
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
                                    <span className="uppercase">
                                        {usuario.nombre?.charAt(0)}
                                        {usuario.ap_paterno?.charAt(0)}
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
                                    className="px-4 py-2 bg-primary-blue text-white text-sm rounded-lg hover:bg-primary-sky-blue transition disabled:opacity-50"
                                >
                                    {subiendoAvatar ? "Subiendo..." : "Guardar foto"}
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

                {/* Tarjeta de Datos Personales y Laborales */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                    <div className="bg-gradient-to-r from-primary-navy to-primary-blue px-6 py-4 flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-semibold text-white">Datos del Perfil</h2>
                            <p className="text-primary-sky-blue text-sm">Información personal y de la empresa</p>
                        </div>
                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 bg-white/10 text-white backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-white/20 transition-colors text-sm font-medium border border-white/20"
                            >
                                <Edit2 size={16} />
                                Editar Perfil
                            </button>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* 1. INFORMACIÓN BÁSICA */}
                        <div className="bg-gray-50 rounded-lg p-5">
                            <h3 className="text-md font-semibold text-primary-navy mb-4 flex items-center gap-2 border-b pb-2">
                                <User size={18} className="text-primary-blue" />
                                Información Básica
                            </h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                                    <input
                                        type="text"
                                        value={data.nombre}
                                        onChange={(e) => setData("nombre", e.target.value)}
                                        disabled={!isEditing}
                                        className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 disabled:bg-gray-100 disabled:text-gray-500 transition-all"
                                        required
                                    />
                                    <InputError message={errors.nombre} className="mt-1" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Apellido Paterno</label>
                                    <input
                                        type="text"
                                        value={data.ap_paterno}
                                        onChange={(e) => setData("ap_paterno", e.target.value)}
                                        disabled={!isEditing}
                                        className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 disabled:bg-gray-100 disabled:text-gray-500 transition-all"
                                        required
                                    />
                                    <InputError message={errors.ap_paterno} className="mt-1" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Apellido Materno</label>
                                    <input
                                        type="text"
                                        value={data.ap_materno}
                                        onChange={(e) => setData("ap_materno", e.target.value)}
                                        disabled={!isEditing}
                                        className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 disabled:bg-gray-100 disabled:text-gray-500 transition-all"
                                    />
                                    <InputError message={errors.ap_materno} className="mt-1" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Nombre de Usuario (No modificable)</label>
                                    <input
                                        type="text"
                                        value={usuario.nombre_user}
                                        disabled
                                        className="w-full rounded-lg border-2 border-gray-200 bg-gray-100 text-gray-400 px-4 py-2.5 cursor-not-allowed select-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 2. CONTACTO Y DOCUMENTACIÓN */}
                        <div className="bg-gray-50 rounded-lg p-5">
                            <h3 className="text-md font-semibold text-primary-navy mb-4 flex items-center gap-2 border-b pb-2">
                                <Phone size={18} className="text-primary-blue" />
                                Contacto y Documentos
                            </h3>
                            <div className="grid md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Carnet de Identidad</label>
                                    <input
                                        type="text"
                                        value={data.ci}
                                        onChange={(e) => setData("ci", e.target.value)}
                                        disabled={!isEditing}
                                        className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 disabled:bg-gray-100 disabled:text-gray-500 transition-all"
                                        required
                                    />
                                    <InputError message={errors.ci} className="mt-1" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Celular</label>
                                    <input
                                        type="text"
                                        value={data.numero_cel}
                                        onChange={(e) => setData("numero_cel", e.target.value)}
                                        disabled={!isEditing}
                                        className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 disabled:bg-gray-100 disabled:text-gray-500 transition-all"
                                        required
                                    />
                                    <InputError message={errors.numero_cel} className="mt-1" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                                    <input
                                        type="email"
                                        value={data.correo}
                                        onChange={(e) => setData("correo", e.target.value)}
                                        disabled={!isEditing}
                                        className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 disabled:bg-gray-100 disabled:text-gray-500 transition-all"
                                        required
                                    />
                                    <InputError message={errors.correo} className="mt-1" />
                                </div>
                            </div>
                        </div>

                        {/* 3. INFORMACIÓN LABORAL */}
                        <div className="bg-gray-50 rounded-lg p-5">
                            <h3 className="text-md font-semibold text-primary-navy mb-4 flex items-center gap-2 border-b pb-2">
                                <Briefcase size={18} className="text-primary-blue" />
                                Información Laboral
                            </h3>
                            <div className="grid md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Empresa (No modificable)</label>
                                    <input
                                        type="text"
                                        value={jefe.empresa}
                                        disabled
                                        className="w-full rounded-lg border-2 border-gray-200 bg-gray-100 text-gray-400 px-4 py-2.5 cursor-not-allowed select-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
                                    <input
                                        type="text"
                                        value={data.cargo}
                                        onChange={(e) => setData("cargo", e.target.value)}
                                        disabled={!isEditing}
                                        className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 disabled:bg-gray-100 disabled:text-gray-500 transition-all"
                                        placeholder="No definido"
                                    />
                                    <InputError message={errors.cargo} className="mt-1" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Área</label>
                                    <input
                                        type="text"
                                        value={data.area}
                                        onChange={(e) => setData("area", e.target.value)}
                                        disabled={!isEditing}
                                        className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 disabled:bg-gray-100 disabled:text-gray-500 transition-all"
                                        placeholder="No definida"
                                    />
                                    <InputError message={errors.area} className="mt-1" />
                                </div>
                            </div>
                        </div>

                        {/* 4. SEGURIDAD / CONTRASEÑA */}
                        {isEditing && (
                            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => setCambiandoPassword(!cambiandoPassword)}
                                    className="flex items-center gap-2 text-primary-blue hover:text-primary-sky-blue font-semibold transition-colors text-sm"
                                >
                                    <Lock size={16} />
                                    {cambiandoPassword ? "Cancelar cambio de contraseña" : "🔒 Deseas cambiar tu contraseña?"}
                                </button>

                                {cambiandoPassword && (
                                    <div className="grid md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200/60 animate-fadeIn">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña Actual</label>
                                            <input
                                                type="password"
                                                value={data.password_actual}
                                                onChange={(e) => setData("password_actual", e.target.value)}
                                                className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 transition-all"
                                            />
                                            <InputError message={errors.password_actual} className="mt-1" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
                                            <input
                                                type="password"
                                                value={data.password}
                                                onChange={(e) => setData("password", e.target.value)}
                                                className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 transition-all"
                                            />
                                            <InputError message={errors.password} className="mt-1" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Nueva Contraseña</label>
                                            <input
                                                type="password"
                                                value={data.password_confirmation}
                                                onChange={(e) => setData("password_confirmation", e.target.value)}
                                                className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 transition-all"
                                            />
                                            <InputError message={errors.password_confirmation} className="mt-1" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* BOTONES DE ACCIÓN */}
                        {isEditing && (
                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setCambiandoPassword(false);
                                        reset();
                                    }}
                                    className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
                                >
                                    <X size={18} />
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex items-center gap-2 bg-primary-blue text-white px-5 py-2.5 rounded-lg hover:bg-primary-sky-blue transition-colors shadow-sm text-sm font-medium disabled:opacity-50"
                                >
                                    <Save size={18} />
                                    {processing ? "Guardando..." : "Guardar cambios"}
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}