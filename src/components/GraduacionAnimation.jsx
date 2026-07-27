import React, { useEffect, useState } from 'react';

export default function GraduacionAnimation({ nombre, salonNuevo, onClose }) {
  const [visible, setVisible] = useState(true);
  const [confettiPieces, setConfettiPieces] = useState([]);

  useEffect(() => {
    // Generar partículas de confeti
    const pieces = [];
    const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96E6A1', '#DDA0DD', '#F7DC6F', '#BB8FCE', '#85C1E9', '#F1948A'];
    for (let i = 0; i < 60; i++) {
      pieces.push({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 2,
        duration: 2 + Math.random() * 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 6 + Math.random() * 10,
        rotation: Math.random() * 360,
        type: Math.random() > 0.5 ? 'rect' : 'circle',
      });
    }
    setConfettiPieces(pieces);

    // Auto-cerrar después de 5 segundos
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onClose(), 500);
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const handleClick = () => {
    setVisible(false);
    setTimeout(() => onClose(), 500);
  };

  return (
    <div
      className={`graduacion-overlay ${visible ? 'graduacion-visible' : 'graduacion-hidden'}`}
      onClick={handleClick}
    >
      {/* Confeti */}
      {confettiPieces.map((piece) => (
        <div
          key={piece.id}
          className="confetti-piece"
          style={{
            left: `${piece.left}%`,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
            backgroundColor: piece.color,
            width: piece.type === 'rect' ? `${piece.size}px` : `${piece.size}px`,
            height: piece.type === 'rect' ? `${piece.size * 0.4}px` : `${piece.size}px`,
            borderRadius: piece.type === 'circle' ? '50%' : '2px',
            transform: `rotate(${piece.rotation}deg)`,
          }}
        />
      ))}

      {/* Contenido central */}
      <div className="graduacion-content">
        <div className="graduacion-birrete">🎓</div>
        <div className="graduacion-estrellas">✨</div>
        <h2 className="graduacion-titulo">¡Graduación!</h2>
        <p className="graduacion-nombre">{nombre}</p>
        <p className="graduacion-mensaje">
          {salonNuevo === 'Graduado' ? 'se ha graduado del programa' : `se ha graduado al salón`}
        </p>
        <div className="graduacion-salon">{salonNuevo === 'Graduado' ? 'Maranatha Kids 🎉' : salonNuevo}</div>
        <p className="graduacion-hint">Toca en cualquier lugar para continuar</p>
      </div>
    </div>
  );
}
