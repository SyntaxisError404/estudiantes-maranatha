import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Users, User, ShieldCheck } from 'lucide-react';

export default function ListaEstudiantes({ refreshTrigger }) {
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEstudiantes();
  }, [refreshTrigger]);

  const fetchEstudiantes = async () => {
    setLoading(true);
    // Consultamos la vista en lugar de la tabla para obtener la edad dinámica calculada por la BD
    const { data, error } = await supabase
      .from('vista_estudiantes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching estudiantes:', error);
    } else {
      setEstudiantes(data || []);
    }
    setLoading(false);
  };

  const agrupados = {
    'Comedor': estudiantes.filter(e => e.salon_actual === 'Comedor'),
    'Usos Múltiples': estudiantes.filter(e => e.salon_actual === 'Usos Múltiples'),
    'Principal': estudiantes.filter(e => e.salon_actual === 'Principal')
  };

  if (loading) {
    return <div className="glass-panel" style={{ textAlign: 'center' }}>Cargando datos...</div>;
  }

  return (
    <div className="salones-grid">
      
      {/* Salón Comedor */}
      <div className="glass-panel salon-card">
        <div className="salon-header">
          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={20} color="#3b82f6"/> Comedor
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>8 a 11 años</span>
          </div>
          <span className="salon-badge">{agrupados['Comedor'].length}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
          {agrupados['Comedor'].length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center' }}>No hay estudiantes</p>
          ) : (
            agrupados['Comedor'].map(e => (
              <div key={e.id} className="estudiante-item">
                <div className="estudiante-nombre">{e.nombre} {e.apellido}</div>
                <div className="estudiante-edad">{e.edad} años</div>
                {e.nombre_representante && (
                  <div className="estudiante-rep">
                    <ShieldCheck size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }}/>
                    Rep: {e.nombre_representante} {e.apellido_representante}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Salón Usos Múltiples */}
      <div className="glass-panel salon-card">
        <div className="salon-header">
          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={20} color="#8b5cf6"/> Usos Múltiples
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>12 a 15 años</span>
          </div>
          <span className="salon-badge">{agrupados['Usos Múltiples'].length}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
          {agrupados['Usos Múltiples'].length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center' }}>No hay estudiantes</p>
          ) : (
            agrupados['Usos Múltiples'].map(e => (
              <div key={e.id} className="estudiante-item">
                <div className="estudiante-nombre">{e.nombre} {e.apellido}</div>
                <div className="estudiante-edad">{e.edad} años</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Salón Principal */}
      <div className="glass-panel salon-card">
        <div className="salon-header">
          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={20} color="#10b981"/> Principal
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>16+ años</span>
          </div>
          <span className="salon-badge">{agrupados['Principal'].length}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
          {agrupados['Principal'].length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center' }}>No hay estudiantes</p>
          ) : (
            agrupados['Principal'].map(e => (
              <div key={e.id} className="estudiante-item">
                <div className="estudiante-nombre">{e.nombre} {e.apellido}</div>
                <div className="estudiante-edad">{e.edad} años</div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
