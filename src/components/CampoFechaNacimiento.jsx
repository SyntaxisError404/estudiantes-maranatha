import React, { useState } from 'react';
import { Calendar, Edit3 } from 'lucide-react';

const MESES = [
  { val: '01', nombre: 'Enero' },
  { val: '02', nombre: 'Febrero' },
  { val: '03', nombre: 'Marzo' },
  { val: '04', nombre: 'Abril' },
  { val: '05', nombre: 'Mayo' },
  { val: '06', nombre: 'Junio' },
  { val: '07', nombre: 'Julio' },
  { val: '08', nombre: 'Agosto' },
  { val: '09', nombre: 'Septiembre' },
  { val: '10', nombre: 'Octubre' },
  { val: '11', nombre: 'Noviembre' },
  { val: '12', nombre: 'Diciembre' }
];

export default function CampoFechaNacimiento({ value, onChange, minYear = 2010, required = true }) {
  const [modo, setModo] = useState('desplegables'); // 'desplegables' (Día/Mes/Año) o 'calendario'
  const hoyObj = new Date();
  const hoyAnio = hoyObj.getFullYear();
  const fechaMax = `${hoyAnio}-${String(hoyObj.getMonth() + 1).padStart(2, '0')}-${String(hoyObj.getDate()).padStart(2, '0')}`;

  // Desglosar valor YYYY-MM-DD
  const partes = (value || '').split('-');
  const anioActual = partes[0] || '';
  const mesActual = partes[1] || '';
  const diaActual = partes[2] || '';

  // Lista de años desde minYear (2010) hasta hoyAnio
  const aniosDisponibles = [];
  for (let y = hoyAnio; y >= minYear; y--) {
    aniosDisponibles.push(String(y));
  }

  // Lista de días 1..31
  const diasDisponibles = [];
  for (let d = 1; d <= 31; d++) {
    diasDisponibles.push(String(d).padStart(2, '0'));
  }

  const handleCambioPartes = (nDia, nMes, nAnio) => {
    if (nDia && nMes && nAnio) {
      onChange(`${nAnio}-${nMes}-${nDia}`);
    } else {
      // Si está incompleto, concatenar con los valores elegidos o dejar vacío
      const y = nAnio || String(hoyAnio);
      const m = nMes || '01';
      const d = nDia || '01';
      if (nDia || nMes || nAnio) {
        onChange(`${y}-${m}-${d}`);
      } else {
        onChange('');
      }
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
        <label style={{ fontSize: '0.85rem', margin: 0, color: 'var(--text-secondary)', fontWeight: 500 }}>
          Fecha de Nacimiento
        </label>
        <button
          type="button"
          onClick={() => setModo(modo === 'desplegables' ? 'calendario' : 'desplegables')}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--accent-primary)',
            fontSize: '0.78rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            fontWeight: 600,
            padding: '2px 6px',
            borderRadius: '4px'
          }}
        >
          {modo === 'desplegables' ? (
            <>
              <Calendar size={13} /> Usar Calendario
            </>
          ) : (
            <>
              <Edit3 size={13} /> Seleccionar Día / Mes / Año
            </>
          )}
        </button>
      </div>

      {modo === 'desplegables' ? (
        <div style={{ display: 'flex', gap: '0.4rem', width: '100%' }}>
          {/* Selector de Día */}
          <select
            value={diaActual}
            onChange={(e) => handleCambioPartes(e.target.value, mesActual, anioActual)}
            style={{ flex: '1', padding: '0.65rem 0.3rem', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', fontSize: '0.9rem' }}
            required={required}
          >
            <option value="">Día</option>
            {diasDisponibles.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {/* Selector de Mes */}
          <select
            value={mesActual}
            onChange={(e) => handleCambioPartes(diaActual, e.target.value, anioActual)}
            style={{ flex: '1.4', padding: '0.65rem 0.3rem', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', fontSize: '0.9rem' }}
            required={required}
          >
            <option value="">Mes</option>
            {MESES.map(m => (
              <option key={m.val} value={m.val}>{m.nombre}</option>
            ))}
          </select>

          {/* Selector de Año */}
          <select
            value={anioActual}
            onChange={(e) => handleCambioPartes(diaActual, mesActual, e.target.value)}
            style={{ flex: '1.2', padding: '0.65rem 0.3rem', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', fontSize: '0.9rem' }}
            required={required}
          >
            <option value="">Año</option>
            {aniosDisponibles.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      ) : (
        <input
          type="date"
          required={required}
          min={`${minYear}-01-01`}
          max={fechaMax}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: '100%', padding: '0.65rem 0.8rem', fontSize: '0.95rem' }}
        />
      )}
    </div>
  );
}
