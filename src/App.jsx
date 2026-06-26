import React, { useState } from 'react';
import FormularioIngreso from './components/FormularioIngreso';
import ListaEstudiantes from './components/ListaEstudiantes';
import HistorialDomingos from './components/HistorialDomingos';
import { Sparkles, Archive, Users } from 'lucide-react';
import { supabase } from './lib/supabase';

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [vistaActiva, setVistaActiva] = useState('principal'); // 'principal' o 'historial'
  const [isCerrando, setIsCerrando] = useState(false);

  const handleEstudianteAgregado = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleCerrarDomingo = async () => {
    if (!window.confirm('¿Estás seguro de que quieres cerrar el registro de este día? Esto guardará la asistencia actual en una carpeta y limpiará la lista principal para el próximo día.')) {
      return;
    }

    setIsCerrando(true);
    try {
      // 1. Obtener todos los estudiantes que están activos este domingo
      const { data: activos, error: errFetch } = await supabase
        .from('vista_estudiantes')
        .select('*')
        .eq('activo_este_domingo', true);

      if (errFetch) throw errFetch;

      if (!activos || activos.length === 0) {
        alert('No hay estudiantes en la lista actual para guardar.');
        setIsCerrando(false);
        return;
      }

      // 2. Guardar en historial_domingos
      const { error: errInsert } = await supabase
        .from('historial_domingos')
        .insert([{ estudiantes: activos }]);
      
      if (errInsert) throw errInsert;

      // 3. Desactivar a todos los estudiantes (activo_este_domingo = false)
      // Supabase no soporta un simple UPDATE sin filtros en el JS client para proteger datos,
      // así que actualizamos usando in filter o actualizando todos los que estén en true.
      const { error: errUpdate } = await supabase
        .from('estudiantes')
        .update({ activo_este_domingo: false })
        .eq('activo_este_domingo', true);
      
      if (errUpdate) throw errUpdate;

      alert('¡Día cerrado correctamente! Los datos se han guardado en el historial.');
      setRefreshTrigger(prev => prev + 1);

    } catch (error) {
      console.error(error);
      alert('Hubo un error al cerrar el día: ' + error.message);
    }
    setIsCerrando(false);
  };

  return (
    <div className="container">
      <header>
        <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          Maranatha Kids
        </h1>
        <p>Sistema de Gestión y Transición de Salones</p>

        {/* Navegación */}
        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button 
            onClick={() => setVistaActiva('principal')}
            className={vistaActiva === 'principal' ? 'btn-primary' : 'btn-secondary'}
            style={vistaActiva !== 'principal' ? { background: 'var(--glass-bg)', color: 'white', border: '1px solid var(--glass-border)', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer' } : {}}
          >
            <Users size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }}/> 
            Panel Actual
          </button>
          <button 
            onClick={() => setVistaActiva('historial')}
            className={vistaActiva === 'historial' ? 'btn-primary' : 'btn-secondary'}
            style={vistaActiva !== 'historial' ? { background: 'var(--glass-bg)', color: 'white', border: '1px solid var(--glass-border)', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer' } : {}}
          >
            <Archive size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }}/> 
            Ver Historial
          </button>
        </div>
      </header>

      {vistaActiva === 'principal' ? (
        <main className="app-grid">
          <aside>
            <FormularioIngreso onEstudianteAgregado={handleEstudianteAgregado} />
          </aside>
          
          <section>
            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Panel de Salones (Hoy)</h2>
              
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  onClick={() => handleEstudianteAgregado()} 
                  style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'white', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}
                >
                  Actualizar
                </button>
                <button 
                  onClick={handleCerrarDomingo} 
                  disabled={isCerrando}
                  style={{ background: 'var(--accent-gradient)', border: 'none', color: 'white', padding: '0.5rem 1rem', borderRadius: '8px', cursor: isCerrando ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
                >
                  {isCerrando ? 'Cerrando...' : 'Cerrar Día'}
                </button>
              </div>
            </div>
            <ListaEstudiantes refreshTrigger={refreshTrigger} />
          </section>
        </main>
      ) : (
        <main style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <HistorialDomingos />
        </main>
      )}
    </div>
  );
}

export default App;
