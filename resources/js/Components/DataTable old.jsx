import React from 'react';

export default function DataTable({ columns, data, rowKey = 'id', emptyMessage = 'No hay datos disponibles' }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gradient-to-r from-primary-navy to-primary-slate sticky top-0">
                        <tr>
                            {columns.map(col => (
                                <th key={col.key} className="px-6 py-4 text-left text-white text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {data.length > 0 ? (
                            data.map(row => (
                                <tr key={row[rowKey] ?? Math.random()} className="hover:bg-gray-50/50 transition-colors">
                                    {columns.map(col => (
                                        <td key={col.key} className="px-6 py-4 text-sm text-gray-900">
                                            {col.render ? col.render(row) : row[col.key]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                                    <p className="text-lg font-medium">{emptyMessage}</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}