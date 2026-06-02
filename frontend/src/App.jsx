import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import AdminArea from './components/AdminArea';

function App() {
  // Estado que controla qual tela está aparecendo
  const [abaAtiva, setAbaAtiva] = useState('dashboard');

  return (
    <div className="app-container min-vh-100 bg-dark text-white">
      
      {/* Barra de Navegação Global */}
      <nav className="navbar navbar-dark mb-2 px-4 py-3" style={{ backgroundColor: '#0a0a0a', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container-fluid d-flex justify-content-between align-items-center">
          <span className="navbar-brand mb-0 h1 fw-bold" style={{ letterSpacing: '-1px' }}>
            IBOTAFOGO <span className="text-secondary ms-2" style={{ fontSize: '0.8rem', letterSpacing: '0' }}>STUDIO</span>
          </span>
          
          <div className="btn-group btn-toggle-group">
            <button 
              className={`btn btn-sm ${abaAtiva === 'dashboard' ? 'active' : 'btn-dark'}`}
              onClick={() => setAbaAtiva('dashboard')}
            >
              Visão Geral (Gráfico)
            </button>
            <button 
              className={`btn btn-sm ${abaAtiva === 'admin' ? 'active' : 'btn-dark'}`}
              onClick={() => setAbaAtiva('admin')}
            >
              Gerenciar Dados
            </button>
          </div>
        </div>
      </nav>

      {/* Renderização Condicional da Tela */}
      <div>
        {abaAtiva === 'dashboard' ? <Dashboard /> : <AdminArea />}
      </div>
      
    </div>
  );
}

export default App;