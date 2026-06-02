import React from 'react';
import { Filter, Users, BrainCircuit, RotateCcw } from 'lucide-react';

export default function ActionToolbar({ setMostrarFiltro, mostrarFiltro }) {
  const iconSize = 18;
  const buttonClass = "btn btn-outline-light btn-sm d-flex align-items-center gap-2 px-3 py-1";
  const iconClass = "text-secondary";

  return (
    <div className="action-toolbar d-flex justify-content-between align-items-center">
      <div className="d-flex align-items-center gap-2">
        <button 
          className={`${buttonClass} ${mostrarFiltro ? 'active' : ''}`} 
          onClick={() => setMostrarFiltro(!mostrarFiltro)}
        >
          <Filter size={iconSize} className={iconClass} /> Filtrar Jogadores
        </button>
        <button className={buttonClass}>
          <Users size={iconSize} className={iconClass} /> Mostrar Técnicos
        </button>
        <button className={buttonClass}>
          <BrainCircuit size={iconSize} className={iconClass} /> Média do Time
        </button>
      </div>

      <button className={`${buttonClass} px-3`}>
        <RotateCcw size={iconSize} className={iconClass} /> Atualizar
      </button>
    </div>
  );
}