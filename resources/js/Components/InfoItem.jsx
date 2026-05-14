import React from 'react';
import { 
  User, Shield, Mail, CreditCard, 
  Phone, Building2, Briefcase, Network, HelpCircle 
} from 'lucide-react';

export default function InfoItem({ label, value }) {
  // Selector dinámico de iconos según el label recibido
  const getIcon = (labelText) => {
    const cleanLabel = labelText.toLowerCase().trim();
    if (cleanLabel.includes('nombre')) return User;
    if (cleanLabel.includes('usuario')) return Shield;
    if (cleanLabel.includes('correo')) return Mail;
    if (cleanLabel.includes('carnet') || cleanLabel.includes('ci')) return CreditCard;
    if (cleanLabel.includes('celular') || cleanLabel.includes('teléfono')) return Phone;
    if (cleanLabel.includes('empresa')) return Building2;
    if (cleanLabel.includes('cargo')) return Briefcase;
    if (cleanLabel.includes('área') || cleanLabel.includes('area')) return Network;
    //actividad
    if (cleanLabel.includes('actividad')) return Briefcase;
    //pasantia
    if (cleanLabel.includes('pasantia')) return Briefcase;
    //pasante
    if (cleanLabel.includes('pasante')) return User;
    //bitacora
    if (cleanLabel.includes('bitacora')) return Briefcase;
    //evaluacion
    if (cleanLabel.includes('evaluacion')) return Briefcase;
    return HelpCircle;
  };

  const Icon = getIcon(label);

  return (
    <div className="flex items-center gap-3.5 p-4 bg-white rounded-xl border border-gray-100 shadow-sm transition-all duration-200 hover:shadow-md hover:border-gray-200">
      {/* Contenedor del Icono */}
      <div className="p-2.5 bg-slate-50 text-slate-500 rounded-lg shrink-0 border border-slate-100">
        <Icon size={18} strokeWidth={2} />
      </div>
      
      {/* Contenido de Texto */}
      <div className="flex flex-col min-w-0">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          {label}
        </span>
        <span className="text-sm font-medium text-gray-800 truncate" title={value || '—'}>
          {value || '—'}
        </span>
      </div>
    </div>
  );
}
