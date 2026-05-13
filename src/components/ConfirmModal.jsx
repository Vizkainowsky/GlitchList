import { AlertTriangle } from 'lucide-react';

/**
 * Modal de confirmación reutilizable.
 * Props:
 *   isOpen    — boolean, muestra u oculta el modal
 *   title     — string, título del modal
 *   message   — string, mensaje de confirmación
 *   onConfirm — función que se ejecuta al confirmar
 *   onCancel  — función que se ejecuta al cancelar
 *   confirmText — string opcional (por defecto "Eliminar")
 *   confirmColor — string opcional (por defecto rojo)
 */
const ConfirmModal = ({
  isOpen,
  title = '¿Estás seguro?',
  message = 'Esta acción no se puede deshacer.',
  onConfirm,
  onCancel,
  confirmText = 'Eliminar',
  confirmColor = '#ff4444',
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onCancel}
      style={{ zIndex: 2000 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#161616',
          border: '1px solid rgba(255, 68, 68, 0.3)',
          borderRadius: '16px',
          padding: '2rem',
          width: '90%',
          maxWidth: '420px',
          boxShadow: '0 25px 50px rgba(0,0,0,0.7), 0 0 30px rgba(255,68,68,0.1)',
          animation: 'fadeIn 0.2s ease-out',
          textAlign: 'center',
        }}
      >
        {/* Icono */}
        <div style={{
          width: '60px', height: '60px', borderRadius: '50%',
          background: 'rgba(255, 68, 68, 0.1)',
          border: '1px solid rgba(255, 68, 68, 0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.5rem',
        }}>
          <AlertTriangle size={28} color="#ff4444" />
        </div>

        {/* Título */}
        <h3 style={{
          color: 'white', fontSize: '1.3rem', fontWeight: '700',
          margin: '0 0 0.75rem',
        }}>
          {title}
        </h3>

        {/* Mensaje */}
        <p style={{
          color: '#888', fontSize: '0.95rem', lineHeight: '1.5',
          margin: '0 0 2rem',
        }}>
          {message}
        </p>

        {/* Botones */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: '0.75rem',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '10px', color: '#aaa',
              fontSize: '0.95rem', fontWeight: '600',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
              e.currentTarget.style.color = '#aaa';
            }}
          >
            Cancelar
          </button>

          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: '0.75rem',
              background: `${confirmColor}22`,
              border: `1px solid ${confirmColor}`,
              borderRadius: '10px', color: confirmColor,
              fontSize: '0.95rem', fontWeight: '700',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = confirmColor;
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = `${confirmColor}22`;
              e.currentTarget.style.color = confirmColor;
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
