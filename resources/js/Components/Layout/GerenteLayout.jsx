import React, { useState, useEffect, useRef } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { menuGerente } from "@/Config/menuGerente";
import axios from "axios";
import {
    ChevronLeft,
    ChevronRight,
    Menu,
    X,
    User,
    Bell,
    Home,
    CheckCheck,
    LogOut,
    Settings,
} from "lucide-react";

export default function GerenteLayout({ children }) {
    // Estados notificaciones
    const [notificaciones, setNotificaciones] = useState([]);
    const [noLeidas, setNoLeidas] = useState(0);
    const [notifOpen, setNotifOpen] = useState(false);
    const notifButtonRef = useRef(null);
    const notifDropdownRef = useRef(null);
    //-----------------------------
    const { auth } = usePage().props;
    const { url } = usePage();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    // ─── Fix #2: persistir openMenus en sessionStorage ────────────────────────
    // Sobrevive re-montajes de Inertia y el usuario conserva control total.
    const SESSION_KEY = "sgp_gerente_open_menus";

    const [openMenus, setOpenMenus] = useState(() => {
        try {
            return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "{}");
        } catch {
            return {};
        }
    });

    const saveMenus = (menus) => {
        try {
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(menus));
        } catch {}
    };

    // Cargar notificaciones
    const cargarNotificaciones = async () => {
        try {
            const response = await axios.get("/notificaciones");
            setNotificaciones(response.data.notificaciones);
            setNoLeidas(response.data.no_leidas);
        } catch (error) {
            console.error("Error:", error);
        }
    };
    // Marcar como leída
    const marcarLeida = async (id) => {
        try {
            await axios.patch(`/notificaciones/${id}/leer`);
            cargarNotificaciones();
        } catch (error) {
            console.error("Error:", error);
        }
    };
    // Marcar todas como leídas
    const marcarTodasLeidas = async () => {
        try {
            await axios.patch("/notificaciones/marcar-todas");
            cargarNotificaciones();
        } catch (error) {
            console.error("Error:", error);
        }
    };

    // ─── Fix #1: "mejor match gana" ───────────────────────────────────────────
    // Entre todos los hrefs candidatos que coincidan con la URL actual,
    // devuelve el más largo (más específico). Garantiza que dos submenús
    // que comparten prefijo NUNCA queden activos al mismo tiempo.
    const bestMatch = (hrefs) =>
        hrefs
            .filter((h) => h && (url === h || url.startsWith(h + "/")))
            .sort((a, b) => b.length - a.length)[0] ?? null;

    // isActive para ítems simples (sin competencia entre hermanos).
    const isActive = (href) => {
        if (!href) return false;
        if (href === "/gerente") return url === "/gerente";
        return url === href || url.startsWith(href + "/");
    };

    const handleLogout = () => router.post(route("logout"));

    const toggleMenu = (menuName) => {
        setOpenMenus((prev) => {
            const next = { ...prev, [menuName]: !prev[menuName] };
            saveMenus(next);
            return next;
        });
    };

    // Polling cada 30 segundos
    useEffect(() => {
        cargarNotificaciones();
        const interval = setInterval(cargarNotificaciones, 15000);
        return () => clearInterval(interval);
    }, []);
    // Cerrar dropdown al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                notifButtonRef.current &&
                !notifButtonRef.current.contains(event.target) &&
                notifDropdownRef.current &&
                !notifDropdownRef.current.contains(event.target)
            ) {
                setNotifOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    // Icono por tipo
    const getNotifIcon = (tipo) => {
        switch (tipo) {
            case "inscripcion":
                return "📋";
            case "cupos_completados":
                return "🏢";
            default:
                return "🔔";
        }
    };

    // • /gerente (home): cierra todos los despliegues → estado limpio al iniciar sesión.
    // • Resto de rutas: solo abre el menú padre de la ruta activa si aún no estaba abierto.
    //   Nunca cierra menús abiertos manualmente por el usuario.
    useEffect(() => {
        if (url === "/gerente") {
            setOpenMenus({});
            saveMenus({});
            return;
        }
        setOpenMenus((prev) => {
            const updates = {};
            menuGerente.forEach((item) => {
                if (
                    item.submenus &&
                    bestMatch(item.submenus.map((s) => s.href)) &&
                    !prev[item.name]
                ) {
                    updates[item.name] = true;
                }
            });
            if (Object.keys(updates).length === 0) return prev;
            const next = { ...prev, ...updates };
            saveMenus(next);
            return next;
        });
    }, [url]);

    const renderMenuItem = (item) => {
        const Icon = item.icon;
        const isOpen = openMenus[item.name];
        const itemActive = isActive(item.href);

        if (item.single) {
            return (
                <Link
                    href={item.href}
                    className={`group relative flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-all duration-200 ${
                        itemActive
                            ? "bg-primary-blue/20 text-white"
                            : "text-gray-300 hover:bg-primary-blue/20 hover:text-white"
                    }`}
                >
                    <Icon
                        size={20}
                        className={`${itemActive ? "text-white" : "group-hover:scale-110 transition-transform"}`}
                    />
                    {!collapsed && (
                        <span className="font-medium">{item.name}</span>
                    )}
                    {itemActive && (
                        <div className="absolute left-0 w-1 h-6 bg-primary-blue rounded-r-full" />
                    )}
                </Link>
            );
        }

        if (item.submenus) {
            // El href ganador es el más específico (más largo) que coincida con la URL.
            // Solo ese submenú queda marcado como activo; los demás hermanos, no.
            const activeSubHref = bestMatch(item.submenus.map((s) => s.href));
            const isSelected = itemActive || !!activeSubHref;

            return (
                <div className="px-2">
                    <button
                        onClick={() => toggleMenu(item.name)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
                            isSelected
                                ? "text-white"
                                : "text-gray-300 hover:bg-primary-blue/20 hover:text-white"
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <Icon size={20} />
                            {!collapsed && (
                                <span className="font-medium">{item.name}</span>
                            )}
                        </div>
                        {!collapsed && (
                            <ChevronRight
                                size={16}
                                className={`transition-transform duration-300 ${isOpen ? "rotate-90" : ""}`}
                            />
                        )}
                    </button>

                    <div
                        className={`grid transition-all duration-300 ease-in-out ${
                            !collapsed && isOpen
                                ? "grid-rows-[1fr] opacity-100"
                                : "grid-rows-[0fr] opacity-0"
                        }`}
                    >
                        <div className="overflow-hidden">
                            <div className="ml-8 mt-1 space-y-1">
                                {item.submenus.map((sub, idx) => {
                                    // Activo SOLO si este sub es exactamente el ganador
                                    const subActive =
                                        !!sub.href &&
                                        sub.href === activeSubHref;
                                    const SubIcon = sub.icon;

                                    if (sub.action) {
                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => {
                                                    if (sub.action === "logout")
                                                        handleLogout();
                                                }}
                                                className="w-full flex items-center gap-3 px-4 py-2 text-gray-400 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-colors"
                                            >
                                                {SubIcon && (
                                                    <SubIcon size={16} />
                                                )}
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
                                            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                                                subActive
                                                    ? "bg-primary-blue/20 text-white font-semibold"
                                                    : "text-gray-400 hover:bg-primary-blue/20 hover:text-white"
                                            }`}
                                        >
                                            {SubIcon && <SubIcon size={16} />}
                                            <span
                                                className={`text-sm ${subActive ? "translate-x-1" : ""} transition-transform`}
                                            >
                                                {sub.name}
                                            </span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    // Cerrar menú de usuario al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuOpen && !event.target.closest(".user-menu")) {
                setUserMenuOpen(false);
            }
        };
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, [userMenuOpen]);

    const nombreCompleto = auth?.user
        ? `${auth.user.nombre} ${auth.user.ap_paterno} ${auth.user.ap_materno || ""}`
        : "Cargando...";

    const primeraLetra = auth?.user?.nombre
        ? auth.user.nombre.charAt(0).toUpperCase()
        : "G";

    return (
        <>
            <Head title="Panel Gerente" />
            <div className="min-h-screen bg-gray-100 flex font-sans">
                {/* Sidebar Desktop */}
                <aside
                    className={`hidden lg:flex flex-col bg-primary-navy min-h-screen transition-all duration-500 ease-in-out relative ${
                        collapsed ? "w-20" : "w-72"
                    }`}
                >
                    {/* Botón de colapso */}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="absolute -right-3 top-12 z-50 bg-primary-navy border border-primary-slate rounded-full p-1.5 text-gray-300 hover:text-white hover:bg-primary-blue/20 shadow-xl"
                    >
                        {collapsed ? (
                            <ChevronRight size={14} />
                        ) : (
                            <ChevronLeft size={14} />
                        )}
                    </button>

                    {/* Logo Area */}
                    <div className="flex items-center justify-between p-5 border-b border-primary-slate mb-2">
                        {!collapsed && (
                            <div className="flex items-center gap-3">
                                <img
                                    src="/images/logo.png"
                                    alt="Logo"
                                    className="h-12 w-auto rounded-full"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.style.display = "none";
                                    }}
                                />
                                <div className="flex flex-col items-start leading-tight overflow-hidden whitespace-nowrap">
                                    <h1 className="text-white font-bold text-lg">
                                        SGP
                                    </h1>
                                    <span className="text-primary-sky-blue font-bold text-xs uppercase tracking-widest">
                                        Gerente
                                    </span>
                                </div>
                            </div>
                        )}
                        {collapsed && (
                            <img
                                src="/images/logo.png"
                                alt="Logo"
                                className="h-7 w-auto mx-auto rounded-full"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.style.display = "none";
                                }}
                            />
                        )}
                    </div>

                    {/* Menú Scrollable */}
                    <nav className="flex-1 py-4 space-y-1 overflow-y-auto custom-scrollbar pb-10">
                        {menuGerente
                            .filter((item) => !item.hide) // 👈 FILTRO: Si tiene 'hide: true', lo ignora
                            .map((item, idx) => (
                                <div key={idx}>{renderMenuItem(item)}</div>
                            ))}
                    </nav>

                    {/* Usuario pie de sidebar */}
                    {!collapsed && (
                        <div className="p-4 border-t border-primary-slate">
                            <p className="text-gray-400 text-sm">
                                Conectado como
                            </p>
                            <p className="text-white font-medium truncate">
                                {nombreCompleto}
                            </p>
                            <p className="text-primary-sky-blue text-xs">
                                Gerente
                            </p>
                        </div>
                    )}
                </aside>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    {/* Top Header */}
                    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 sticky top-0 z-30">
                        {/* Izquierda: botón hamburguesa para móvil */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setMobileMenuOpen(true)}
                                className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-full"
                            >
                                <Menu size={20} />
                            </button>
                            <div className="lg:hidden flex items-center gap-2">
                                <img
                                    src="/images/logo.png"
                                    alt="SGP"
                                    className="h-7 w-auto rounded-full"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.style.display = "none";
                                    }}
                                />
                                <span className="font-bold text-gray-800">
                                    SGP
                                </span>
                            </div>
                        </div>

                        {/* Centro: vacío */}
                        <div className="flex-1" />

                        {/* Derecha: íconos y menú de usuario */}
                        <div className="flex items-center gap-2">
                            {/* Home */}
                            <Link
                                href="/gerente"
                                className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                                title="Inicio"
                            >
                                <Home size={20} />
                            </Link>

                            {/* Notificaciones placeholder */}
                            <button
                                ref={notifButtonRef}
                                onClick={() => setNotifOpen(!notifOpen)}
                                className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors relative"
                            >
                                <Bell size={20} />
                                {noLeidas > 0 && (
                                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                        {noLeidas > 9 ? "9+" : noLeidas}
                                    </span>
                                )}
                            </button>
                            {/* Dropdown de notificaciones */}
                            {notifOpen && (
                                <div
                                    ref={notifDropdownRef}
                                    className="absolute right-40 -mt-6 w-90 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden"
                                    style={{
                                        maxHeight: "calc(100vh - 100px)",
                                        top: "100%",
                                    }}
                                >
                                    <div className="flex justify-between items-center p-3 border-b bg-gray-50 sticky top-0 z-10">
                                        <h3 className="font-semibold text-gray-900">
                                            Notificaciones
                                        </h3>
                                        {noLeidas > 0 && (
                                            <button
                                                onClick={marcarTodasLeidas}
                                                className="text-xs text-primary-blue hover:underline flex items-center gap-1"
                                            >
                                                <CheckCheck size={14} /> Marcar
                                                todas
                                            </button>
                                        )}
                                    </div>
                                    <div
                                        className="overflow-y-auto"
                                        style={{
                                            maxHeight: "calc(100vh - 160px)",
                                        }}
                                    >
                                        {notificaciones.length === 0 ? (
                                            <div className="text-center py-8 text-gray-400">
                                                <Bell
                                                    size={32}
                                                    className="mx-auto mb-2 opacity-30"
                                                />
                                                <p className="text-sm">
                                                    No hay notificaciones
                                                </p>
                                            </div>
                                        ) : (
                                            notificaciones.map((notif) => (
                                                <div
                                                    key={notif.id}
                                                    onClick={() => {
                                                        if (notif.url)
                                                            window.location.href =
                                                                notif.url;
                                                        if (!notif.leido)
                                                            marcarLeida(
                                                                notif.id,
                                                            );
                                                        setNotifOpen(false);
                                                    }}
                                                    className={`p-3 border-b hover:bg-gray-50 cursor-pointer transition ${!notif.leido ? "bg-blue-50" : ""}`}
                                                >
                                                    <div className="flex gap-3">
                                                        <div className="text-xl">
                                                            {getNotifIcon(
                                                                notif.tipo,
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-sm font-semibold text-gray-900">
                                                                {notif.titulo}
                                                            </p>
                                                            <p className="text-xs text-gray-600 mt-0.5">
                                                                {notif.mensaje}
                                                            </p>
                                                            <p className="text-xs text-gray-400 mt-1">
                                                                {
                                                                    notif.fecha_formateada
                                                                }{" "}
                                                                {notif.hora}
                                                            </p>
                                                        </div>
                                                        {!notif.leido && (
                                                            <div className="w-2 h-2 bg-primary-blue rounded-full mt-2"></div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Menú de usuario */}
                            <div className="relative user-menu">
                                <button
                                    onClick={() =>
                                        setUserMenuOpen(!userMenuOpen)
                                    }
                                    className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                                >
                                    <div className="h-9 w-9 rounded-full bg-primary-blue flex items-center justify-center text-white font-bold shadow-md">
                                        {primeraLetra}
                                    </div>
                                    <span className="hidden md:block text-sm font-medium text-gray-700">
                                        {auth.user?.nombre?.split(" ")[0] ||
                                            "Gerente"}
                                    </span>
                                    <ChevronLeft
                                        size={14}
                                        className={`hidden md:block text-gray-400 transition-transform ${userMenuOpen ? "-rotate-90" : "rotate-0"}`}
                                    />
                                </button>

                                {/* Dropdown del usuario */}
                                {userMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                                        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
                                            <div className="h-12 w-12 rounded-full bg-primary-blue flex items-center justify-center text-white font-bold text-lg shadow-md">
                                                {primeraLetra}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-900 truncate">
                                                    {nombreCompleto}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate">
                                                    {auth.user?.correo ||
                                                        "gerente@sgp.com"}
                                                </p>
                                                <p className="text-xs text-primary-blue mt-0.5">
                                                    Gerente
                                                </p>
                                            </div>
                                        </div>

                                        <div className="py-1">
                                            <Link
                                                href="/gerente/perfil"
                                                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                                onClick={() =>
                                                    setUserMenuOpen(false)
                                                }
                                            >
                                                <User size={16} />
                                                Ver Perfil
                                            </Link>
                                            <Link
                                                href="/gerente/cuenta"
                                                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                                onClick={() =>
                                                    setUserMenuOpen(false)
                                                }
                                            >
                                                <Settings size={16} />
                                                Cuenta
                                            </Link>
                                            <div className="border-t border-gray-100 my-1"></div>
                                            <button
                                                onClick={() => {
                                                    setUserMenuOpen(false);
                                                    handleLogout();
                                                }}
                                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors"
                                            >
                                                <LogOut size={16} />
                                                Cerrar Sesión
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </header>

                    {/* Page Content */}
                    <main className="flex-1 overflow-y-auto p-6 md:p-8">
                        <div className="max-w-7xl mx-auto">{children}</div>
                    </main>
                </div>
            </div>

            {/* Sidebar Móvil overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div
                        className="fixed inset-0 bg-black/50"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                    <div className="relative flex h-full w-64 max-w-xs">
                        <aside className="bg-primary-navy h-full w-full flex flex-col">
                            <div className="flex justify-end p-2">
                                <button
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="text-white hover:bg-white/20 p-2 rounded-lg"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="px-3 pb-6 flex-1 overflow-y-auto custom-scrollbar">
                                {menuGerente.map((item, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        {renderMenuItem(item)}
                                    </div>
                                ))}
                            </div>
                            {/* Usuario pie de sidebar móvil */}
                            <div className="p-4 border-t border-primary-slate">
                                <p className="text-gray-400 text-sm">
                                    Conectado como
                                </p>
                                <p className="text-white font-medium truncate">
                                    {nombreCompleto}
                                </p>
                                <p className="text-primary-sky-blue text-xs">
                                    Gerente
                                </p>
                            </div>
                        </aside>
                    </div>
                </div>
            )}

            {/* Estilos para Scrollbar */}
            <style
                dangerouslySetInnerHTML={{
                    __html: `
                            .custom-scrollbar::-webkit-scrollbar {
                                width: 4px;
                            }
                            .custom-scrollbar::-webkit-scrollbar-track {
                                background: transparent;
                            }
                            .custom-scrollbar::-webkit-scrollbar-thumb {
                                background: rgba(255, 255, 255, 0.1);
                                border-radius: 10px;
                            }
                            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                                background: rgba(255, 255, 255, 0.2);
                            }
                        `,
                }}
            />
        </>
    );
}
