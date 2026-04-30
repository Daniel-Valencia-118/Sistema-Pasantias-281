import React, { useState } from "react";
import { router } from "@inertiajs/react";
import GerenteLayout from "@/Components/Layout/GerenteLayout";
import {
    User,
    Phone,
    Mail,
    Calendar,
    Briefcase,
    Tag,
    Key,
    ArrowLeft,
    Save,
} from "lucide-react";

export default function Create({ auth }) {
    const [form, setForm] = useState({
        ap_paterno: "",
        ap_materno: "",
        nombre: "",
        ci: "",
        numero_cel: "",
        fecha_nac: "",
        area: "",
        cargo: "",
        nombre_user: "",
        correo: "",
        password: "",
        password_confirmation: "",
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        // Limpiar error del campo
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: null });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        router.post("/gerente/jefes", form, {
            onSuccess: () => {
                // Redirigir a lista de jefes
                router.visit("/gerente/jefes");
            },
            onError: (error) => {
                setErrors(error);
                setLoading(false);
            },
        });
    };

    const goBack = () => {
        window.history.back();
    };

    return (
        <GerenteLayout auth={auth}>
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <button
                        onClick={goBack}
                        className="flex items-center gap-2 text-primary-slate hover:text-primary-blue transition-colors cursor-pointer"
                    >
                        <ArrowLeft size={20} />
                        <span>Volver</span>
                    </button>
                    <h1 className="text-2xl font-bold text-primary-navy">
                        Registrar Nuevo Jefe
                    </h1>
                </div>

                {/* Formulario */}
                <form
                    onSubmit={handleSubmit}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                >
                    <div className="bg-gradient-to-r from-primary-navy to-primary-blue px-6 py-4">
                        <h2 className="text-xl font-semibold text-white">
                            Datos del Jefe de Pasante
                        </h2>
                        <p className="text-primary-sky-blue text-sm">
                            Complete todos los campos obligatorios (*)
                        </p>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Datos personales */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="font-semibold text-primary-navy mb-4 flex items-center gap-2 border-b pb-2">
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
                                        required
                                        className="w-full rounded-lg border-gray-200 px-4 py-2 focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 transition-all"
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
                                        required
                                        className="w-full rounded-lg border-gray-200 px-4 py-2 focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 transition-all"
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
                                        required
                                        className="w-full rounded-lg border-gray-200 px-4 py-2 focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 transition-all"
                                    />
                                    {errors.nombre && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.nombre}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Documentos y contacto */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="font-semibold text-primary-navy mb-4 flex items-center gap-2 border-b pb-2">
                                <Tag size={18} className="text-primary-blue" />
                                Documentos y Contacto
                            </h3>
                            <div className="grid md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Carnet de Identidad{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="ci"
                                        value={form.ci}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-lg border-gray-200 px-4 py-2 focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 transition-all"
                                    />
                                    {errors.ci && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.ci}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Celular{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="numero_cel"
                                        value={form.numero_cel}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-lg border-gray-200 px-4 py-2 focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 transition-all"
                                    />
                                    {errors.numero_cel && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.numero_cel}
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
                                        required
                                        className="w-full rounded-lg border-gray-200 px-4 py-2 focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 transition-all"
                                    />
                                    {errors.fecha_nac && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.fecha_nac}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Datos laborales */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="font-semibold text-primary-navy mb-4 flex items-center gap-2 border-b pb-2">
                                <Briefcase
                                    size={18}
                                    className="text-primary-blue"
                                />
                                Datos Laborales
                            </h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Área de Trabajo
                                    </label>
                                    <input
                                        type="text"
                                        name="area"
                                        value={form.area}
                                        onChange={handleChange}
                                        className="w-full rounded-lg border-gray-200 px-4 py-2 focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 transition-all"
                                    />
                                    {errors.area && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.area}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Cargo{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="cargo"
                                        value={form.cargo}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-lg border-gray-200 px-4 py-2 focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 transition-all"
                                    />
                                    {errors.cargo && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.cargo}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Datos de cuenta */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="font-semibold text-primary-navy mb-4 flex items-center gap-2 border-b pb-2">
                                <Mail size={18} className="text-primary-blue" />
                                Datos de Cuenta
                            </h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nombre de Usuario{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="nombre_user"
                                        value={form.nombre_user}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-lg border-gray-200 px-4 py-2 focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 transition-all"
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
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="correo"
                                        value={form.correo}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-lg border-gray-200 px-4 py-2 focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 transition-all"
                                    />
                                    {errors.correo && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.correo}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Contraseña */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="font-semibold text-primary-navy mb-4 flex items-center gap-2 border-b pb-2">
                                <Key size={18} className="text-primary-blue" />
                                Seguridad
                            </h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Contraseña{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={form.password}
                                        onChange={handleChange}
                                        required
                                        minLength={6}
                                        className="w-full rounded-lg border-gray-200 px-4 py-2 focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 transition-all"
                                    />
                                    {errors.password && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.password}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Confirmar Contraseña{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        name="password_confirmation"
                                        value={form.password_confirmation}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-lg border-gray-200 px-4 py-2 focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Botones */}
                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <button
                                type="button"
                                onClick={goBack}
                                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center gap-2 bg-primary-blue text-white px-6 py-2 rounded-lg hover:bg-primary-sky-blue transition-all cursor-pointer disabled:opacity-50"
                            >
                                <Save size={18} />
                                {loading ? "Registrando..." : "Registrar Jefe"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </GerenteLayout>
    );
}
