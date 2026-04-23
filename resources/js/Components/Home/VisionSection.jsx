import React from 'react';
import Section from '../UI/Section';
import Card from '../UI/Card';

export default function VisionSection() {
  return (
    <Section 
      title="Nuestra Visión" 
      subtitle="Transformando la experiencia de pasantías"
      className="bg-gray-50"
    >
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-6">
          <Card className="border-r-4 border-primary-sky-blue">
            <p className="text-lg leading-relaxed text-primary-slate">
              Ser el puente de referencia entre la academia y el mundo laboral, creando un ecosistema donde cada pasantía sea una experiencia transformadora que impulse carreras y fortalezca organizaciones.
            </p>
          </Card>
          <div className="flex space-x-4">
            <div className="bg-primary-blue/10 p-4 rounded-lg flex-1 text-center">
              <div className="text-2xl font-bold text-primary-blue">100%</div>
              <div className="text-sm text-primary-slate">Seguimiento digital</div>
            </div>
            <div className="bg-secondary-teal/10 p-4 rounded-lg flex-1 text-center">
              <div className="text-2xl font-bold text-secondary-teal">24/7</div>
              <div className="text-sm text-primary-slate">Acceso a la plataforma</div>
            </div>
          </div>
        </div>
        <div>
          <img 
            src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80"
            alt="Visión - futuro profesional"
            className="rounded-2xl shadow-lg w-full h-auto object-cover"
          />
        </div>
      </div>
    </Section>
  );
}