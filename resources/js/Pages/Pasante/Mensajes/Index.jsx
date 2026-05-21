// resources/js/Pages/Pasante/Mensajes/Index.jsx
import React, { useState, useEffect, useRef } from "react";
import { Head } from "@inertiajs/react";
import axios from "axios";
import PasanteLayout from "@/Components/Layout/PasanteLayout";
import Breadcrumbs from "@/Components/Breadcrumbs";
import { Send, MessageCircle, Ban, Unlock, ArrowLeft } from "lucide-react";

// Convertir hora UTC a Bolivia (UTC-4)
const convertirHoraBolivia = (horaUTC) => {
    if (!horaUTC) return "";
    const partes = horaUTC.split(":");
    let horas = parseInt(partes[0]);
    horas = horas - 4;
    if (horas < 0) horas += 24;
    return `${horas.toString().padStart(2, "0")}:${partes[1]}`;
};

// Formatear fecha para mostrar
const formatearFecha = (fecha, hora) => {
    if (!fecha) return "";

    const partes = fecha.split("-");
    const fechaBolivia = new Date(
        parseInt(partes[0]),
        parseInt(partes[1]) - 1,
        parseInt(partes[2]),
    );

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const ayer = new Date(hoy);
    ayer.setDate(hoy.getDate() - 1);

    const fechaComparar = new Date(fechaBolivia);
    fechaComparar.setHours(0, 0, 0, 0);

    if (fechaComparar.getTime() === hoy.getTime()) {
        return `Hoy ${convertirHoraBolivia(hora)}`;
    } else if (fechaComparar.getTime() === ayer.getTime()) {
        return `Ayer ${convertirHoraBolivia(hora)}`;
    } else {
        return fechaBolivia.toLocaleDateString("es-ES", {
            day: "numeric",
            month: "short",
        });
    }
};
const getAvatarUrl = (contacto) => {
    // Si el contacto tiene avatar_url directamente (desde el backend)
    if (contacto.avatar_url) {
        return contacto.avatar_url;
    }
    // Si no, mostrar iniciales
    return null;
};

const getInitials = (contacto) => {
    if (!contacto) return "?";
    return `${contacto.ap_paterno?.charAt(0) || ""}${contacto.nombre?.charAt(0) || ""}`;
};

