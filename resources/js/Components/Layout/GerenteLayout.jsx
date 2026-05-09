import React from "react";
import { Head, usePage } from "@inertiajs/react";
import Sidebar from "@/Components/Sidebar";

export default function GerenteLayout({ children}) {
    const { auth } = usePage().props;
    return (
        <>
            <Head title="Gerente" />
            <div className="min-h-screen bg-gray-100 flex">
                <Sidebar auth={auth} />
                <main className="flex-1 overflow-x-auto">
                    <div className="p-6">{children}</div>
                </main>
            </div>
        </>
    );
}