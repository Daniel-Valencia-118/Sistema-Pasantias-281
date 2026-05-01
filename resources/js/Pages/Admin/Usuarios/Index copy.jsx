import React from 'react';
import { Head } from '@inertiajs/react';
import DashboardLayout from '@/Components/Layout/DashboardLayout';
import DataTable from '@/Components/DataTable';

export default function Index({ usuarios }) {
    const columns = [
        { key: 'nombre', label: 'Nombre' },
        { key: 'correo', label: 'Correo' },
        { key: 'rol', label: 'Rol' },
        { key: 'estado', label: 'Estado' },
    ];

    const data = usuarios.map(u => ({
        nombre: `${u.nombre} ${u.ap_paterno} ${u.ap_materno}`,
        correo: u.correo,
        rol: u.rol == 'admin' ? 'Administrador' :
             u.rol == 'gerente' ? 'Gerente' :
             u.rol == 'jefePas' ? 'Jefe de Pasantía' :
             u.rol == 'tutorAca' ? 'Tutor Académico' :
             u.rol == 'pasante' ? 'Pasante' : 'Usuario',
        estado: u.estado ? 'Activo' : 'Inactivo',
    }));

    return (
        <DashboardLayout>
            <Head title="Todos los Usuarios" />
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-primary-navy">Todos los Usuarios</h1>
                <p className="text-gray-500">Listado completo de usuarios registrados</p>
            </div>
            <DataTable columns={columns} data={data} />
        </DashboardLayout>
    );
}