export default function Index({ auth, contactos }) {
    const [contactosList, setContactosList] = useState(contactos);
    const [contactoActivo, setContactoActivo] = useState(null);
    const [mensajes, setMensajes] = useState([]);
    const [nuevoMensaje, setNuevoMensaje] = useState("");
    const [loadingMensajes, setLoadingMensajes] = useState(false);
    const [enviando, setEnviando] = useState(false);
    const [bloqueado, setBloqueado] = useState(false);
    const [mostrarChat, setMostrarChat] = useState(false);
    const messagesEndRef = useRef(null);
    const mensajesContainerRef = useRef(null);
    const pollingInterval = useRef(null);

    // Scroll al último mensaje
    useEffect(() => {
        if (mensajesContainerRef.current) {
            mensajesContainerRef.current.scrollTop =
                mensajesContainerRef.current.scrollHeight;
        }
    }, [mensajes]);
    useEffect(() => {
        const contactosValidos = contactos.filter(
            (contacto) =>
                contacto &&
                contacto.ap_paterno &&
                contacto.nombre &&
                contacto.tipo &&
                contacto.id_contacto,
        );
        if (contactosValidos.length !== contactos.length) {
            setContactosList(contactosValidos);
        }
    }, [contactos]);
    // useEffect(() => {
    //     console.log("Contactos recibidos:", contactos);
    // }, [contactos]);
    // Polling para nuevos mensajes
    useEffect(() => {
        if (contactoActivo && mostrarChat) {
            if (pollingInterval.current) {
                clearInterval(pollingInterval.current);
            }

            pollingInterval.current = setInterval(async () => {
                try {
                    const response = await axios.get(
                        `/pasante/mensajes/${contactoActivo.tipo}/${contactoActivo.id}`,
                    );
                    if (response.data.mensajes) {
                        setMensajes(response.data.mensajes);
                    }
                } catch (error) {
                    console.error("Error en polling:", error);
                }
            }, 3000);

            return () => {
                if (pollingInterval.current) {
                    clearInterval(pollingInterval.current);
                }
            };
        }
    }, [contactoActivo, mostrarChat]);

    // Cargar mensajes al seleccionar un contacto
    const seleccionarContacto = async (contacto) => {
        if (!contacto || !contacto.tipo || !contacto.id_contacto) {
            console.error("Contacto inválido:", contacto);
            return;
        }

        setLoadingMensajes(true);
        setMostrarChat(true);
        setBloqueado(false);

        try {
            const response = await axios.get(
                `/pasante/mensajes/${contacto.tipo}/${contacto.id_contacto}`,
            );

            if (response.data && response.data.mensajes) {
                setMensajes(response.data.mensajes);
            } else {
                setMensajes([]);
            }

            setContactoActivo({
                tipo: contacto.tipo,
                id: contacto.id_contacto,
                info: response.data.contacto || {
                    ap_paterno: contacto.ap_paterno,
                    nombre: contacto.nombre,
                },
                nombre: `${contacto.ap_paterno} ${contacto.nombre}`,
            });
        } catch (error) {
            console.error("Error al cargar mensajes:", error);
            setMensajes([]);
        } finally {
            setLoadingMensajes(false);
        }
    };

    // Volver a la lista de contactos
    const volverALista = () => {
        setMostrarChat(false);
        setContactoActivo(null);
        setMensajes([]);
        if (pollingInterval.current) {
            clearInterval(pollingInterval.current);
        }
    };

    // Enviar mensaje
    const enviarMensaje = async () => {
        if (!nuevoMensaje.trim() || enviando || bloqueado || !contactoActivo)
            return;

        const mensajeTexto = nuevoMensaje.trim();
        setNuevoMensaje("");
        setEnviando(true);

        try {
            const response = await axios.post(
                route("pasante.mensajes.enviar"),
                {
                    tipo: contactoActivo.tipo,
                    id_contacto: contactoActivo.id,
                    mensaje: mensajeTexto,
                },
            );

            if (response.data.success) {
                const nuevoMsg = response.data.mensaje;
                setMensajes((prev) => [...prev, nuevoMsg]);

                // Actualizar último mensaje en la lista de contactos
                setContactosList((prev) =>
                    prev.map((c) => {
                        if (
                            c.tipo === contactoActivo.tipo &&
                            c.id_contacto === contactoActivo.id
                        ) {
                            return {
                                ...c,
                                ultimo_mensaje: mensajeTexto,
                                ultimo_mensaje_fecha: new Date()
                                    .toISOString()
                                    .split("T")[0],
                                ultimo_mensaje_hora:
                                    new Date().toLocaleTimeString("es-ES", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    }),
                                ultimo_mensaje_enviado_por_mi: true,
                            };
                        }
                        return c;
                    }),
                );
            } else {
                setNuevoMensaje(mensajeTexto);
                alert("Error al enviar el mensaje");
            }
        } catch (error) {
            console.error("Error:", error);
            setNuevoMensaje(mensajeTexto);
            alert("Error al enviar el mensaje");
        } finally {
            setEnviando(false);
        }
    };

    return (
        <PasanteLayout auth={auth}>
            <Head title="Mensajes" />
            <Breadcrumbs items={[
                { label: 'Inicio', url: 'pasante.dashboard' },
                { label: 'Mensajes' },
                { label: 'Chat Pasantes y Jefes' },
            ]} />

            <div className="mb-4">
                <h1 className="text-3xl font-black text-primary-navy uppercase">Chat de Mensajería</h1>
                <p className="text-slate-500">Canal directo de comunicación institucional con pasantes y tus jefes.</p>
            </div>

            <div className="h-[calc(100vh-130px)] min-h-0 flex bg-white rounded-xl shadow-sm overflow-hidden">
                {/* LISTA DE CONVERSACIONES */}
                <div
                    className={`${mostrarChat ? "hidden md:block" : "block"} w-full md:w-80 border-r flex flex-col h-full min-h-0 bg-white`}
                >
                    <div className="p-4 border-b bg-gray-50 flex-shrink-0">
                        <h2 className="font-bold text-primary-navy">
                            Conversaciones
                        </h2>
                    </div>
                    <div className="flex-1 overflow-y-auto min-h-0">
                        {contactosList.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <MessageCircle
                                    size={40}
                                    className="mx-auto mb-2 opacity-50"
                                />
                                <p>No hay conversaciones activas</p>
                                <p className="text-xs">
                                    Los contactos aparecerán cuando tengas
                                    pasantías en curso
                                </p>
                            </div>
                        ) : (
                            contactosList
                                .filter(
                                    (contacto) =>
                                        contacto &&
                                        contacto.ap_paterno &&
                                        contacto.nombre &&
                                        contacto.tipo,
                                )
                                .map((contacto, idx) => (
                                    <button
                                        key={`${contacto.tipo}_${contacto.id_contacto}_${idx}`}
                                        onClick={() =>
                                            seleccionarContacto(contacto)
                                        }
                                        className={`w-full p-4 text-left hover:bg-gray-50 transition border-b ${
                                            contactoActivo?.id ===
                                                contacto.id_contacto &&
                                            contactoActivo?.tipo ===
                                                contacto.tipo &&
                                            mostrarChat
                                                ? "bg-primary-blue/10 border-l-4 border-l-primary-blue"
                                                : ""
                                        }`}
                                    >
                                        <div className="flex gap-3">
                                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary-blue to-primary-sky-blue text-white flex items-center justify-center font-bold shadow-sm overflow-hidden">
                                                {getAvatarUrl(contacto) ? (
                                                    <img
                                                        src={getAvatarUrl(
                                                            contacto,
                                                        )}
                                                        alt={contacto.nombre}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <span>
                                                        {getInitials(contacto)}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-baseline">
                                                    <p className="font-semibold text-gray-900 truncate">
                                                        {contacto.ap_paterno}{" "}
                                                        {contacto.ap_materno}{" "}
                                                        {contacto.nombre}
                                                    </p>
                                                    {contacto.ultimo_mensaje_fecha && (
                                                        <span className="text-xs font-medium text-primary-blue flex-shrink-0 ml-2">
                                                            {formatearFecha(
                                                                contacto.ultimo_mensaje_fecha,
                                                                contacto.ultimo_mensaje_hora,
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-gray-700">
                                                    {contacto.tipo ===
                                                    "jefe" ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 font-semibold border border-indigo-200 shadow-sm">
                                                            👤 JEFE
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-medium border border-emerald-100">
                                                            🍃Pasante
                                                        </span>
                                                    )}
                                                    <span className="text-gray-400">
                                                        ·
                                                    </span>
                                                    <span className="font-medium text-gray-600">
                                                        {
                                                            contacto.empresa_nombre
                                                        }
                                                    </span>
                                                </div>
                                                {contacto.ultimo_mensaje && (
                                                    <p className="text-sm text-gray-500 truncate mt-1">
                                                        <span className="font-medium text-gray-600">
                                                            {contacto.ultimo_mensaje_enviado_por_mi
                                                                ? "Yo: "
                                                                : `${contacto.ap_paterno}: `}
                                                        </span>
                                                        {contacto.ultimo_mensaje
                                                            .length > 35
                                                            ? contacto.ultimo_mensaje.substring(
                                                                  0,
                                                                  35,
                                                              ) + "..."
                                                            : contacto.ultimo_mensaje}
                                                    </p>
                                                )}
                                                {contacto.finalizada && (
                                                    <span className="inline-block mt-1 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                                                        Finalizada
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                ))
                        )}
                    </div>
                </div>

                {/* VENTANA DE CHAT */}
                <div
                    className={`${!mostrarChat ? "hidden md:flex" : "flex"} flex-1 flex-col h-full min-h-0 bg-white`}
                >
                    {!contactoActivo ? (
                        <div className="flex-1 flex items-center justify-center text-gray-400">
                            <div className="text-center">
                                <MessageCircle
                                    size={48}
                                    className="mx-auto mb-3 opacity-30"
                                />
                                <p>Selecciona una conversación</p>
                                <p className="text-sm">
                                    para comenzar a chatear
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Header del chat */}
                            <div className="p-4 border-b bg-gray-50 flex items-center justify-between flex-shrink-0">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={volverALista}
                                        className="md:hidden p-2 text-gray-500 hover:bg-gray-200 rounded-full"
                                    >
                                        <ArrowLeft size={20} />
                                    </button>

                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-blue to-primary-sky-blue text-white flex items-center justify-center font-bold shadow-sm overflow-hidden">
                                        {contactoActivo.info?.avatar_url ? (
                                            <img
                                                src={
                                                    contactoActivo.info
                                                        .avatar_url
                                                }
                                                alt={contactoActivo.info.nombre}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span>
                                                {getInitials(
                                                    contactoActivo.info,
                                                )}
                                            </span>
                                        )}
                                    </div>

                                    <div>
                                        <p className="font-semibold text-gray-900">
                                            {contactoActivo.info?.ap_paterno ||
                                                contactoActivo.nombre?.split(
                                                    " ",
                                                )[0]}{" "}
                                            {contactoActivo.info?.nombre || ""}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {contactoActivo.tipo === "jefe"
                                                ? "👤 Jefe de pasante"
                                                : "👤 Pasante"}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    // onClick={() => setBloqueado(!bloqueado)}
                                    onClick={() => {}}
                                    className="hidden p-2 text-gray-400 hover:text-red-500 transition"
                                    title={
                                        bloqueado ? "Desbloquear" : "Bloquear"
                                    }
                                >
                                    {bloqueado ? (
                                        <Unlock size={18} />
                                    ) : (
                                        <Ban size={18} />
                                    )}
                                </button>
                            </div>

                            {/* Área de mensajes */}
                            <div
                                ref={mensajesContainerRef}
                                className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-3 bg-gray-50 min-h-0"
                            >
                                {loadingMensajes ? (
                                    <div className="text-center text-gray-400 py-8">
                                        Cargando mensajes...
                                    </div>
                                ) : mensajes.length === 0 ? (
                                    <div className="text-center text-gray-400 py-8">
                                        No hay mensajes aún. ¡Envía el primero!
                                    </div>
                                ) : (
                                    mensajes.map((msg, idx) => (
                                        <div
                                            key={`${msg.id}_${msg.fecha}_${msg.hora}`}
                                            className={`flex flex-col ${msg.es_mio ? "items-end" : "items-start"} mb-3`}
                                        >
                                            {!msg.es_mio && (
                                                <p className="text-xs text-gray-500 mb-1 ml-2">
                                                    {contactoActivo.info
                                                        ?.ap_paterno || ""}{" "}
                                                    {contactoActivo.info
                                                        ?.nombre || ""}
                                                </p>
                                            )}
                                            {msg.es_mio && (
                                                <p className="text-xs text-gray-500 mb-1 mr-2">
                                                    Yo
                                                </p>
                                            )}
                                            <div
                                                className={`max-w-[75%] w-fit rounded-2xl px-4 py-2 break-words ${
                                                    msg.es_mio
                                                        ? "bg-primary-blue text-white rounded-br-sm"
                                                        : "bg-white text-gray-800 rounded-bl-sm shadow-sm border border-gray-100"
                                                }`}
                                            >
                                                <p className="text-sm break-words">
                                                    {msg.descripcion}
                                                </p>
                                                <p
                                                    className={`text-xs mt-1 ${msg.es_mio ? "text-blue-100" : "text-gray-400"}`}
                                                >
                                                    {convertirHoraBolivia(
                                                        msg.hora,
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Input para mensaje */}
                            <div className="p-4 border-t bg-white flex-shrink-0 sticky bottom-0">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={nuevoMensaje}
                                        onChange={(e) =>
                                            setNuevoMensaje(e.target.value)
                                        }
                                        onKeyDown={(e) =>
                                            e.key === "Enter" && enviarMensaje()
                                        }
                                        placeholder={
                                            bloqueado
                                                ? "Has bloqueado a este contacto"
                                                : "Escribe un mensaje..."
                                        }
                                        disabled={bloqueado}
                                        className="flex-1 rounded-full border-gray-200 px-4 py-2 text-sm focus:border-primary-blue focus:ring-1 focus:ring-primary-blue disabled:bg-gray-100"
                                    />
                                    <button
                                        onClick={enviarMensaje}
                                        disabled={
                                            !nuevoMensaje.trim() ||
                                            enviando ||
                                            bloqueado
                                        }
                                        className="bg-primary-blue text-white rounded-full p-2 hover:bg-primary-sky-blue transition disabled:opacity-50"
                                    >
                                        <Send size={18} />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </PasanteLayout>
    );
}
