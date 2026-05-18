import React from 'react';

export default function ProgressBar({ percentage = 0 }) {
    // Aseguramos que el valor esté entre 0 y 100
    const safePercentage = Math.min(Math.max(parseInt(percentage || 0, 10), 0), 100);

    // Color semántico según el avance de la actividad
    const getColor = (value) => {
        if (value >= 80) return 'bg-emerald-500';
        if (value >= 40) return 'bg-amber-500';
        return 'bg-blue-500';
    };

    return (
        <div className="w-full space-y-1">
            <div className="flex justify-between items-center text-[11px] font-bold text-slate-500">
                <span>Progreso de Actividad</span>
                <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                    {safePercentage}%
                </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/50">
                <div
                    className={`h-full transition-all duration-500 ease-out ${getColor(safePercentage)}`}
                    style={{ width: `${safePercentage}%` }}
                />
            </div>
        </div>
    );
}