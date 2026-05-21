import React from "react";

export default function KpiCards({ cards }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {cards.map((card, i) => {
                const Icon = card.icon;
                return (
                    <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 transition-all hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm font-medium">{card.label}</p>
                                <p className="text-3xl font-bold text-slate-800 mt-1">{card.value}</p>
                            </div>
                            <div className={`h-12 w-12 rounded-full ${card.bg} flex items-center justify-center`}>
                                <Icon size={24} className={card.color} />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}