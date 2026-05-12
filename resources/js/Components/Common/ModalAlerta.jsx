// resources/js/Components/Common/ModalAlerta.jsx
import React from "react";
import { X, AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";

export default function ModalAlerta({
    isOpen,
    onClose,
    titulo,
    mensaje,
    type = "error",
}) {
    if (!isOpen) return null;

    const config = {
        error: {
            icon: AlertCircle,
            bg: "bg-red-50",
            border: "border-red-200",
            textColor: "text-red-800",
            buttonBg: "bg-red-500 hover:bg-red-600",
            iconColor: "text-red-500",
        },
        success: {
            icon: CheckCircle,
            bg: "bg-green-50",
            border: "border-green-200",
            textColor: "text-green-800",
            buttonBg: "bg-green-500 hover:bg-green-600",
            iconColor: "text-green-500",
        },
        warning: {
            icon: AlertTriangle,
            bg: "bg-yellow-50",
            border: "border-yellow-200",
            textColor: "text-yellow-800",
            buttonBg: "bg-yellow-500 hover:bg-yellow-600",
            iconColor: "text-yellow-500",
        },
    };

    const c = config[type] || config.error;
    const Icon = c.icon;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
                <div
                    className={`flex items-center justify-between p-4 border-b ${c.border}`}
                >
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${c.bg}`}>
                            <Icon size={22} className={c.iconColor} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">
                            {titulo}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6">
                    <p className="text-gray-600 text-center">{mensaje}</p>
                </div>

                <div className="flex justify-center p-4 border-t bg-gray-50 rounded-b-xl">
                    <button
                        onClick={onClose}
                        className={`px-6 py-2 rounded-lg text-white transition-all ${c.buttonBg}`}
                    >
                        Aceptar
                    </button>
                </div>
            </div>
        </div>
    );
}
