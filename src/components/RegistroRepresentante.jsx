import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Sparkles, User, ShieldCheck, Heart, Plus, AlertCircle } from 'lucide-react';

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

export default function RegistroRepresentante() {
  // Datos del representante (Sin Cédula, teléfono que inicia en 04 y max 11 dígitos)
  const [nombreRep, setNombreRep] = useState('');
  const [apellidoRep, setApellidoRep] = useState('');
  const [telefonoRep, setTelefonoRep] = useState('04');
  const [parentescoRep, setParentescoRep] = useState('Padre');
  const [otroParentesco, setOtroParentesco] = useState('');

  // Datos del niño/a
  const [nombreEst, setNombreEst] = useState('');
  const [apellidoEst, setApellidoEst] = useState('');
  const [generoEst, setGeneroEst] = useState('');
  const [fechaNacimientoEst, setFechaNacimientoEst] = useState('');

  // Estado del proceso
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [ticketGuardado, setTicketGuardado] = useState(null);

  // Manejador del campo de teléfono (solo números, max 11 caracteres, siempre inicia en 04)
  const handleTelefonoChange = (e) => {
    let val = e.target.value.replace(/\D/g, ''); // Solo dígitos
    
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

  // Generar número de ticket único de 4 dígitos
  const generarTicket = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  const edad = calcularEdad(fechaNacimientoEst);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validar teléfono de 11 dígitos y que comience por 04
    if (telefonoRep.length !== 11 || !telefonoRep.startsWith('04')) {
      setErrorMsg('El número de teléfono debe tener exactamente 11 dígitos y comenzar con 04 (Ej. 04141234567).');
      return;
    }

    if (edad < 8) {
      setErrorMsg('El niño debe tener al menos 8 años para ser registrado en las actividades de Maranatha Kids.');
      return;
    }

    setIsSubmitting(true);

    try {
      const parentescoFinal = parentescoRep === 'Otro' ? otroParentesco : parentescoRep;
      const numTicket = generarTicket();
      const salonAsignado = edad >= 13 ? 'Graduado' : 'Usos Múltiples';

      // Formatear la cadena del representante para incluir Parentesco y Ticket
      const infoRepresentanteFormateada = `${nombreRep.trim()} ${apellidoRep.trim()} (${parentescoFinal} | Ticket: #${numTicket})`;

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

  // VISTA TICKET DE CONFIRMACIÓN (SOLO PARA REPRESENTANTE)
  if (ticketGuardado) {
    return (
      <div style={{ maxWidth: '500px', margin: '1rem auto', padding: '0 0.5rem', animation: 'fadeIn 0.4s ease-out' }}>
        <div className="glass-panel" style={{ textAlign: 'center', position: 'relative', overflow: 'hidden', border: '2px solid var(--accent-primary)', padding: '1.5rem 1rem' }}>
          <div style={{ background: 'var(--accent-gradient)', padding: '1.2rem 1rem', margin: '-1.5rem -1rem 1.2rem -1rem', color: 'white' }}>
            <Sparkles size={32} style={{ marginBottom: '0.4rem' }} />
            <h2 style={{ fontSize: '1.6rem', margin: 0 }}>¡Registro Exitoso!</h2>
            <p style={{ margin: '0.3rem 0 0 0', opacity: 0.9, fontSize: '0.9rem' }}>Maranatha Kids</p>
          </div>

          <div style={{ background: 'rgba(59, 130, 246, 0.15)', border: '2px dashed var(--accent-primary)', borderRadius: '16px', padding: '1.2rem 0.8rem', marginBottom: '1.2rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>
              Número de Turno / Ticket
            </span>
            <div style={{ fontSize: '3.2rem', fontWeight: 900, color: 'var(--accent-primary)', textShadow: '0 0 20px rgba(59,130,246,0.5)', margin: '0.4rem 0' }}>
              #{ticketGuardado.ticket}
            </div>
            <p style={{ color: 'white', fontWeight: '500', fontSize: '0.95rem', margin: 0, lineHeight: 1.4 }}>
              Muestra este número al recepcionista en la entrada para confirmar la llegada.
            </p>
          </div>

          <div style={{ textAlign: 'left', background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '12px', marginBottom: '1.2rem', fontSize: '0.9rem' }}>
            <h3 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.4rem', marginBottom: '0.6rem', color: 'var(--accent-primary)', fontSize: '1rem' }}>
              Datos Registrados:
            </h3>
            <p style={{ margin: '0.3rem 0' }}><strong>Niño/a:</strong> {ticketGuardado.nino} ({ticketGuardado.edad} años)</p>
            <p style={{ margin: '0.3rem 0' }}><strong>Representante:</strong> {ticketGuardado.representante}</p>
            <p style={{ margin: '0.3rem 0' }}><strong>Parentesco:</strong> {ticketGuardado.parentesco}</p>
            <p style={{ margin: '0.3rem 0' }}><strong>Teléfono:</strong> {ticketGuardado.telefono}</p>
            <p style={{ margin: '0.3rem 0' }}><strong>Estado:</strong> {ticketGuardado.salon === 'Graduado' ? '🎓 Graduado' : ticketGuardado.salon}</p>
          </div>

          <button 
            onClick={handleRegistrarOtroNino} 
            className="btn-primary" 
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', padding: '0.85rem', fontSize: '1rem' }}
          >
            <Plus size={20} /> Registrar otro niño/a
          </button>
        </div>
      </div>
    );
  }

  // VISTA FORMULARIO (SOLO Y EXCLUSIVAMENTE FORMULARIO)
  return (
    <div style={{ maxWidth: '500px', margin: '1rem auto', padding: '0 0.5rem', animation: 'fadeIn 0.3s ease-out' }}>
      <div className="glass-panel" style={{ padding: '1.25rem 1rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'inline-flex', padding: '10px', background: 'rgba(59, 130, 246, 0.15)', borderRadius: '50%', marginBottom: '0.6rem' }}>
            <Heart size={28} color="var(--accent-primary)" />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, lineHeight: 1.2 }}>Registro de Representante</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.4rem', fontSize: '0.85rem', lineHeight: 1.4 }}>
            Maranatha Kids — Ingrese sus datos y los del niño/a para obtener su número de turno.
          </p>
        </div>

        {errorMsg && (
          <div className="toast-error" style={{ marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
            <AlertCircle size={20} /> {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* SECCIÓN 1: DATOS DEL REPRESENTANTE */}
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--glass-border)', padding: '1rem', borderRadius: '12px', marginBottom: '1.2rem' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--accent-primary)', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={18} /> Datos del Representante
            </h3>

            <div className="form-responsive-row">
              <div className="form-group" style={{ marginBottom: '0.8rem' }}>
                <label style={{ fontSize: '0.85rem' }}>Nombre del Representante</label>
                <input 
                  type="text" 
                  required 
                  value={nombreRep} 
                  onChange={e => setNombreRep(e.target.value)} 
                  placeholder="Ej. Juan" 
                  style={{ padding: '0.65rem 0.8rem', fontSize: '0.95rem' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '0.8rem' }}>
                <label style={{ fontSize: '0.85rem' }}>Apellido del Representante</label>
                <input 
                  type="text" 
                  required 
                  value={apellidoRep} 
                  onChange={e => setApellidoRep(e.target.value)} 
                  placeholder="Ej. Pérez" 
                  style={{ padding: '0.65rem 0.8rem', fontSize: '0.95rem' }}
                />
              </div>
            </div>

            <div className="form-responsive-row">
              <div className="form-group" style={{ marginBottom: '0.8rem' }}>
                <label style={{ fontSize: '0.85rem' }}>Teléfono de Contacto</label>
                <input 
                  type="tel" 
                  required 
                  maxLength={11}
                  value={telefonoRep} 
                  onChange={handleTelefonoChange} 
                  placeholder="Ej. 04141234567" 
                  style={{ padding: '0.65rem 0.8rem', fontSize: '0.95rem', letterSpacing: '0.5px' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '0.85rem' }}>Parentesco con el niño/a</label>
                <select 
                  value={parentescoRep} 
                  onChange={e => setParentescoRep(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.8rem', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', fontSize: '0.95rem' }}
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
                    placeholder="Escriba su parentesco" 
                    style={{ marginTop: '0.5rem', padding: '0.65rem 0.8rem', fontSize: '0.95rem' }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: DATOS DEL NIÑO */}
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--glass-border)', padding: '1rem', borderRadius: '12px', marginBottom: '1.2rem' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--accent-primary)', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <User size={18} /> Datos del Niño / Niña
            </h3>

            <div className="form-responsive-row">
              <div className="form-group" style={{ marginBottom: '0.8rem' }}>
                <label style={{ fontSize: '0.85rem' }}>Nombre del Niño/a</label>
                <input 
                  type="text" 
                  required 
                  value={nombreEst} 
                  onChange={e => setNombreEst(e.target.value)} 
                  placeholder="Ej. Mateo" 
                  style={{ padding: '0.65rem 0.8rem', fontSize: '0.95rem' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '0.8rem' }}>
                <label style={{ fontSize: '0.85rem' }}>Apellido del Niño/a</label>
                <input 
                  type="text" 
                  required 
                  value={apellidoEst} 
                  onChange={e => setApellidoEst(e.target.value)} 
                  placeholder="Ej. Pérez" 
                  style={{ padding: '0.65rem 0.8rem', fontSize: '0.95rem' }}
                />
              </div>
            </div>

            <div className="form-responsive-row" style={{ alignItems: 'flex-start' }}>
              <div className="form-group" style={{ marginBottom: '0.8rem' }}>
                <label style={{ fontSize: '0.85rem' }}>Género</label>
                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.4rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                    <input 
                      type="radio" 
                      name="generoEst" 
                      value="Niño" 
                      checked={generoEst === 'Niño'} 
                      onChange={e => setGeneroEst(e.target.value)} 
                      required 
                    /> Niño
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.9rem' }}>
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
                <label style={{ fontSize: '0.85rem' }}>Fecha de Nacimiento</label>
                <input 
                  type="date" 
                  required 
                  value={fechaNacimientoEst} 
                  onChange={e => setFechaNacimientoEst(e.target.value)} 
                  style={{ padding: '0.65rem 0.8rem', fontSize: '0.95rem' }}
                />
              </div>
            </div>

            {fechaNacimientoEst && (
              <div style={{ marginTop: '0.8rem', padding: '0.6rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', fontSize: '0.85rem' }}>
                <p style={{ margin: 0 }}><strong>Edad calculada:</strong> {edad} años</p>
                <p style={{ margin: '0.2rem 0 0 0' }}>
                  <strong>Salón asignado:</strong> {edad >= 13 ? '🎓 Graduado' : (edad >= 8 ? 'Usos Múltiples' : 'Menor de 8 años')}
                </p>
              </div>
            )}
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={isSubmitting || telefonoRep.length !== 11 || (fechaNacimientoEst && edad < 8)}
            style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', fontWeight: 'bold' }}
          >
            {isSubmitting ? 'Generando Turno...' : 'Obtener Número de Turno'}
          </button>
        </form>
      </div>
    </div>
  );
}
