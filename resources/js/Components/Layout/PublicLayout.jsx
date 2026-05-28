import React from 'react';
import Header from './Header';
import Footer from './Footer';

// Recibimos infoSistema y loading desde el componente padre (Welcome)
export default function PublicLayout({ children, infoSistema, loading }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Pasamos los datos al Header para que el logo y el título cambien dinámicamente */}
      <Header infoSistema={infoSistema} loading={loading} />
      
      <main className="flex-grow">
        {children}
      </main>
      
      <Footer infoSistema={infoSistema} />
    </div>
  );
}