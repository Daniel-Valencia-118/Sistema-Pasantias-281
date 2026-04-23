import React, { useEffect, useState } from 'react';
import Section from '../UI/Section';
import Card from '../UI/Card';
import PresentacionService from '@/Services/PresentacionService';
import { HiAcademicCap, HiEye } from 'react-icons/hi';

export default function MissionSection() {
    const [mision, setMision] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPresentacion();
    }, []);

    const loadPresentacion = async () => {
        try {
            const data = await PresentacionService.getPresentacion();
            setMision(data.mision);
            // console.log(data.mision);
        } catch (error) {
            console.error('Error cargando misión:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">Cargando...</div>
                </div>
            </div>
        );
    }

  return (
    <Section 
      title="Nuestra Misión" 
      subtitle="Impulsamos el desarrollo profesional de los estudiantes"
      className="bg-white"
    >
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div className="order-2 md:order-1">
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80"
              alt="Misión - colaboración"
              className="rounded-2xl shadow-lg w-full h-auto object-cover"
            />
            <div className="absolute inset-0 bg-secondary-teal/10 rounded-2xl"></div>
          </div>
        </div>
        <div className="order-1 md:order-2 space-y-6">
          <Card className="border-l-4 border-secondary-teal">
            <p className="text-lg leading-relaxed text-primary-slate">
              {mision}              
            </p>
          </Card>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-accent-mint-green/10 p-4 rounded-lg">
              <div className="text-3xl font-bold text-secondary-teal">500+</div>
              <div className="text-primary-slate">Estudiantes activos</div>
            </div>
            <div className="bg-primary-sky-blue/10 p-4 rounded-lg">
              <div className="text-3xl font-bold text-primary-sky-blue">50+</div>
              <div className="text-primary-slate">Empresas asociadas</div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}