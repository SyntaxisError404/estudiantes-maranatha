import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Users, User, ShieldCheck, Trash2, Folder, ChevronLeft } from 'lucide-react';

export default function ListaEstudiantes({ refreshTrigger }) {
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [salonSeleccionado, setSalonSeleccionado] = useState(null);

  useEffect(() => {
    fetchEstudiantes();
  }, [refreshTrigger]);

  const fetchEstudiantes = async () => {
    setLoading(true);
    // Consultamos la vista en lugar de la tabla para obtener la edad dinámica calculada por la BD
    const { data, error } = await supabase
      .from('vista_estudiantes')
      .select('*')
      .eq('activo_este_domingo', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching estudiantes:', error);
    } else {
      setEstudiantes(data || []);
    }
    setLoading(false);
  };

  const handleRemoverEstudiante = async (id) => {
    if (window.confirm('¿Deseas remover a este estudiante de la asistencia de hoy?')) {
      const { error } = await supabase
        .from('estudiantes')
        .update({ activo_este_domingo: false })
        .eq('id', id);
      
      if (error) {
        console.error('Error removing student:', error);
        alert('Hubo un error al remover al estudiante.');
      } else {
        fetchEstudiantes();
      }
    }
  };

  // Agrupamos dinámicamente por la edad calculada para que la "graduación" sea automática
  // Si cumplen la edad hoy, automáticamente aparecen en el salón correcto sin importar su registro original.
  const agrupados = {
    'Usos Múltiples': estudiantes.filter(e => e.edad >= 8 && e.edad <= 12),
    'Principal': estudiantes.filter(e => e.edad >= 13)
  };

  if (loading) {
    return <div className="glass-panel" style={{ textAlign: 'center' }}>Cargando datos...</div>;
  }

  // VISTA NIVEL 2: Detalle de un salón
  if (salonSeleccionado) {
    const lista = agrupados[salonSeleccionado];
    const ninos = lista.filter(e => e.genero === 'Niño').length;
    const ninas = lista.filter(e => e.genero === 'Niña').length;
    
    let icono;
    if (salonSeleccionado === 'Usos Múltiples') { icono = <Users size={28} color="var(--accent-primary)"/>; }
    else { icono = <User size={28} color="var(--accent-primary)"/>; }

    return (
      <div className="glass-panel" style={{ animation: 'fadeIn 0.3s ease-out' }}>
        <button 
          onClick={() => setSalonSeleccionado(null)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', marginBottom: '1.5rem', fontSize: '1rem' }}
        >
          <ChevronLeft size={20} /> Volver a los salones
        </button>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            {icono}
            Salón {salonSeleccionado}
          </h2>
          <span className="salon-badge" style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
            Total: {lista.length} | {ninos} Niños | {ninas} Niñas
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
          {lista.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', gridColumn: '1 / -1' }}>No hay estudiantes registrados hoy en este salón.</p>
          ) : (
            lista.map(e => (
              <div key={e.id} className="estudiante-item" style={{ borderLeft: `4px solid ${e.genero === 'Niña' ? '#ec4899' : e.genero === 'Niño' ? 'var(--accent-primary)' : 'var(--text-secondary)'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div className="estudiante-nombre">{e.nombre} {e.apellido}</div>
                    <div className="estudiante-edad">{e.edad} años</div>
                    {e.nombre_representante && (
                      <div className="estudiante-rep" style={{ marginTop: '0.5rem', background: 'rgba(251, 191, 36, 0.15)', padding: '0.3rem 0.6rem', borderRadius: '4px', display: 'inline-block' }}>
                        <ShieldCheck size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }}/>
                        Rep: {e.nombre_representante} {e.apellido_representante}
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => handleRemoverEstudiante(e.id)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.2rem' }}
                    title="Remover de la lista de hoy"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // VISTA NIVEL 1: Carpetas
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', animation: 'fadeIn 0.3s ease-out' }}>
      
      {/* Carpeta Usos Múltiples */}
      <div 
        className="glass-panel salon-card" 
        onClick={() => setSalonSeleccionado('Usos Múltiples')}
        style={{ cursor: 'pointer', alignItems: 'center', textAlign: 'center', transition: 'all 0.2s', padding: '2rem' }}
        onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.borderColor = 'var(--accent-primary)'; }}
        onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--glass-border)'; }}
      >
        <Folder color="var(--accent-primary)" fill="var(--glass-border)" size={64} style={{ marginBottom: '1rem' }} />
        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Usos Múltiples</h3>
        <span style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>8 a 12 años</span>
        <span className="salon-badge" style={{ fontSize: '1.1rem', padding: '0.5rem 1rem' }}>
          Total: {agrupados['Usos Múltiples'].length} | {agrupados['Usos Múltiples'].filter(e=>e.genero==='Niño').length} Niños | {agrupados['Usos Múltiples'].filter(e=>e.genero==='Niña').length} Niñas
        </span>
      </div>

      {/* Carpeta Principal */}
      <div 
        className="glass-panel salon-card" 
        onClick={() => setSalonSeleccionado('Principal')}
        style={{ cursor: 'pointer', alignItems: 'center', textAlign: 'center', transition: 'all 0.2s', padding: '2rem' }}
        onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.borderColor = 'var(--accent-primary)'; }}
        onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--glass-border)'; }}
      >
        <Folder color="var(--accent-primary)" fill="var(--glass-border)" size={64} style={{ marginBottom: '1rem' }} />
        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Principal</h3>
        <span style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>13+ años</span>
        <span className="salon-badge" style={{ fontSize: '1.1rem', padding: '0.5rem 1rem' }}>
          Total: {agrupados['Principal'].length} | {agrupados['Principal'].filter(e=>e.genero==='Niño').length} Niños | {agrupados['Principal'].filter(e=>e.genero==='Niña').length} Niñas
        </span>
      </div>

    </div>
  );
}
