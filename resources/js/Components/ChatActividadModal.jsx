import React, { useEffect, useRef } from "react";
import Modal from "@/Components/Modal";
import SecondaryButton from "@/Components/SecondaryButton";
import PrimaryButton from "@/Components/PrimaryButton";
import TextArea from "@/Components/TextArea";
import InputError from "@/Components/InputError";
import { Send, MessageSquare } from "lucide-react";

export default function ChatActividadModal({ show, onClose, actividad, pasante, form, onSubmit }) {
    if (!actividad || !pasante) return null;

    const chatEndRef = useRef(null);
    const comentarios = actividad.comentarios || [];

    // Auto-scroll al último mensaje al abrir el chat o recibir mensajes
    useEffect(() => {
        if (show) {
            chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [comentarios, show]);

    return (
        <Modal show={show} onClose={onClose} title={`Mensajes de Actividad: ${actividad.nombre_act}`} maxWidth="2xl">
            <div className="p-6">
                <div className="mb-4 bg-blue-50 border border-blue-100 p-3.5 rounded-xl text-xs text-blue-800">
                    <span className="font-bold">Pasante: </span> {pasante.nombre_completo} <br />
                    Discute o deja comentarios específicos con respecto a los requerimientos de esta actividad.
                </div>

                {/* Área de Mensajes */}
                <div className="bg-slate-50 p-4 rounded-2xl max-h-[350px] overflow-y-auto space-y-3.5 border border-slate-100 flex flex-col">
                    {comentarios.length === 0 ? (
                        <div className="text-center py-10 text-slate-400 text-sm flex flex-col items-center justify-center gap-2">
                            <MessageSquare size={24} className="text-slate-300" />
                            No hay comentarios previos en esta actividad. ¡Envía el primero!
                        </div>
                    ) : (
                        comentarios.map((c) => {
                            // COM_ACTIVIDAD(id_comactividad, com_pasante, com_jefe, fecha, hora, idU_pasante, idU_jefe, id_actividad)
                            const esJefe = c.remitente === "jefe";
                            return (
                                <div
                                    key={c.id_comactividad}
                                    className={`flex flex-col max-w-[80%] ${
                                        esJefe ? "self-end items-end" : "self-start items-start"
                                    }`}
                                >
                                    <span className="text-[10px] font-bold text-slate-400 mb-1 px-1">
                                        {esJefe ? "Tú (Jefe)" : pasante.nombre_completo} • {c.fecha} {c.hora}
                                    </span>
                                    <div
                                        className={`p-3 rounded-2xl text-sm shadow-sm whitespace-pre-line leading-relaxed ${
                                            esJefe
                                                ? "bg-primary-blue text-white rounded-tr-none"
                                                : "bg-white text-slate-700 border border-slate-200 rounded-tl-none"
                                        }`}
                                    >
                                        {c.texto}
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={chatEndRef} />
                </div>

                {/* Formulario de Envío */}
                <form onSubmit={onSubmit} className="mt-4">
                    <div>
                        <TextArea
                            id="comentario"
                            rows="2"
                            className="mt-1 block w-full text-sm rounded-xl"
                            value={form.data.comentario}
                            onChange={(e) => form.setData("comentario", e.target.value)}
                            placeholder="Escribe un comentario o aclaración sobre la actividad..."
                            required
                        />
                        <InputError message={form.errors.comentario} className="mt-1" />
                    </div>

                    <div className="flex justify-end gap-2.5 mt-4">
                        <SecondaryButton type="button" onClick={onClose}>
                            Cerrar
                        </SecondaryButton>
                        <PrimaryButton processing={form.processing} className="flex items-center gap-1.5 px-4">
                            <Send size={14} />
                            Enviar
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </Modal>
    );
}