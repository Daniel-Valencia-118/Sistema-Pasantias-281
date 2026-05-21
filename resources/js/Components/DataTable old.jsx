import React, { useState, useMemo } from 'react';
import { 
    Search, ArrowUpDown, ChevronUp, ChevronDown, 
    Inbox 
} from 'lucide-react';

export default function DataTable({ 
    columns = [], 
    data = [], 
    actionsRender,
    searchPlaceholder = "Buscar en los registros...",
    showSearch = true,
}) {
    const [searchTerm, setSearchTerm] = useState("");
    const [sortField, setSortField] = useState("");
    const [sortDirection, setSortDirection] = useState("asc");

    // --- Lógica de Ordenamiento (Se mantiene idéntica) ---
    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    // --- Procesamiento de Datos (Se mantiene idéntica) ---
    const processedData = useMemo(() => {
        let result = [...data];

        // 1. Filtrado Global
        if (searchTerm) {
            result = result.filter((row) => {
                return columns.some(col => {
                    const value = row[col.key];
                    return String(value).toLowerCase().includes(searchTerm.toLowerCase());
                });
            });
        }

        // 2. Ordenamiento
        if (sortField) {
            result.sort((a, b) => {
                const aVal = a[sortField] ?? '';
                const bVal = b[sortField] ?? '';
                
                if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
                if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [data, searchTerm, sortField, sortDirection, columns]);

    // --- Icono de Ordenamiento Minimalista y Animado ---
    const SortIcon = ({ field }) => {
        if (sortField !== field) {
            return <ArrowUpDown size={14} className="text-slate-400 opacity-40 group-hover:opacity-100 transition-opacity duration-200" />;
        }
        return sortDirection === "asc" ? (
            <ChevronUp size={14} className="text-blue-600 animate-fade-in" />
        ) : (
            <ChevronDown size={14} className="text-blue-600 animate-fade-in" />
        );
    };

    return (
        <div className="w-full space-y-4">
            {/* Buscador Superior Rediseñado */}
            {showSearch && (
                <div className="relative max-w-sm group">
                    <Search 
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors duration-200" 
                        size={16} 
                    />
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/80 transition-all duration-200 shadow-sm"
                    />
                </div>
            )}

            {/* Contenedor de Tabla Minimalista Elegante */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/75 border-b border-slate-100">
                                <th className="pl-6 pr-4 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest w-16 text-center">
                                    #
                                </th>
                                {columns.map((col) => (
                                    <th 
                                        key={col.key}
                                        className={`px-6 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest ${
                                            col.sortable ? 'cursor-pointer select-none group hover:bg-slate-100/50 transition-colors duration-150' : ''
                                        }`}
                                        onClick={() => col.sortable && handleSort(col.key)}
                                    >
                                        <div className={`flex items-center gap-2 ${col.align === 'center' ? 'justify-center' : ''}`}>
                                            <span>{col.label}</span>
                                            {col.sortable && <SortIcon field={col.key} />}
                                        </div>
                                    </th>
                                ))}
                                {actionsRender && (
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">
                                        Acciones
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {processedData.length > 0 ? (
                                processedData.map((row, idx) => (
                                    <tr 
                                        key={idx} 
                                        className="hover:bg-slate-50/60 transition-colors duration-150 group"
                                    >
                                        <td className="pl-6 pr-4 py-4 text-xs font-semibold text-slate-400 text-center">
                                            {String(idx + 1).padStart(2, '0')}
                                        </td>
                                        {columns.map((col) => (
                                            <td 
                                                key={col.key} 
                                                className={`px-6 py-4 text-sm text-slate-600 font-medium ${
                                                    col.align === 'center' ? 'text-center' : ''
                                                }`}
                                            >
                                                {col.render ? col.render(row[col.key], row) : row[col.key]}
                                            </td>
                                        ))}
                                        {actionsRender && (
                                            <td className="px-6 py-4 text-sm text-right align-middle">
                                                <div className="flex justify-end items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity duration-150">
                                                    {actionsRender(row)}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                /* Estado Vacío Pulido */
                                <tr>
                                    <td colSpan={columns.length + 2} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                                            <div className="bg-slate-50 p-4 rounded-full border border-slate-100 mb-3 animate-pulse">
                                                <Inbox size={28} className="text-slate-400" />
                                            </div>
                                            <h3 className="text-sm font-semibold text-slate-700">No se encontraron registros</h3>
                                            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                                No hay información disponible que coincida con los criterios de búsqueda actuales.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}