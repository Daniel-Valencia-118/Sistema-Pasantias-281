import React from 'react';
import Container from '../UI/Container';
import Button from '../UI/Button';

export default function HeroSection({ infoSistema, loading }) {
  // Opcional: Un esqueleto de carga rápido para evitar parpadeos de texto
  if (loading) {
    return (
      <section className="bg-gradient-to-br from-white to-blue-50/50 py-16 md:py-24 animate-pulse">
        <Container>
          <div className="h-12 bg-gray-200 rounded w-3/4 mb-6"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
        </Container>
      </section>
    );
  }

  return (
    <section className="bg-gradient-to-br from-white to-blue-50/50 py-16 md:py-24">
      <Container>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            
            {/* Título principal enfocado en Marketing/Conversión */}
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-navy leading-tight">
              Conecta tu futuro profesional con{' '}
              <span className="text-primary-sky-blue">oportunidades reales</span>
            </h2>
            
            {/* DESCRIPCIÓN CORTA TRAÍDA DE LA BASE DE DATOS */}
            <p className="text-lg md:text-xl text-primary-slate/80 max-w-lg">
              {infoSistema?.descripcion_corta || 
                "Plataforma integral que facilita la gestión de pasantías entre estudiantes, empresas y la universidad."
              }
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Button href={route('register')} size="lg">
                Comenzar ahora
              </Button>
              <Button href="#about" variant="outline" size="lg">
                Conocer más
              </Button>
            </div>
          </div>
          
          <div className="relative">
            <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&auto=format&fit=crop&w=1974&q=80" 
                alt="Estudiantes trabajando"
                className="w-full h-auto object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 w-64 h-64 bg-accent-mint-green/20 rounded-full -z-10"></div>
            <div className="absolute -top-6 -left-6 w-40 h-40 bg-primary-sky-blue/20 rounded-full -z-10"></div>
          </div>
        </div>
      </Container>
    </section>
  );
}