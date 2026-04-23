import React from 'react';
import Container from './Container';

export default function Section({ 
  children, 
  title, 
  subtitle, 
  className = '', 
  containerClassName = '',
  ...props 
}) {
  return (
    <section className={`py-16 md:py-24 ${className}`} {...props}>
      <Container className={containerClassName}>
        {(title || subtitle) && (
          <div className="text-center max-w-3xl mx-auto mb-12">
            {title && (
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-navy mb-4">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-lg md:text-xl text-primary-slate/80">
                {subtitle}
              </p>
            )}
          </div>
        )}
        {children}
      </Container>
    </section>
  );
}