import React, { createContext, useContext, useState } from 'react';

const ModalManagerContext = createContext();

export function ModalManagerProvider({ children }) {
  const [modals, setModals] = useState([]);

  const openModal = (modal) => {
    setModals((prev) => {
      if (modal.singleton) {
        // Eğer zaten bir singleton modal açıksa, onu kapat
        const filtered = prev.filter((m) => !m.singleton);
        return [...filtered, modal];
      }
      return [...prev, modal];
    });
  };

  const closeModal = (id) => {
    setModals((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <ModalManagerContext.Provider value={{ modals, openModal, closeModal }}>
      {children}
      {modals.map((modal) => (
        <React.Fragment key={modal.id}>{modal.component}</React.Fragment>
      ))}
    </ModalManagerContext.Provider>
  );
}

export function useModalManager() {
  return useContext(ModalManagerContext);
}
