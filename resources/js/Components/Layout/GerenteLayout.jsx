import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import { menuGerente } from "@/Config/menuGerente";
import { ChevronLeft, ChevronRight, Menu, X } from "lucide-react";

export default function GerenteLayout({ children, auth }) {
    const [collapsed, setCollapsed] = useState(false);
    const [openMenus, setOpenMenus] = useState({});
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const toggleMenu = (menuName) => {
        setOpenMenus((prev) => ({ ...prev, [menuName]: !prev[menuName] }));
    };

    const handleLogout = () => {
        router.post(route("logout"));
    };

    const handleAction = (action) => {
        if (action === "logout") {
            handleLogout();
        }
    };

    const renderMenuItem = (item) => {
        const Icon = item.icon;
        const isOpen = openMenus[item.name];

        if (item.single) {
            return (
                <Link
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-primary-blue/20 hover:text-white rounded-lg transition-colors"
                >
                    <Icon size={20} />
                    {!collapsed && <span>{item.name}</span>}
                </Link>
            );
        }

        if (item.submenus) {
            return (
                <div>
                    <button
                        onClick={() => toggleMenu(item.name)}
                        className="w-full flex items-center justify-between px-4 py-3 text-gray-300 hover:bg-primary-blue/20 hover:text-white rounded-lg transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <Icon size={20} />
                            {!collapsed && <span>{item.name}</span>}
                        </div>
                        {!collapsed && (
                            <ChevronRight
                                size={16}
                                className={`transition-transform ${isOpen ? "rotate-90" : ""}`}
                            />
                        )}
                    </button>

                    {!collapsed && isOpen && (
                        <div className="ml-8 mt-1 space-y-1">
                            {item.submenus.map((sub, idx) => {
                                const SubIcon = sub.icon;
                                if (sub.action) {
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() =>
                                                handleAction(sub.action)
                                            }
                                            className="w-full flex items-center gap-3 px-4 py-2 text-gray-400 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-colors"
                                        >
                                            <SubIcon size={16} />
                                            <span className="text-sm">
                                                {sub.name}
                                            </span>
                                        </button>
                                    );
                                }
                                return (
                                    <Link
                                        key={idx}
                                        href={sub.href}
                                        className="flex items-center gap-3 px-4 py-2 text-gray-400 hover:bg-primary-blue/20 hover:text-white rounded-lg transition-colors"
                                    >
                                        <SubIcon size={16} />
                                        <span className="text-sm">
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

    // Sidebar content (reutilizable para escritorio y móvil)
    const SidebarContent = ({ onItemClick }) => (
        <div className="flex flex-col h-full">
            {/* Logo y toggle */}
            <div className="flex items-center justify-between p-5 border-b border-primary-slate">
                {!collapsed && (
                    <div className="flex items-center gap-3">
                        <img
                            src="/images/logo.png"
                            alt="Logo"
                            className="h-12 w-auto rounded-full border-0 border-white"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.style.display = "none";
                            }}
                        />
                        <div className="flex flex-col items-center leading-tight">
                            <h3 className="text-white font-bold text-lg">
                                SGP
                            </h3>
                            <span className="text-white font-bold text-lg">
                                GERENTE
                            </span>
                        </div>
                    </div>
                )}
                {collapsed && (
                    <img
                        src="/images/logo.png"
                        alt="Logo"
                        className="h-7 w-auto mx-auto rounded-full border-0 border-white"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = "none";
                        }}
                    />
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-1 rounded-lg hover:bg-primary-blue/20 text-gray-300"
                >
                    {collapsed ? (
                        <ChevronRight size={20} />
                    ) : (
                        <ChevronLeft size={20} />
                    )}
                </button>
            </div>

            {/* Menú navegación */}
            <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
                {menuGerente.map((item, idx) => (
                    <div key={idx} onClick={onItemClick}>
                        {renderMenuItem(item)}
                    </div>
                ))}
            </nav>

            {/* Usuario actual */}
            {!collapsed && (
                <div className="p-4 border-t border-primary-slate">
                    <p className="text-gray-400 text-sm">Conectado como</p>
                    <p className="text-white font-medium">
                        {auth.user.nombre_user}
                    </p>
                    <p className="text-primary-sky-blue text-xs">Gerente</p>
                </div>
            )}
        </div>
    );

    return (
        <>
            <Head title="Gerente" />
            <div className="min-h-screen bg-gray-100 flex">
                {/* Sidebar para escritorio (siempre visible) */}
                <aside
                    className={`hidden lg:block bg-primary-navy min-h-screen transition-all duration-300 ${
                        collapsed ? "w-20" : "w-64"
                    }`}
                >
                    <SidebarContent />
                </aside>

                {/* Sidebar para móvil (overlay) */}
                {mobileMenuOpen && (
                    <div className="fixed inset-0 z-40 lg:hidden">
                        <div
                            className="fixed inset-0 bg-black/50"
                            onClick={() => setMobileMenuOpen(false)}
                        />
                        <div className="relative flex h-full w-64 max-w-xs">
                            <aside className="bg-primary-navy h-full w-full">
                                <div className="flex justify-end p-2">
                                    <button
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="text-white hover:bg-white/20 p-2 rounded-lg"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                                <SidebarContent
                                    onItemClick={() => setMobileMenuOpen(false)}
                                />
                            </aside>
                        </div>
                    </div>
                )}

                {/* Contenido principal */}
                <main className="flex-1 flex flex-col min-w-0">
                    {/* Header móvil con botón hamburguesa */}
                    <div className="lg:hidden bg-white shadow-sm p-4 flex items-center">
                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            className="text-primary-slate"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                        <span className="ml-3 font-semibold text-lg">
                            SGP - Gerente
                        </span>
                    </div>

                    <div className="flex-1 p-6 overflow-x-auto">{children}</div>
                </main>
            </div>
        </>
    );
}
