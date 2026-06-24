import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

function calcularEdad(fechaString) {
  const hoy = new Date();
  const cumple = new Date(fechaString);
  let edad = hoy.getFullYear() - cumple.getFullYear();
  const m = hoy.getMonth() - cumple.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < cumple.getDate())) {
    edad--;
  }
  return edad;
}

export default function FormularioIngreso({ onEstudianteAgregado }) {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [nombreRep, setNombreRep] = useState('');
  const [apellidoRep, setApellidoRep] = useState('');
  const [telefonoRep, setTelefonoRep] = useState('');
  
  const [edad, setEdad] = useState(null);
  const [salon, setSalon] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  // Evaluar edad y salón cada vez que cambia la fecha
  useEffect(() => {
    if (fechaNacimiento) {
      const e = calcularEdad(fechaNacimiento);
      setEdad(e);
      if (e >= 8 && e <= 11) {
        setSalon('Comedor');
      } else if (e >= 12 && e <= 15) {
        setSalon('Usos Múltiples');
      } else if (e >= 16) {
        setSalon('Principal');
      } else {
        setSalon('No apto (menor de 8)');
      }
    } else {
      setEdad(null);
      setSalon('');
    }
  }, [fechaNacimiento]);

  const requiereRepresentante = salon === 'Comedor';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (edad < 8) {
      setMessage({ type: 'error', text: 'El niño debe tener al menos 8 años.' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    // Preparar datos, omitir representante si no es Comedor
    const data = {
      nombre,
      apellido,
      fecha_nacimiento: fechaNacimiento,
      salon_actual: salon,
      nombre_representante: requiereRepresentante ? nombreRep : null,
      apellido_representante: requiereRepresentante ? apellidoRep : null,
      telefono_representante: requiereRepresentante ? telefonoRep : null,
    };

    const { error } = await supabase.from('estudiantes').insert([data]);

    if (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Error al registrar: ' + error.message });
    } else {
      setMessage({ type: 'success', text: 'Estudiante registrado correctamente.' });
      // Reset form
      setNombre(''); setApellido(''); setFechaNacimiento('');
      setNombreRep(''); setApellidoRep(''); setTelefonoRep('');
      if (onEstudianteAgregado) onEstudianteAgregado();
      
      // Borrar mensaje después de 3 seg
      setTimeout(() => setMessage(null), 3000);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="glass-panel">
      <h2>Registrar Estudiante</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        El salón se asignará automáticamente basado en la edad.
      </p>

      {message && (
        <div className={message.type === 'error' ? 'toast-error' : 'toast-success'}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nombre</label>
          <input type="text" required value={nombre} onChange={e => setNombre(e.target.value)} />
        </div>
        
        <div className="form-group">
          <label>Apellido</label>
          <input type="text" required value={apellido} onChange={e => setApellido(e.target.value)} />
        </div>

        <div className="form-group">
          <label>Fecha de Nacimiento</label>
          <input type="date" required value={fechaNacimiento} onChange={e => setFechaNacimiento(e.target.value)} />
        </div>

        {edad !== null && (
          <div style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', marginBottom: '1.5rem' }}>
            <p><strong>Edad calculada:</strong> {edad} años</p>
            <p><strong>Salón asignado:</strong> {salon}</p>
          </div>
        )}

        {requiereRepresentante && (
          <div style={{ borderLeft: '4px solid var(--accent-primary)', paddingLeft: '1rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--accent-primary)' }}>Datos del Representante (Obligatorio)</h3>
            <div className="form-group">
              <label>Nombre del Tutor</label>
              <input type="text" required={requiereRepresentante} value={nombreRep} onChange={e => setNombreRep(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Apellido del Tutor</label>
              <input type="text" required={requiereRepresentante} value={apellidoRep} onChange={e => setApellidoRep(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Teléfono de Contacto</label>
              <input type="tel" required={requiereRepresentante} value={telefonoRep} onChange={e => setTelefonoRep(e.target.value)} />
            </div>
          </div>
        )}

        <button type="submit" className="btn-primary" disabled={isSubmitting || (edad !== null && edad < 8)}>
          {isSubmitting ? 'Guardando...' : 'Registrar'}
        </button>
      </form>
    </div>
  );
}
