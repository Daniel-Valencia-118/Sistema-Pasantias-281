import React, { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import PublicLayout from '@/Components/Layout/PublicLayout';
import HeroSection from '@/Components/Home/HeroSection';
import NosotrosContainer from '@/Components/Home/NosotrosContainer';
import AboutSection from '@/Components/Home/AboutSection';

export default function Welcome() {
    const [infoSistema, setInfoSistema] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadConfiguracion = async () => {
            try {
                const response = await axios.get('/api/configuracion-publica');
                setInfoSistema(response.data);
            } catch (error) {
                console.error('Error al cargar la configuración global:', error);
            } finally {
                setLoading(false);
            }
        };

        loadConfiguracion();
    }, []);

    return (
        <>
            <Head title="Inicio" />
            
            {/* Enviamos el estado de carga y la info al Layout para el Header */}
            <PublicLayout infoSistema={infoSistema} loading={loading}>
                
                {/* Pasamos los datos dinámicos al Hero */}
                <HeroSection 
                    infoSistema={infoSistema}
                    loading={loading}
                />
                
                {/* Pasamos los datos de misión y visión al contenedor */}
                <NosotrosContainer 
                    infoSistema={infoSistema} 
                    loading={loading} 
                />

                <AboutSection />
            </PublicLayout>
        </>
    );
}