import React, { useState } from 'react';
import { Calendar, X, Archive, AlertCircle } from 'lucide-react';

export default function ModalCerrarDia({ totalEstudiantes, onClose, onConfirmar, isCerrando }) {
  const hoyObj = new Date();
  const fechaHoy = `${hoyObj.getFullYear()}-${String(hoyObj.getMonth() + 1).padStart(2, '0')}-${String(hoyObj.getDate()).padStart(2, '0')}`;
  
  const [fechaCierre, setFechaCierre] = useState(fechaHoy);
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fechaCierre) {
      setError('Por favor selecciona una fecha válida.');
      return;
    }
    onConfirmar(fechaCierre);
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
        maxWidth: '480px',
        width: '100%',
        position: 'relative',
        border: '2px solid var(--accent-primary)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.8rem' }}>
          <h2 style={{ fontSize: '1.3rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white' }}>
            <Archive color="var(--accent-primary)" size={24} /> Cerrar Asistencia del Día
          </h2>
          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
          >
            <X size={22} />
          </button>
        </div>

        {error && (
          <div className="toast-error" style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>
            <AlertCircle size={18} style={{ marginRight: '6px' }} /> {error}
          </div>
        )}

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '1.2rem' }}>
          Se guardarán <strong style={{ color: 'white' }}>{totalEstudiantes} estudiantes</strong> activos en el historial y se limpiará la lista del panel actual.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Calendar size={18} color="var(--accent-primary)" /> Fecha de la Asistencia:
            </label>
            <input 
              type="date" 
              required
              max={fechaHoy}
              value={fechaCierre}
              onChange={(e) => {
                setFechaCierre(e.target.value);
                setError(null);
              }}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--glass-border)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '1rem'
              }}
            />
            <small style={{ color: 'var(--text-secondary)', marginTop: '0.4rem', display: 'block', fontSize: '0.8rem' }}>
              * Si olvidaste cerrar el día en una fecha pasada (ej. el domingo anterior), puedes seleccionar la fecha exacta correspondiente.
            </small>
          </div>

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
              disabled={isCerrando}
              style={{ width: 'auto', padding: '0.75rem 1.4rem', margin: 0, fontWeight: 'bold' }}
            >
              {isCerrando ? 'Guardando...' : 'Confirmar y Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
