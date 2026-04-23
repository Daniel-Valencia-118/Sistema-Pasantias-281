import React from "react";
import { Link } from "@inertiajs/react";
import PresentacionService from '@/Services/PresentacionService';

export default function ApplicationLogo({ className = "", showText = false }) {
    return (
        <Link
            href={route("welcome")}
            className={`flex items-center gap-3 ${className}`}
        >
            <img
                src="/images/logo.png"
                alt="Logo"
                className="h-18 w-auto"
                onError={(e) => {
                    <div className="h-10 w-10 bg-gradient-to-br from-primary-blue to-primary-sky-blue rounded-lg flex items-center justify-center shadow-md">
                        <span className="text-white font-bold text-xl">SP</span>
                    </div>;
                }}
            />

            {showText && (
                <span className="font-display text-2xl font-bold text-primary-navy tracking-tight">
                    SISTEMA DE GESTIÓN DE PASANTÍAS
                </span>
            )}
        </Link>
    );
}
