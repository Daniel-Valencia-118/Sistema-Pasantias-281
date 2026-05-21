import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
    Bell, MessageCircle, Star, Briefcase, 
    Clipboard, Calendar, MessageSquare, Trash2, CheckCircle2 
} from 'lucide-react';

// Mapeo de íconos según el tipo definido en tu Trait Notificable
const iconMap = {
    mensaje: <MessageCircle size={16} className="text-blue-500" />,
    calificacion: <Star size={16} className="text-yellow-500" />,
    pasantia: <Briefcase size={16} className="text-purple-500" />,
    inscripcion: <Clipboard size={16} className="text-green-500" />,
    actividad: <Calendar size={16} className="text-orange-500" />,
    comentario: <MessageSquare size={16} className="text-teal-500" />,
    default: <Bell size={16} className="text-gray-500" />
};

export default function NotificationDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);

    // Cargar notificaciones desde el controlador
    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await axios.get(route('notificaciones.index'));
            setNotifications(response.data.notificaciones);
            setUnreadCount(response.data.no_leidas);
        } catch (error) {
            console.error("Error al cargar notificaciones:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Opcional: Podrías añadir un setInterval si quieres un sondeo básico cada 60s
    }, []);

    // Cerrar al hacer clic fuera
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleMarkAsRead = async (id) => {
        try {
            await axios.patch(route('notificaciones.leer', id));
            setNotifications(notifications.map(n => n.id === id ? { ...n, leido: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Error al marcar como leída:", error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await axios.post(route('notificaciones.leer-todas'));
            setNotifications(notifications.map(n => ({ ...n, leido: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error("Error al marcar todas como leídas:", error);
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation(); // Evita que se dispare el click de la notificación
        try {
            await axios.delete(route('notificaciones.destroy', id));
            const nEliminada = notifications.find(n => n.id === id);
            setNotifications(notifications.filter(n => n.id !== id));
            if (nEliminada && !nEliminada.leido) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error("Error al eliminar la notificación:", error);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Botón de la Campana */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors relative"
                title="Notificaciones"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-1">
                    <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                        <span className="font-bold text-sm text-gray-800">Notificaciones</span>
                        {unreadCount > 0 && (
                            <button 
                                onClick={handleMarkAllAsRead}
                                className="text-xs text-primary-blue hover:underline font-medium flex items-center gap-1"
                            >
                                <CheckCircle2 size={12} /> Marcar todas leídas
                            </button>
                        )}
                    </div>

                    {/* Lista de Notificaciones */}
                    <div className="max-h-80 overflow-y-auto split-y divide-y divide-gray-50">
                        {loading && notifications.length === 0 ? (
                            <p className="text-center text-xs text-gray-400 py-6">Cargando...</p>
                        ) : notifications.length === 0 ? (
                            <p className="text-center text-xs text-gray-400 py-6">No tienes notificaciones</p>
                        ) : (
                            notifications.map((notif) => (
                                <div 
                                    key={notif.id}
                                    onClick={() => {if (notif.url)
                                                            window.location.href =
                                                                notif.url; !notif.leido && handleMarkAsRead(notif.id)}}
                                    className={`p-3 flex items-start gap-3 transition-colors cursor-pointer group relative ${!notif.leido ? 'bg-blue-50/50 hover:bg-blue-50' : 'hover:bg-gray-50'}`}
                                >
                                    {/* Icono de Tipo Dinámico */}
                                    <div className="mt-0.5 flex-shrink-0">
                                        {iconMap[notif.tipo] || iconMap.default}
                                    </div>

                                    {/* Contenido de Texto */}
                                    <div className="flex-1 min-w-0 pr-4">
                                        <p className={`text-xs text-gray-900 truncate ${!notif.leido ? 'font-bold' : 'font-medium'}`}>
                                            {notif.titulo}
                                        </p>
                                        <p className="text-xs text-gray-500 break-words mt-0.5 line-clamp-2">
                                            {notif.mensaje}
                                        </p>
                                        <span className="text-[10px] text-gray-400 block mt-1">
                                            {new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(notif.fecha))} a las {notif.hora.substring(0, 5)}
                                        </span>
                                    </div>

                                    {/* Botón Eliminar (Aparece en Hover) */}
                                    {/* <button
                                        onClick={(e) => handleDelete(notif.id, e)}
                                        className="absolute right-2 top-3 p-1 text-gray-400 hover:text-red-500 rounded md:opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Eliminar"
                                    >
                                        <Trash2 size={12} />
                                    </button> */}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}