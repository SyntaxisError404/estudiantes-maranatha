import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { X, Save, User, ShieldCheck, Phone } from 'lucide-react';

function calcularEdad(fechaString) {
  if (!fechaString) return 0;
  const hoy = new Date();
  const cumple = new Date(fechaString);
  let edad = hoy.getFullYear() - cumple.getFullYear();
  const m = hoy.getMonth() - cumple.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < cumple.getDate())) {
    edad--;
  }
  return edad;
}

export default function ModalEditarEstudiante({ estudiante, onClose, onSaved }) {
  const [nombre, setNombre] = useState(estudiante.nombre || '');
  const [apellido, setApellido] = useState(estudiante.apellido || '');
  const [genero, setGenero] = useState(estudiante.genero || 'Niño');
  const [fechaNacimiento, setFechaNacimiento] = useState(estudiante.fecha_nacimiento || '');
  const limpiarRep = (info) => (info || '').replace(/\s*\|\s*Ticket:\s*#?\w+/i, '').replace(/\s*Ticket:\s*#?\w+/i, '').trim();
  const [nombreRep, setNombreRep] = useState(limpiarRep(estudiante.nombre_representante));
  const [telefonoRep, setTelefonoRep] = useState(estudiante.telefono_representante || '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const hoyObj = new Date();
  const fechaHoy = `${hoyObj.getFullYear()}-${String(hoyObj.getMonth() + 1).padStart(2, '0')}-${String(hoyObj.getDate()).padStart(2, '0')}`;
  const edadCalculada = calcularEdad(fechaNacimiento);

  const handleTelefonoChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length === 0) {
      setTelefonoRep('04');
      return;
    }
    if (!val.startsWith('04')) {
      if (val.startsWith('4')) {
        val = '0' + val;
      } else {
        val = '04' + val;
      }
    }
    if (val.length > 11) {
      val = val.slice(0, 11);
    }
    setTelefonoRep(val);
  };

  const extraerTicketOriginal = (repInfo) => {
    if (!repInfo) return null;
    const match = repInfo.match(/Ticket:\s*#?([0-9A-Za-z]+)/i);
    return match ? match[1] : null;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      if (edadCalculada < 8) {
        setErrorMsg('El estudiante debe tener al menos 8 años.');
        setIsSubmitting(false);
        return;
      }
      if (edadCalculada > 13) {
        setErrorMsg('El estudiante no puede tener más de 13 años (Límite permitido: 13 años).');
        setIsSubmitting(false);
        return;
      }

      const salonAsignado = 'Usos Múltiples';

      // Preservar el ticket original si existía
      const ticketOriginal = extraerTicketOriginal(estudiante.nombre_representante);
      let nombreRepFinal = nombreRep.trim();
      if (ticketOriginal && !nombreRepFinal.toLowerCase().includes('ticket:')) {
        nombreRepFinal = `${nombreRepFinal} (Ticket: #${ticketOriginal})`;
      }

      const { error } = await supabase
        .from('estudiantes')
        .update({
          nombre: nombre.trim(),
          apellido: apellido.trim(),
          genero: genero,
          fecha_nacimiento: fechaNacimiento,
          salon_actual: salonAsignado,
          nombre_representante: nombreRepFinal,
          telefono_representante: telefonoRep.trim()
        })
        .eq('id', estudiante.id);

      if (error) throw error;

      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMsg('Error al guardar los cambios: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '520px',
        width: '100%',
        position: 'relative',
        border: '2px solid var(--accent-primary)',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.8rem' }}>
          <h2 style={{ fontSize: '1.4rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white' }}>
            <User color="var(--accent-primary)" size={24} /> Editar Datos del Estudiante
          </h2>
          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
          >
            <X size={24} />
          </button>
        </div>

        {errorMsg && (
          <div className="toast-error" style={{ marginBottom: '1rem' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSave}>
          {/* Datos del Niño */}
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--glass-border)', padding: '1rem', borderRadius: '12px', marginBottom: '1.2rem' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--accent-primary)', marginBottom: '0.8rem' }}>
              Datos del Niño / Niña
            </h3>

            <div className="form-responsive-row">
              <div className="form-group" style={{ marginBottom: '0.8rem' }}>
                <label style={{ fontSize: '0.85rem' }}>Nombre</label>
                <input 
                  type="text" 
                  required 
                  value={nombre} 
                  onChange={e => setNombre(e.target.value)} 
                />
              </div>

              <div className="form-group" style={{ marginBottom: '0.8rem' }}>
                <label style={{ fontSize: '0.85rem' }}>Apellido</label>
                <input 
                  type="text" 
                  required 
                  value={apellido} 
                  onChange={e => setApellido(e.target.value)} 
                />
              </div>
            </div>

            <div className="form-responsive-row">
              <div className="form-group" style={{ marginBottom: '0.8rem' }}>
                <label style={{ fontSize: '0.85rem' }}>Género</label>
                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.4rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                    <input 
                      type="radio" 
                      name="generoModal" 
                      value="Niño" 
                      checked={genero === 'Niño'} 
                      onChange={e => setGenero(e.target.value)} 
                    /> Niño
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                    <input 
                      type="radio" 
                      name="generoModal" 
                      value="Niña" 
                      checked={genero === 'Niña'} 
                      onChange={e => setGenero(e.target.value)} 
                    /> Niña
                  </label>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '0.85rem' }}>Fecha de Nacimiento</label>
                <input 
                  type="date" 
                  required 
                  min="2014-01-01"
                  max={fechaHoy}
                  value={fechaNacimiento} 
                  onChange={e => setFechaNacimiento(e.target.value)} 
                />
              </div>
            </div>

            {fechaNacimiento && (
              <div style={{ marginTop: '0.8rem', padding: '0.5rem', background: (edadCalculada < 8 || edadCalculada > 13) ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.1)', borderRadius: '6px', fontSize: '0.85rem' }}>
                Edad calculada: <strong>{edadCalculada} años</strong> | Salón: <strong>{edadCalculada > 13 ? '❌ Excede límite (Máx. 13 años)' : (edadCalculada >= 8 ? 'Usos Múltiples' : 'Menor de 8 años')}</strong>
              </div>
            )}
          </div>

          {/* Datos del Representante */}
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--glass-border)', padding: '1rem', borderRadius: '12px', marginBottom: '1.2rem' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--accent-primary)', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={18} /> Datos del Representante
            </h3>

            <div className="form-group" style={{ marginBottom: '0.8rem' }}>
              <label style={{ fontSize: '0.85rem' }}>Nombre / Información Representante</label>
              <input 
                type="text" 
                value={nombreRep} 
                onChange={e => setNombreRep(e.target.value)} 
                placeholder="Ej. Juan Pérez (Padre)"
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: '0.85rem' }}>Teléfono de Contacto</label>
              <input 
                type="tel" 
                maxLength={11}
                value={telefonoRep} 
                onChange={handleTelefonoChange} 
                placeholder="Ej. 04141234567"
              />
            </div>
          </div>

          {/* Botones */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button 
              type="button" 
              onClick={onClose}
              style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', padding: '0.75rem 1.2rem', borderRadius: '8px', cursor: 'pointer' }}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={isSubmitting}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: 'auto', padding: '0.75rem 1.5rem', marginTop: 0 }}
            >
              <Save size={18} /> {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
