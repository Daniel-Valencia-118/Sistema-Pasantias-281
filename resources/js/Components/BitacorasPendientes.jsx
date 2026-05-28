import React from "react";
import { Link } from "@inertiajs/react";
import { Clock, CheckCircle2, ArrowRight } from "lucide-react";

export default function BitacorasPendientes({ bitacoras, formatDate }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
            <div>
                <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <Clock size={20} className="text-amber-500" />
                    Bitácoras por Evaluar
                </h2>
                <div className="space-y-4">
                    {bitacoras?.length > 0 ? (
                        bitacoras.map((item) => (
                            <div key={item.id} className="group p-3 rounded-lg border border-gray-50 bg-gray-50/50 hover:bg-white hover:border-blue-300 transition-all">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-medium text-gray-900 text-sm">{item.pasante_nombre}</p>
                                        <p className="text-xs text-gray-500">{item.pasantia_titulo}</p>
                                    </div>
                                    <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                                        PENDIENTE
                                    </span>
                                </div>
                                <div className="mt-3 flex justify-between items-center">
                                    <span className="text-xs text-gray-400">{formatDate(item.fecha)}</span>
                                    {/* Bloqueo automático de edición/creación implícito en el flujo del link */}
                                    <Link 
                                        href={`/jefe/evaluaciones/${item.id_pasantia}/bitacoras`}
                                        className="text-xs font-semibold text-blue-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        Evaluar <ArrowRight size={12} />
                                    </Link>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10">
                            <CheckCircle2 size={40} className="text-emerald-200 mx-auto mb-2" />
                            <p className="text-sm text-gray-400">Todo evaluado al día</p>
                        </div>
                    )}
                </div>
            </div>
            <Link 
                href="/jefe/pasantias/tarjetas?origen=bitacoras"
                className="mt-4 block text-center text-sm text-gray-500 hover:text-blue-600 font-medium transition-colors"
            >
                Ver todo el historial
            </Link>
        </div>
    );
}