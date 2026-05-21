import React, { useState, useEffect, useRef } from 'react';
import { Head } from '@inertiajs/react';
import DashboardLayout from '@/Components/Layout/DashboardLayout';
import Breadcrumbs from '@/Components/Breadcrumbs';
import { Send, User, Check, CheckCheck } from 'lucide-react';
import axios from 'axios';

export default function Index({ contactosIniciales = [], auth }) {
    const [contactos, setContactos] = useState(contactosIniciales);
    const [contactoActivo, setContactoActivo] = useState(null);
    const [mensajes, setMensajes] = useState([]);
    const [nuevoMensaje, setNuevoMensaje] = useState('');
    const [cargandoChat, setCargandoChat] = useState(false);
    
    const contenedorMensajesRef = useRef(null);

    console.log(contactosIniciales);
    

    // Desplazar el scroll hacia el extremo inferior al recibir o enviar mensajes
    useEffect(() => {
        if (contenedorMensajesRef.current) {
            contenedorMensajesRef.current.scrollTop = contenedorMensajesRef.current.scrollHeight;
        }
    }, [mensajes]);

    // Consultar el historial de chat del pasante seleccionado
    const seleccionarContacto = async (contacto) => {
        setContactoActivo(contacto);
        setCargandoChat(true);
        try {
            const response = await axios.get(route('jefe.mensajes.show', contacto.id_contacto));
            setMensajes(response.data.mensajes);
        } catch (error) {
            console.error("Error al recuperar el historial de mensajes", error);
        } finally {
            setCargandoChat(false);
        }
    };

    // Procesar la petición de transmisión del mensaje
    const gestionarEnvio = async (e) => {
        e.preventDefault();
        if (!nuevoMensaje.trim() || !contactoActivo) return;

        const textoAEnviar = nuevoMensaje;
        setNuevoMensaje('');

        try {
            const response = await axios.post(route('jefe.mensajes.store'), {
                id_contacto: contactoActivo.id_contacto,
                mensaje: textoAEnviar
            });

            console.log(response);
            

            if (response.data.success) {
                const msgGuardado = response.data.mensaje;
                setMensajes(prev => [...prev, msgGuardado]);

                // Actualizar la lista lateral con el contenido del último mensaje
                setContactos(prevContactos => 
                    prevContactos.map(c => 
                        c.id_contacto === contactoActivo.id_contacto
                            ? { 
                                ...c, 
                                ultimo_mensaje: msgGuardado.descripcion, 
                                ultimo_mensaje_hora: msgGuardado.hora,
                                ultimo_mensaje_enviado_por_mi: true 
                              }
                            : c
                    )
                );
            }
        } catch (error) {
            console.error("Error al transmitir el mensaje", error);
        }
    };

    return (
        <DashboardLayout auth={auth}>
            <Head title="Panel de Mensajería" />
            <Breadcrumbs items={[
                { label: 'Inicio', url: route('jefe.dashboard') },
                { label: 'Comunicación' },
                { label: 'Chat Pasantes' },
            ]} />

            <div className="mb-4">
                <h1 className="text-3xl font-black text-primary-navy uppercase">Chat de Mensajería</h1>
                <p className="text-slate-500">Canal directo de comunicación institucional con tus pasantes asignados.</p>
            </div>

            <div className="flex bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-[calc(100vh-240px)] min-h-[500px]">
                
                {/* Panel Lateral: Lista de Pasantes */}
                <div className="w-1/3 border-r border-slate-200 flex flex-col bg-slate-50/50">
                    <div className="p-4 border-b border-slate-200 bg-white">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Conversaciones Disponibles</span>
                    </div>
                    <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                        {contactos.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 text-sm">No cuentas con pasantes asociados a tu cargo.</div>
                        ) : (
                            contactos.map((c) => (
                                <button
                                    key={c.id_contacto}
                                    onClick={() => seleccionarContacto(c)}
                                    className={`w-full p-4 flex items-start gap-3 transition-all text-left ${
                                        contactoActivo?.id_contacto === c.id_contacto 
                                            ? 'bg-white border-l-4 border-primary-blue shadow-sm' 
                                            : 'hover:bg-slate-100/80 border-l-4 border-transparent'
                                    }`}
                                >
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-blue to-primary-sky-blue text-white flex items-center justify-center font-bold shadow-sm overflow-hidden">
                                        {c.avatar_url ? (
                                            <img src={c.avatar_url} alt={c.nombre} className="h-full w-full object-cover" />
                                        ) : (
                                            // <User className="text-slate-400" size={20} />
                                            // Mostar iniciales del pasante si no hay avatar usar contactoActivo
                                            <span className="text-sm">{c.nombre.charAt(0)}{c.ap_paterno.charAt(0)}</span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-0.5">
                                            <h3 className="text-sm font-bold text-slate-800 truncate">{`${c.nombre} ${c.ap_paterno}`}</h3>
                                            <span className="text-xs text-slate-400 flex-shrink-0">
                                                {c.ultimo_mensaje_hora ? c.ultimo_mensaje_hora.substring(0, 5) : ''}
                                            </span>
                                        </div>
                                        <p className="text-xs font-medium text-primary-blue truncate mb-1">{c.pasantia_nombre}</p>
                                        <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                                            {c.ultimo_mensaje ? (
                                                <>
                                                    {c.ultimo_mensaje_enviado_por_mi && <span className="text-slate-400">Tú:</span>}
                                                    <span>{c.ultimo_mensaje}</span>
                                                </>
                                            ) : (
                                                <span className="italic text-slate-400">Sin mensajes compartidos</span>
                                            )}
                                        </p>
                                    </div>
                                    {c.finalizada && (
                                        <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">Fin</span>
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Panel de Conversación Activa */}
                <div className="flex-1 flex flex-col bg-white">
                    {contactoActivo ? (
                        <>
                            {/* Cabecera del Chat */}
                            <div className="p-4 border-b border-slate-200 flex items-center gap-3 bg-white shadow-sm">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-blue to-primary-sky-blue text-white flex items-center justify-center font-bold shadow-sm overflow-hidden">
                                    {contactoActivo.avatar_url ? (
                                        <img src={contactoActivo.avatar_url} alt={contactoActivo.nombre} className="h-full w-full object-cover" />
                                    ) : (
                                        // <User className="text-slate-400" size={20} />
                                        // Mostar iniciales del pasante si no hay avatar usar contactoActivo
                                        <span className="text-sm">{contactoActivo.nombre.charAt(0)}{contactoActivo.ap_paterno.charAt(0)}</span>
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-sm font-bold text-slate-800">{`${contactoActivo.nombre} ${contactoActivo.ap_paterno} ${contactoActivo.ap_materno}`}</h2>
                                    <p className="text-xs text-slate-400">@{contactoActivo.nombre_user} • {contactoActivo.pasantia_nombre}</p>
                                </div>
                            </div>

                            {/* Área de Mensajes */}
                            <div 
                                ref={contenedorMensajesRef}
                                className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-3"
                            >
                                {cargandoChat ? (
                                    <div className="flex justify-center items-center h-full text-sm text-slate-400">Cargando el historial...</div>
                                ) : mensajes.length === 0 ? (
                                    <div className="flex flex-col justify-center items-center h-full text-slate-400 p-4 text-center">
                                        <p className="text-sm font-medium">No hay registros de conversación previa.</p>
                                        <p className="text-xs text-slate-400">Escribe un mensaje para iniciar el contacto académico.</p>
                                    </div>
                                ) : (
                                    mensajes.map((msg) => (
                                        <div 
                                            key={msg.id} 
                                            className={`flex ${msg.es_mio ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm text-sm relative group ${
                                                msg.es_mio 
                                                        ? "bg-primary-blue text-white rounded-br-sm"
                                                        : "bg-white text-gray-800 rounded-bl-sm shadow-sm border border-gray-100"
                                            }`}>
                                                <p className="break-words leading-relaxed pr-2">{msg.descripcion}</p>
                                                <div className={`text-[10px] mt-1 flex items-center justify-end gap-1 ${
                                                    msg.es_mio ? 'text-slate-300' : 'text-slate-400'
                                                }`}>
                                                    <span>{msg.hora ? msg.hora.substring(0, 5) : ''}</span>
                                                    {msg.es_mio && <CheckCheck size={12} className="text-sky-400" />}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Entrada de Texto */}
                            <form onSubmit={gestionarEnvio} className="p-4 border-t border-slate-200 bg-white flex gap-2 items-center">
                                <input
                                    type="text"
                                    value={nuevoMensaje}
                                    onChange={(e) => setNuevoMensaje(e.target.value)}
                                    placeholder="Escribe un mensaje para el pasante..."
                                    className="flex-1 bg-slate-100 border-0 focus:ring-2 focus:ring-primary-blue rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 transition"
                                />
                                <button
                                    type="submit"
                                    disabled={!nuevoMensaje.trim()}
                                    className="p-2.5 bg-primary-blue text-white rounded-xl hover:bg-primary-blue/90 transition disabled:opacity-40 disabled:hover:bg-primary-blue flex items-center justify-center flex-shrink-0 shadow-sm"
                                >
                                    <Send size={18} />
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col justify-center items-center text-slate-400 bg-slate-50/30">
                            <div className="p-4 bg-white rounded-full shadow-sm border border-slate-200 mb-2">
                                <Send size={24} className="text-slate-300 translate-x-[1px] -translate-y-[1px]" />
                            </div>
                            <p className="text-sm font-bold text-slate-600">Bandeja de Mensajes</p>
                            <p className="text-xs text-slate-400">Selecciona un pasante de la barra lateral para revisar e iniciar el chat.</p>
                        </div>
                    )}
                </div>

            </div>
        </DashboardLayout>
    );
}