import React, { useState, useEffect } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import { menuConfig } from "@/Config/menuConfig";
import ApplicationLogo from "@/Components/ApplicationLogo";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export default function Sidebar({ auth, onClose }) {
    const [collapsed, setCollapsed] = useState(false);
    const [openMenus, setOpenMenus] = useState({});

    // Obtenemos la URL actual limpia (sin query strings)
    const { url } = usePage();
    const currentPath = url.split("?")[0];

    const role = auth?.user?.rol || "administrador";
    const menuItems = menuConfig[role] || [];

    // Función exacta para determinar si una ruta está activa
    const isActive = (href) => {
        if (!href) return false;
        if (href === "/") return currentPath === "/";
        return currentPath === href || currentPath.startsWith(href + "/");
    };

    // Efecto para auto-expandir el submenú activo
    useEffect(() => {
        setOpenMenus((prev) => {
            const updatedState = { ...prev };
            menuItems.forEach((item) => {
                if (item.submenus) {
                    const hasActiveSub = item.submenus.some(
                        (sub) => sub.href && isActive(sub.href)
                    );
                    if (hasActiveSub) {
                        updatedState[item.name] = true;
                    }
                }
            });
            return updatedState;
        });
    }, [currentPath, role]);

    const toggleMenu = (menuName) => {
        setOpenMenus((prev) => ({ ...prev, [menuName]: !prev[menuName] }));
    };

    const handleLogout = () => {
        router.post(route("logout"));
    };

    const renderMenuItem = (item) => {
        const Icon = item.icon;
        const isOpen = openMenus[item.name];
        const active = item.single && isActive(item.href);

        if (item.single) {
            return (
                <Link
                    href={item.href}
                    title={collapsed ? item.name : ""}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 mx-2
                        ${
                            active
                                ? "bg-primary-blue text-white shadow-md"
                                : "text-gray-300 hover:bg-primary-blue/20 hover:text-white"
                        }`}
                >
                    <Icon size={20} className={active ? "text-white" : ""} />
                    {!collapsed && (
                        <span className="font-medium">{item.name}</span>
                    )}
                </Link>
            );
        }

        if (item.submenus) {
            const isSubMenuActive = item.submenus.some(
                (sub) => sub.href && isActive(sub.href)
            );

            return (
                <div className="mx-2">
                    <button
                        onClick={() => toggleMenu(item.name)}
                        title={collapsed ? item.name : ""}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200
                            ${
                                isSubMenuActive
                                    ? "text-white bg-primary-blue/15 font-semibold"
                                    : "text-gray-300 hover:bg-primary-blue/20 hover:text-white"
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <Icon
                                size={20}
                                className={
                                    isSubMenuActive
                                        ? "text-primary-sky-blue"
                                        : ""
                                }
                            />
                            {!collapsed && (
                                <span className="font-medium text-left">
                                    {item.name}
                                </span>
                            )}
                        </div>
                        {!collapsed && (
                            <ChevronRight
                                size={16}
                                className={`transition-transform duration-200 ${
                                    isOpen ? "rotate-90" : ""
                                }`}
                            />
                        )}
                    </button>

                    {!collapsed && isOpen && (
                        <div className="ml-9 mt-1 mb-2 space-y-1 border-l border-gray-600 pl-2">
                            {item.submenus.map((sub, idx) => {
                                const SubIcon = sub.icon;

                                if (sub.action === "logout") {
                                    return (
                                        <button
                                            key={`${item.name}-sub-${idx}`}
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-3 py-2 text-gray-400 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-colors"
                                        >
                                            <SubIcon size={16} />
                                            <span className="text-sm font-medium">
                                                {sub.name}
                                            </span>
                                        </button>
                                    );
                                }

                                const subActive = isActive(sub.href);
                                return (
                                    <Link
                                        key={`${item.name}-sub-${idx}`}
                                        href={sub.href}
                                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                                            ${
                                                subActive
                                                    ? "text-primary-sky-blue bg-primary-blue/10 font-medium"
                                                    : "text-gray-400 hover:bg-primary-blue/20 hover:text-white"
                                            }`}
                                    >
                                        <SubIcon size={16} />
                                        <span className="text-sm font-medium">
                                            {sub.name}
                                        </span>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            );
        }
        return null;
    };

    return (
        /* CAMBIO CRÍTICO AQUÍ: h-screen y sticky top-0 obligan al Sidebar a medir el alto de la pantalla */
        <aside
            className={`bg-primary-navy h-screen sticky top-0 transition-all duration-300 ${
                collapsed ? "w-20" : "w-72"
            }`}
        >
            <div className="flex flex-col h-full relative">
                {/* Botón cerrar para móvil */}
                <button
                    onClick={onClose}
                    className="lg:hidden absolute right-4 top-4 text-gray-400 hover:text-white"
                >
                    <X size={24} />
                </button>

                {/* HEADER SIDEBAR */}
                <div className="flex items-center justify-between p-4 border-b border-gray-700/50 min-h-[72px]">
                    {!collapsed ? (
                        <div className="flex items-center gap-3 overflow-hidden">
                            <ApplicationLogo className="transform scale-70" showText={false} />
                            <div className="flex flex-col leading-tight truncate">
                                <h3 className="text-white font-bold text-lg tracking-wide">
                                    SGP
                                </h3>
                                <span className="text-primary-sky-blue font-semibold text-xs uppercase tracking-wider truncate">
                                    {role.replace("_", " ")}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-center">
                            <ApplicationLogo className="transform scale-70" showText={false} />
                        </div>
                    )}

                    {/* Botón de Colapso */}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="hidden lg:flex absolute -right-3 top-6 bg-primary-blue text-white p-1 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
                    >
                        {collapsed ? (
                            <ChevronRight size={16} />
                        ) : (
                            <ChevronLeft size={16} />
                        )}
                    </button>
                </div>

                {/* NAV: Gracias a flex-1 y overflow-y-auto, solo esta zona tendrá scroll si hay muchos elementos */}
                <nav className="flex-1 py-6 space-y-2 overflow-y-auto scrollbar-hide">
                    {menuItems.map((item, idx) => (
                        <div key={`menu-item-${idx}`}>
                            {renderMenuItem(item)}
                        </div>
                    ))}
                </nav>

                {/* FOOTER SIDEBAR: Ahora se quedará siempre fijo abajo */}
                <div className="p-4 border-t border-gray-700/50 bg-black/10">
                    {!collapsed ? (
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-blue to-primary-sky-blue flex items-center justify-center text-white font-bold overflow-hidden">
                                {auth.user?.avatar_url ? (
                                    <img
                                        src={auth.user.avatar_url}
                                        alt="Avatar"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span>
                                        {auth?.user?.nombre_user?.charAt(0).toUpperCase() || "U"}
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-col truncate">
                                <p className="text-white font-medium text-sm truncate">
                                    {auth?.user?.nombre_user}
                                </p>
                                <p className="text-gray-400 text-xs truncate">
                                    Conectado
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-center">
                            <div
                                className="h-8 w-8 rounded-full bg-primary-blue flex items-center justify-center text-white font-bold"
                                title={auth?.user?.nombre_user}
                            >
                                {auth?.user?.nombre_user
                                    ?.charAt(0)
                                    .toUpperCase() || "U"}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
}