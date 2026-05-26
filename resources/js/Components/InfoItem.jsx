import React from 'react';
import { 
  User, Shield, Mail, CreditCard, 
  Phone, Building2, Briefcase, Network, HelpCircle, Link as LinkIcon,
  ClipboardListIcon, SquareChartGanttIcon, CalendarIcon, CheckCircleIcon, XCircleIcon
} from 'lucide-react';

export default function InfoItem({ icon = HelpCircle, label, value }) {

  // trasformamos la cadena icon en un componente de React
  const Icon = typeof icon === 'string' ? eval(icon) : icon;

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
