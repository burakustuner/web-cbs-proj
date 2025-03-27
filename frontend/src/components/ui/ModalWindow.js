import React, { useState } from 'react';
import { Rnd } from 'react-rnd';
import './ModalWindow.css';

function ModalWindow({ id, title, children, onClose, zIndex = 1000 }) {
  const [minimized, setMinimized] = useState(false);

  return (
    <div className="draggable-modal-backdrop" style={{ zIndex }}>
      <Rnd
        default={{
          x: window.innerWidth / 2 - 200,
          y: window.innerHeight / 2 - 150,
          width: 400,
          height: 'auto',
        }}
        minWidth={300}
        bounds="window"
        dragHandleClassName="draggable-modal-header"
      >
        <div className="draggable-modal-content">
          <div className="draggable-modal-header">
            <span>{title}</span>
            <div className="modal-controls">
              <button onClick={() => setMinimized(!minimized)}>
                {minimized ? '🗖' : '🗕'}
              </button>
              <button onClick={() => onClose?.(id)}>❌</button>
            </div>
          </div>

          {!minimized && (
            <div className="draggable-modal-body">
              {children}
            </div>
          )}
        </div>
      </Rnd>
    </div>
  );
}


export default ModalWindow;
