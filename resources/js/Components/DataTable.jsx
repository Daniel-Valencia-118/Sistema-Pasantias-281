// resources/js/Components/DataTable.jsx
import React from 'react';

// DataTable.jsx actualizado
export default function DataTable({ columns, data, actionsRender }) {
    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {columns.map(col => (
                                <th key={col.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {col.label}
                                </th>
                            ))}
                            {actionsRender && <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.length > 0 ? (
                            data.map((row, rowIdx) => (
                                <tr key={rowIdx} className="hover:bg-gray-50">
                                    {columns.map(col => (
                                        <td key={col.key} className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {col.render ? col.render(row[col.key], row) : row[col.key]}
                                        </td>
                                    ))}
                                    {actionsRender && (
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {actionsRender(row)}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length + (actionsRender ? 1 : 0)} className="px-6 py-4 text-center text-sm text-gray-500">
                                    No hay datos disponibles
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}