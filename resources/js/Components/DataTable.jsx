// resources/js/Components/DataTable.jsx
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

    // --- Lógica de Ordenamiento ---
    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    // --- Procesamiento de Datos (Filtro Global + Orden) ---
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

    const SortIcon = ({ field }) => {
        if (sortField !== field) return <ArrowUpDown size={14} className="text-white/40 group-hover:text-white/100 transition-colors" />;
        return sortDirection === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
    };

    return (
        <div className="w-full">
            {/* Buscador Superior */}
            {showSearch && (
                <div className="mb-5 relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all shadow-sm"
                    />
                </div>
            )}

            {/* Contenedor de Tabla con Estilo Gerente */}
            <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gradient-to-r from-primary-navy to-primary-slate">
                                <th className="px-6 py-4 text-xs font-bold text-white uppercase tracking-wider w-16">
                                    Nro
                                </th>
                                {columns.map((col) => (
                                    <th 
                                        key={col.key}
                                        className={`px-6 py-4 text-xs font-bold text-white uppercase tracking-wider ${col.sortable ? 'cursor-pointer hover:bg-white/10 transition-colors group' : ''}`}
                                        onClick={() => col.sortable && handleSort(col.key)}
                                    >
                                        <div className={`flex items-center gap-2 ${col.align === 'center' ? 'justify-center' : ''}`}>
                                            {col.label}
                                            {col.sortable && <SortIcon field={col.key} />}
                                        </div>
                                    </th>
                                ))}
                                {actionsRender && (
                                    <th className="px-6 py-4 text-xs font-bold text-white uppercase tracking-wider text-right">
                                        Acciones
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {processedData.length > 0 ? (
                                processedData.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-slate-400 font-medium">
                                            {idx + 1}
                                        </td>
                                        {columns.map((col) => (
                                            <td key={col.key} className={`px-6 py-4 text-sm text-slate-600 ${col.align === 'center' ? 'text-center' : ''}`}>
                                                {col.render ? col.render(row[col.key], row) : row[col.key]}
                                            </td>
                                        ))}
                                        {actionsRender && (
                                            <td className="px-6 py-4 text-sm text-right">
                                                <div className="flex justify-end gap-3">
                                                    {actionsRender(row)}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={columns.length + 2} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-400">
                                            <div className="bg-slate-50 p-5 rounded-full mb-4">
                                                <Inbox size={40} className="text-slate-300" />
                                            </div>
                                            <p className="text-lg font-bold text-slate-700">No se encontraron resultados</p>
                                            <p className="text-sm text-slate-500">Prueba con términos de búsqueda diferentes.</p>
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