import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Folder, ChevronLeft, Calendar, Trash2 } from 'lucide-react';

export default function HistorialDomingos() {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [carpetaSeleccionada, setCarpetaSeleccionada] = useState(null);

  useEffect(() => {
    fetchHistorial();
  }, []);

  const fetchHistorial = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('historial_domingos')
      .select('*')
      .order('fecha', { ascending: false });

    if (error) {
      console.error('Error fetching historial:', error);
    } else {
      setHistorial(data || []);
    }
    setLoading(false);
  };

  const handleEliminarCarpeta = async (e, id) => {
    e.stopPropagation(); // Evitar abrir la carpeta
    if (window.confirm('¿Estás seguro de que quieres eliminar este registro de asistencia?')) {
      const { error } = await supabase.from('historial_domingos').delete().eq('id', id);
      if (error) {
        console.error('Error deleting:', error);
        alert('Hubo un error al eliminar el registro.');
      } else {
        fetchHistorial();
      }
    }
  };

  const formatearFecha = (fechaISO) => {
    // Si la fecha viene como string yyyy-mm-dd
    const partes = fechaISO.split('-');
    if (partes.length === 3) {
      return `${partes[2]}/${partes[1]}/${partes[0]}`; // dd/mm/yyyy
    }
    return fechaISO;
  };

  if (loading) {
    return <div className="glass-panel" style={{ textAlign: 'center' }}>Cargando historial...</div>;
  }

  if (carpetaSeleccionada) {
    const estudiantes = carpetaSeleccionada.estudiantes || [];
    
    // Agrupar
    const agrupados = {
      'Comedor': estudiantes.filter(e => e.salon_actual === 'Comedor'),
      'Usos Múltiples': estudiantes.filter(e => e.salon_actual === 'Usos Múltiples'),
      'Principal': estudiantes.filter(e => e.salon_actual === 'Principal')
    };

    return (
      <div className="glass-panel" style={{ animation: 'fadeIn 0.3s ease-out' }}>
        <button 
          onClick={() => setCarpetaSeleccionada(null)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', marginBottom: '1.5rem', fontSize: '1rem' }}
        >
          <ChevronLeft size={20} /> Volver a las carpetas
        </button>

        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <Folder color="var(--accent-primary)" size={28} />
          Asistencia del {formatearFecha(carpetaSeleccionada.fecha)}
        </h2>

        <div className="salones-grid">
          {Object.entries(agrupados).map(([salon, lista]) => (
            <div key={salon} className="glass-panel salon-card" style={{ padding: '1rem' }}>
              <div className="salon-header" style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem' }}>{salon}</h3>
                <span className="salon-badge">{lista.length}</span>
              </div>
              <div className="salon-list">
                {lista.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center' }}>No hubo asistencia</p>
                ) : (
                  lista.map(e => (
                    <div key={e.id} className="estudiante-item">
                      <div className="estudiante-nombre">{e.nombre} {e.apellido}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Calendar color="var(--accent-primary)" />
        Historial
      </h2>
      
      {historial.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
          No hay registros en el historial.
        </p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
          {historial.map((registro) => (
            <div 
              key={registro.id} 
              onClick={() => setCarpetaSeleccionada(registro)}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--glass-border)',
                borderRadius: '12px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'center'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                e.currentTarget.style.borderColor = 'var(--accent-primary)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = 'var(--glass-border)';
              }}
            >
              <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
                <Folder color="var(--accent-primary)" size={48} style={{ marginBottom: '0.5rem' }} />
                <button
                  onClick={(e) => handleEliminarCarpeta(e, registro.id)}
                  style={{ 
                    position: 'absolute', top: '-10px', right: '-10px', 
                    background: 'rgba(239, 68, 68, 0.2)', border: 'none', 
                    color: '#ef4444', padding: '0.4rem', borderRadius: '50%', 
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                  title="Eliminar historial"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <strong style={{ fontSize: '1rem', color: 'white' }}>
                {formatearFecha(registro.fecha)}
              </strong>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {(registro.estudiantes || []).length} estudiantes
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
