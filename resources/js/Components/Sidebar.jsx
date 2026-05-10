// resources/js/Components/Sidebar.jsx
import React, { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { menuConfig } from '@/Config/menuConfig';
import {
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';

export default function Sidebar({ auth, onClose }) {
    const [collapsed, setCollapsed] = useState(false);
    const [openMenus, setOpenMenus] = useState({});

    const role = auth?.user?.rol || 'administrador';
    const menuItems = menuConfig[role] || [];

    const toggleMenu = (menuName) => {
        setOpenMenus((prev) => ({ ...prev, [menuName]: !prev[menuName] }));
    };

    const handleLogout = () => {
        router.post(route('logout'));
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
                                className={`transition-transform ${isOpen ? 'rotate-90' : ''}`}
                            />
                        )}
                    </button>

                    {!collapsed && isOpen && (
                        <div className="ml-8 mt-1 space-y-1">
                            {item.submenus.map((sub, idx) => {
                                const SubIcon = sub.icon;
                                if (sub.action === 'logout') {
                                    return (
                                        <button
                                            key={idx}
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-4 py-2 text-gray-400 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-colors"
                                        >
                                            <SubIcon size={16} />
                                            <span className="text-sm">{sub.name}</span>
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
                                        <span className="text-sm">{sub.name}</span>
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
        <aside
            className={`bg-primary-navy min-h-screen transition-all duration-300 ${
                collapsed ? 'w-20' : 'w-64'
            }`}
        >
            <div className="flex flex-col h-full">
                {/* HEADER */}
                <div className="flex items-center justify-between p-5 border-b border-primary-slate">
                    {!collapsed && (
                        <div className="flex items-center gap-3">
                            <img
                                src="/images/logo.png"
                                alt="Logo"
                                className="h-12 w-auto rounded-full"
                            />
                            <div className="flex flex-col items-center leading-tight">
                                <h3 className="text-white font-bold text-lg">SGP</h3>
                                <span className="text-white font-bold text-lg uppercase">
                                    {role.replace('_', ' ')}
                                </span>
                            </div>
                        </div>
                    )}
                    {collapsed && (
                        <img
                            src="/images/logo.png"
                            alt="Logo"
                            className="h-7 w-auto mx-auto rounded-full"
                        />
                    )}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="p-1 rounded-lg hover:bg-primary-blue/20 text-gray-300"
                    >
                        {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                    </button>
                </div>

                {/* NAV (scroll interno) */}
                <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
                    {menuItems.map((item, idx) => (
                        <div key={idx}>{renderMenuItem(item)}</div>
                    ))}
                </nav>

                {/* FOOTER */}
                {!collapsed && (
                    <div className="p-4 border-t border-primary-slate">
                        <p className="text-gray-400 text-sm">Conectado como</p>
                        <p className="text-white font-medium">{auth?.user?.nombre_user}</p>
                        <p className="text-primary-sky-blue text-xs capitalize">{role}</p>
                    </div>
                )}
            </div>
        </aside>
    );
}
