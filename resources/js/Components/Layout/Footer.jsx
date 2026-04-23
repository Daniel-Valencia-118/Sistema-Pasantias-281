import React from 'react';
import Container from '../UI/Container';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary-navy text-white py-8">
      <Container>
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="font-sora text-xl font-semibold">Sistema de Gestión de Pasantías</p>
            <p className="text-white/70 text-sm mt-1">
              Conectando estudiantes, empresas y universidad
            </p>
          </div>
          <div className="text-white/70 text-sm">
            © {currentYear} - Todos los derechos reservados
          </div>
        </div>
      </Container>
    </footer>
  );
}