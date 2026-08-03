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
    
    // Solo mostramos Usos Múltiples ya que se eliminaron los otros salones
    const lista = estudiantes;
    const ninos = lista.filter(e => e.genero === 'Niño').length;
    const ninas = lista.filter(e => e.genero === 'Niña').length;

    return (
      <div className="glass-panel" style={{ animation: 'fadeIn 0.3s ease-out' }}>
        <button 
          onClick={() => setCarpetaSeleccionada(null)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', marginBottom: '1.5rem', fontSize: '1rem' }}
        >
          <ChevronLeft size={20} /> Volver a las carpetas
        </button>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <Folder color="var(--accent-primary)" size={28} />
            Asistencia del {formatearFecha(carpetaSeleccionada.fecha)} — Usos Múltiples
          </h2>
          <span className="salon-badge" style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
            Total: {lista.length} | {ninos} Niños | {ninas} Niñas
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {lista.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', gridColumn: '1 / -1', textAlign: 'center' }}>
              No hubo asistencia registrada en este domingo.
            </p>
          ) : (
            lista.map(e => (
              <div key={e.id || e.nombre + e.apellido} className="estudiante-item" style={{ borderLeft: `4px solid ${e.genero === 'Niña' ? '#ec4899' : e.genero === 'Niño' ? 'var(--accent-primary)' : 'var(--text-secondary)'}`, padding: '1rem' }}>
                <div className="estudiante-nombre" style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{e.nombre} {e.apellido}</div>
                {e.edad && <div className="estudiante-edad" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{e.edad} años ({e.genero || 'No especificado'})</div>}
                {e.nombre_representante && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
                    Representante: {e.nombre_representante}
                  </div>
                )}
              </div>
            ))
          )}
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
