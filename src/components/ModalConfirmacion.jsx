import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export default function ModalConfirmacion({ 
  titulo = "Confirmar Eliminación", 
  mensaje, 
  textoBotonConfirmar = "Sí, Eliminar",
  onCancelar, 
  onConfirmar,
  isCargando = false
}) {
  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1100,
      padding: '1rem',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '440px',
        width: '100%',
        position: 'relative',
        border: '2px solid rgba(239, 68, 68, 0.5)',
        boxShadow: '0 10px 30px rgba(239, 68, 68, 0.2)',
        textAlign: 'center',
        padding: '2rem 1.5rem'
      }}>
        <button 
          onClick={onCancelar}
          style={{ 
            position: 'absolute', top: '12px', right: '12px', 
            background: 'transparent', border: 'none', color: 'var(--text-secondary)', 
            cursor: 'pointer', padding: '4px' 
          }}
        >
          <X size={20} />
        </button>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          marginBottom: '1rem'
        }}>
          <AlertTriangle size={32} color="#ef4444" />
        </div>

        <h3 style={{ fontSize: '1.4rem', color: 'white', marginBottom: '0.6rem', fontWeight: 700 }}>
          {titulo}
        </h3>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '1.8rem' }}>
          {mensaje}
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <button 
            type="button" 
            onClick={onCancelar}
            disabled={isCargando}
            style={{ 
              background: 'var(--bg-secondary)', 
              border: '1px solid var(--glass-border)', 
              color: 'white', 
              padding: '0.75rem 1.4rem', 
              borderRadius: '10px', 
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '0.95rem'
            }}
          >
            Cancelar
          </button>

          <button 
            type="button" 
            onClick={onConfirmar}
            disabled={isCargando}
            style={{ 
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', 
              border: 'none', 
              color: 'white', 
              padding: '0.75rem 1.4rem', 
              borderRadius: '10px', 
              cursor: isCargando ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)'
            }}
          >
            <Trash2 size={18} /> {isCargando ? 'Eliminando...' : textoBotonConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}
