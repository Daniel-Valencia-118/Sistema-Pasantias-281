import React from 'react';
import Container from '../UI/Container';
import Button from '../UI/Button';
import ApplicationLogo from '../ApplicationLogo'; // Ajusta la ruta a tu logo

export default function Header({ infoSistema, loading }) {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <Container>
        <div className="flex items-center justify-between py-4">
          
          {/* Enviamos los datos dinámicos al componente del Logo */}
          <ApplicationLogo 
            logoUrl={infoSistema?.logo_url} 
            nombreSistema={infoSistema?.nombre_sistema} 
            className='scale-125'
            showText={true} 
          />

          <Button href={route('login')} variant="primary">
            Iniciar Sesión
          </Button>
        </div>
      </Container>
    </header>
  );
}