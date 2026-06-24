import React, { useState } from 'react';
import FormularioIngreso from './components/FormularioIngreso';
import ListaEstudiantes from './components/ListaEstudiantes';
import { Sparkles } from 'lucide-react';

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleEstudianteAgregado = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="container">
      <header>
        <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <Sparkles color="#8b5cf6" size={32} />
          Maranatha
        </h1>
        <p>Sistema de Gestión y Transición de Salones</p>
      </header>

      <main className="app-grid">
        <aside>
          <FormularioIngreso onEstudianteAgregado={handleEstudianteAgregado} />
        </aside>
        
        <section>
          <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Panel de Salones</h2>
            <button 
              onClick={() => handleEstudianteAgregado()} 
              style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'white', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}
            >
              Actualizar
            </button>
          </div>
          <ListaEstudiantes refreshTrigger={refreshTrigger} />
        </section>
      </main>
    </div>
  );
}

export default App;
