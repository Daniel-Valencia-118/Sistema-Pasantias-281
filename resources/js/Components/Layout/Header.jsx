import React from 'react';
import { Link } from '@inertiajs/react';
import Container from '../UI/Container';
import Button from '../UI/Button';

export default function Header() {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <Container>
        <div className="flex items-center justify-between py-4">
          {/* Logo y título */}
          <div className="flex items-center space-x-3">
            <img 
              src="/images/logo.png" 
              alt="Logo" 
              className="h-20 w-auto"
              onError={(e) => {
                // Placeholder temporal hasta tener el logo
                e.target.style.display = 'none';
              }}
            />
            {/* {!document.querySelector('img[src="/images/logo.png"]')?.complete && (
              <div className="h-12 w-12 bg-primary-navy rounded-lg flex items-center justify-center text-white font-bold text-xl">
                SP
              </div>
            )} */}
            <div className="hidden md:block">
              <h1 className="font-sora  text-primary-navy font-bold text-2xl leading-tight">
                SISTEMA DE GESTIÓN
              </h1>
              <p className="text-primary-slate text-lg">DE PASANTÍAS</p>
            </div>
          </div>

          {/* Botón de inicio de sesión */}
          <Button href={route('login')} variant="primary">
            Iniciar Sesión
          </Button>
        </div>
      </Container>
    </header>
  );
}