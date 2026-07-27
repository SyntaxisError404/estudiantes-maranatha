import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { CheckCircle2, User, Phone, ShieldCheck, Heart, Sparkles, Plus, AlertCircle } from 'lucide-react';

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

export default function RegistroRepresentante({ onVolverAlPanel }) {
  // Datos del representante
  const [nombreRep, setNombreRep] = useState('');
  const [apellidoRep, setApellidoRep] = useState('');
  const [cedulaRep, setCedulaRep] = useState('');
  const [telefonoRep, setTelefonoRep] = useState('');
  const [parentescoRep, setParentescoRep] = useState('Padre');
  const [otroParentesco, setOtroParentesco] = useState('');

  // Datos del niño
  const [nombreEst, setNombreEst] = useState('');
  const [apellidoEst, setApellidoEst] = useState('');
  const [generoEst, setGeneroEst] = useState('');
  const [fechaNacimientoEst, setFechaNacimientoEst] = useState('');

  // Estado del proceso
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [ticketGuardado, setTicketGuardado] = useState(null);

  // Generar número de ticket único de 4 dígitos
  const generarTicket = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  const edad = calcularEdad(fechaNacimientoEst);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (edad < 8) {
      setErrorMsg('El niño debe tener al menos 8 años para ser registrado en las actividades de Maranatha Kids.');
      return;
    }

    setIsSubmitting(true);

    try {
      const parentescoFinal = parentescoRep === 'Otro' ? otroParentesco : parentescoRep;
      const numTicket = generarTicket();
      const salonAsignado = edad >= 13 ? 'Graduado' : 'Usos Múltiples';

      // Formatear la cadena del representante para incluir Cédula, Parentesco y Ticket
      const infoRepresentanteFormateada = `${nombreRep.trim()} ${apellidoRep.trim()} (CI: ${cedulaRep.trim()} | ${parentescoFinal} | Ticket: #${numTicket})`;

      // Buscar si el niño ya existía previamente por Nombre y Apellido
      const { data: existencias } = await supabase
        .from('estudiantes')
        .select('*')
        .ilike('nombre', nombreEst.trim())
        .ilike('apellido', apellidoEst.trim());

      let estudianteExistente = existencias && existencias.length > 0 ? existencias[0] : null;

      if (estudianteExistente) {
        // Actualizar datos del estudiante y activarlo hoy
        const { error: errUpdate } = await supabase
          .from('estudiantes')
          .update({
            fecha_nacimiento: fechaNacimientoEst,
            genero: generoEst,
            salon_actual: salonAsignado,
            nombre_representante: infoRepresentanteFormateada,
            apellido_representante: apellidoRep.trim(),
            telefono_representante: telefonoRep.trim(),
            activo_este_domingo: true
          })
          .eq('id', estudianteExistente.id);

        if (errUpdate) throw errUpdate;
      } else {
        // Crear nuevo registro
        const { error: errInsert } = await supabase
          .from('estudiantes')
          .insert([{
            nombre: nombreEst.trim(),
            apellido: apellidoEst.trim(),
            fecha_nacimiento: fechaNacimientoEst,
            genero: generoEst,
            salon_actual: salonAsignado,
            nombre_representante: infoRepresentanteFormateada,
            apellido_representante: apellidoRep.trim(),
            telefono_representante: telefonoRep.trim(),
            activo_este_domingo: true
          }]);

        if (errInsert) throw errInsert;
      }

      // Guardar ticket para mostrar en pantalla al representante
      setTicketGuardado({
        ticket: numTicket,
        nino: `${nombreEst.trim()} ${apellidoEst.trim()}`,
        representante: `${nombreRep.trim()} ${apellidoRep.trim()}`,
        cedula: cedulaRep.trim(),
        parentesco: parentescoFinal,
        telefono: telefonoRep.trim(),
        salon: salonAsignado,
        edad: edad
      });

    } catch (err) {
      console.error(err);
      setErrorMsg('Ocurrió un error al guardar los datos: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegistrarOtroNino = () => {
    setTicketGuardado(null);
    setNombreEst('');
    setApellidoEst('');
    setGeneroEst('');
    setFechaNacimientoEst('');
  };

  // VISTA TICKET DE CONFIRMACIÓN
  if (ticketGuardado) {
    return (
      <div style={{ maxWidth: '550px', margin: '2rem auto', padding: '1rem', animation: 'fadeIn 0.4s ease-out' }}>
        <div className="glass-panel" style={{ textAlign: 'center', position: 'relative', overflow: 'hidden', border: '2px solid var(--accent-primary)' }}>
          <div style={{ background: 'var(--accent-gradient)', padding: '1.5rem 1rem', margin: '-2rem -2rem 1.5rem -2rem', color: 'white' }}>
            <Sparkles size={36} style={{ marginBottom: '0.5rem' }} />
            <h2 style={{ fontSize: '1.8rem', margin: 0 }}>¡Registro Exitoso!</h2>
            <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9 }}>Maranatha Kids</p>
          </div>

          <div style={{ background: 'rgba(59, 130, 246, 0.15)', border: '2px dashed var(--accent-primary)', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>
              Número de Ticket / Turno
            </span>
            <div style={{ fontSize: '3.5rem', fontWeight: 900, color: 'var(--accent-primary)', textShadow: '0 0 20px rgba(59,130,246,0.5)', margin: '0.5rem 0' }}>
              #{ticketGuardado.ticket}
            </div>
            <p style={{ color: 'white', fontWeight: '500', fontSize: '1rem', margin: 0 }}>
              Muestra este número a la persona encargada en la entrada para confirmar la llegada.
            </p>
          </div>

          <div style={{ textAlign: 'left', background: 'var(--bg-secondary)', padding: '1.2rem', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            <h3 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', marginBottom: '0.8rem', color: 'var(--accent-primary)', fontSize: '1.1rem' }}>
              Resumen del Registro:
            </h3>
            <p style={{ margin: '0.4rem 0' }}><strong>Niño/a:</strong> {ticketGuardado.nino} ({ticketGuardado.edad} años)</p>
            <p style={{ margin: '0.4rem 0' }}><strong>Representante:</strong> {ticketGuardado.representante}</p>
            <p style={{ margin: '0.4rem 0' }}><strong>Cédula:</strong> {ticketGuardado.cedula}</p>
            <p style={{ margin: '0.4rem 0' }}><strong>Parentesco:</strong> {ticketGuardado.parentesco}</p>
            <p style={{ margin: '0.4rem 0' }}><strong>Teléfono:</strong> {ticketGuardado.telefono}</p>
            <p style={{ margin: '0.4rem 0' }}><strong>Estado/Salón:</strong> {ticketGuardado.salon === 'Graduado' ? '🎓 Graduado' : ticketGuardado.salon}</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button 
              onClick={handleRegistrarOtroNino} 
              className="btn-primary" 
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', padding: '0.9rem' }}
            >
              <Plus size={20} /> Registrar otro niño
            </button>

            {onVolverAlPanel && (
              <button 
                onClick={onVolverAlPanel} 
                style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', padding: '0.75rem', borderRadius: '8px', cursor: 'pointer' }}
              >
                Volver al Panel Principal
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // VISTA FORMULARIO
  return (
    <div style={{ maxWidth: '600px', margin: '1.5rem auto', padding: '0 1rem', animation: 'fadeIn 0.3s ease-out' }}>
      <div className="glass-panel">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', padding: '12px', background: 'rgba(59, 130, 246, 0.15)', borderRadius: '50%', marginBottom: '1rem' }}>
            <Heart size={32} color="var(--accent-primary)" />
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>Registro de Representante</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.95rem' }}>
            Maranatha Kids — Complete sus datos y los del niño/a para obtener su número de turno.
          </p>
        </div>

        {errorMsg && (
          <div className="toast-error" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={20} /> {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* SECCIÓN 1: DATOS DEL REPRESENTANTE */}
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--glass-border)', padding: '1.2rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--accent-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={20} /> Datos del Representante
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Nombre del Representante</label>
                <input 
                  type="text" 
                  required 
                  value={nombreRep} 
                  onChange={e => setNombreRep(e.target.value)} 
                  placeholder="Ej. Juan" 
                />
              </div>

              <div className="form-group">
                <label>Apellido del Representante</label>
                <input 
                  type="text" 
                  required 
                  value={apellidoRep} 
                  onChange={e => setApellidoRep(e.target.value)} 
                  placeholder="Ej. Pérez" 
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Cédula de Identidad</label>
                <input 
                  type="text" 
                  required 
                  value={cedulaRep} 
                  onChange={e => setCedulaRep(e.target.value)} 
                  placeholder="Ej. V-12345678" 
                />
              </div>

              <div className="form-group">
                <label>Teléfono de Contacto</label>
                <input 
                  type="tel" 
                  required 
                  value={telefonoRep} 
                  onChange={e => setTelefonoRep(e.target.value)} 
                  placeholder="Ej. 0414-1234567" 
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Parentesco con el niño/a</label>
              <select 
                value={parentescoRep} 
                onChange={e => setParentescoRep(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }}
              >
                <option value="Padre">Padre</option>
                <option value="Madre">Madre</option>
                <option value="Abuelo/a">Abuelo / Abuela</option>
                <option value="Tío/a">Tío / Tía</option>
                <option value="Hermano/a">Hermano / Hermana</option>
                <option value="Tutor Legal">Tutor Legal</option>
                <option value="Otro">Otro...</option>
              </select>

              {parentescoRep === 'Otro' && (
                <input 
                  type="text" 
                  required 
                  value={otroParentesco} 
                  onChange={e => setOtroParentesco(e.target.value)} 
                  placeholder="Escriba su parentesco (Ej. Primo/a)" 
                  style={{ marginTop: '0.5rem' }}
                />
              )}
            </div>
          </div>

          {/* SECCIÓN 2: DATOS DEL NIÑO */}
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--glass-border)', padding: '1.2rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--accent-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={20} /> Datos del Niño / Niña
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Nombre del Niño/a</label>
                <input 
                  type="text" 
                  required 
                  value={nombreEst} 
                  onChange={e => setNombreEst(e.target.value)} 
                  placeholder="Ej. Mateo" 
                />
              </div>

              <div className="form-group">
                <label>Apellido del Niño/a</label>
                <input 
                  type="text" 
                  required 
                  value={apellidoEst} 
                  onChange={e => setApellidoEst(e.target.value)} 
                  placeholder="Ej. Pérez" 
                />
              </div>
            </div>

            <div className="form-group">
              <label>Género</label>
              <div style={{ display: 'flex', gap: '2rem', marginTop: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="generoEst" 
                    value="Niño" 
                    checked={generoEst === 'Niño'} 
                    onChange={e => setGeneroEst(e.target.value)} 
                    required 
                  /> Niño
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="generoEst" 
                    value="Niña" 
                    checked={generoEst === 'Niña'} 
                    onChange={e => setGeneroEst(e.target.value)} 
                    required 
                  /> Niña
                </label>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Fecha de Nacimiento</label>
              <input 
                type="date" 
                required 
                value={fechaNacimientoEst} 
                onChange={e => setFechaNacimientoEst(e.target.value)} 
              />
            </div>

            {fechaNacimientoEst && (
              <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', fontSize: '0.9rem' }}>
                <p style={{ margin: 0 }}><strong>Edad calculada:</strong> {edad} años</p>
                <p style={{ margin: '0.3rem 0 0 0' }}>
                  <strong>Salón asignado:</strong> {edad >= 13 ? '🎓 Graduado' : (edad >= 8 ? 'Usos Múltiples' : 'Menor de 8 años')}
                </p>
              </div>
            )}
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={isSubmitting || (fechaNacimientoEst && edad < 8)}
            style={{ width: '100%', padding: '1rem', fontSize: '1.05rem', fontWeight: 'bold' }}
          >
            {isSubmitting ? 'Generando Ticket...' : 'Completar Registro y Obtener Ticket'}
          </button>
        </form>

        {onVolverAlPanel && (
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <button 
              onClick={onVolverAlPanel} 
              style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.9rem' }}
            >
              ← Volver al Panel Administrativo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
