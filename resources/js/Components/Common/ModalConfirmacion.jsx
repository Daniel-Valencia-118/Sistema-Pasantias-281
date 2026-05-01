import React from "react";
import { X, AlertTriangle, ShieldAlert, Info } from "lucide-react";

export default function ModalConfirmacion({
    isOpen,
    onClose,
    onConfirm,
    onCancel,
    titulo,
    mensaje,
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    type = "warning",
}) {
    if (!isOpen) return null;

    const config = {
        warning: {
            icon: AlertTriangle,
            bg: "bg-yellow-50",
            border: "border-yellow-200",
            textColor: "text-yellow-800",
            buttonBg: "bg-yellow-500 hover:bg-yellow-600",
            iconColor: "text-yellow-500",
        },
        danger: {
            icon: ShieldAlert,
            bg: "bg-red-50",
            border: "border-red-200",
            textColor: "text-red-800",
            buttonBg: "bg-red-500 hover:bg-red-600",
            iconColor: "text-red-500",
        },
        info: {
            icon: Info,
            bg: "bg-blue-50",
            border: "border-blue-200",
            textColor: "text-blue-800",
            buttonBg: "bg-primary-blue hover:bg-primary-sky-blue",
            iconColor: "text-blue-500",
        },
    };

    const {
        icon: Icon,
        bg,
        border,
        textColor,
        buttonBg,
        iconColor,
    } = config[type] || config.warning;
    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        } else {
            onClose();
        }
    };
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
            <div
                className={`bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all ${border} border-t-4`}
            >
                <div className="flex items-center justify-between p-4 border-b">
                    <div className={`flex items-center gap-3 ${textColor}`}>
                        <div className={`p-2 rounded-full ${bg}`}>
                            <Icon size={22} className={iconColor} />
                        </div>
                        <h3 className="text-lg font-bold">{titulo}</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    <p className="text-gray-600 text-center">{mensaje}</p>
                </div>

                <div className="flex justify-end gap-3 p-4 border-t bg-gray-50 rounded-b-xl">
                    <button
                        onClick={handleCancel}
                        className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-all cursor-pointer font-medium"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm(); // onConfirm ya se encarga de cerrar el modal
                        }}
                        className={`px-5 py-2 rounded-lg text-white transition-all cursor-pointer font-medium shadow-sm hover:shadow-md ${buttonBg}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
