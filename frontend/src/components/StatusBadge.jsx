import React from 'react';

export const StatusBadge = ({ status }) => {
  let colorClasses = 'bg-gray-100 text-gray-800 border-gray-200';
  let label = (status || '').replace(/_/g, ' ');

  switch (status) {
    case 'AVAILABLE':
      colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      break;
    case 'PARTIALLY_ALLOCATED':
      colorClasses = 'bg-amber-50 text-amber-800 border-amber-200';
      break;
    case 'FULLY_ALLOCATED':
      colorClasses = 'bg-blue-50 text-blue-800 border-blue-200';
      break;
    case 'PENDING':
      colorClasses = 'bg-orange-50 text-orange-800 border-orange-200';
      break;
    case 'ASSIGNED':
      colorClasses = 'bg-indigo-50 text-indigo-800 border-indigo-200';
      break;
    case 'PICKED_UP':
      colorClasses = 'bg-purple-50 text-purple-800 border-purple-200';
      break;
    case 'IN_TRANSIT':
      colorClasses = 'bg-sky-50 text-sky-800 border-sky-200';
      break;
    case 'DELIVERED':
    case 'CONFIRMED':
      colorClasses = 'bg-green-50 text-green-800 border-green-200';
      break;
    case 'EXPIRED':
      colorClasses = 'bg-red-50 text-red-800 border-red-200';
      break;
    case 'CANCELLED':
      colorClasses = 'bg-stone-100 text-stone-700 border-stone-200';
      break;
    default:
      break;
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${colorClasses}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-70"></span>
      {label}
    </span>
  );
};
