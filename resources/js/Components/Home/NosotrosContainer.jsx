import React from 'react';
import MissionSection from './MissionSection';
import VisionSection from './VisionSection';

export default function NosotrosContainer({ infoSistema, loading }) {
    // Reutilizamos tu esqueleto (Skeleton) mientras el padre (Welcome) carga los datos
    if (loading) {
        return (
            <div className="py-20 bg-white space-y-12 animate-pulse max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="h-8 bg-gray-200 rounded w-1/4 mx-auto mb-12"></div>
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="h-64 bg-gray-200 rounded-2xl"></div>
                    <div className="space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <MissionSection mision={infoSistema?.mision} />
            <VisionSection vision={infoSistema?.vision} />
        </>
    );
}