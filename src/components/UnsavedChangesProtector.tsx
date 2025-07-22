import { useEffect, useState } from 'react';
import { useBlocker, type BlockerFunction } from 'react-router-dom';
import { UnsavedChangesModal } from './UnsavedChangesModal';

interface UnsavedChangesProtectorProps {
  /** A boolean indicating if there are unsaved changes that should block navigation. */
  isDirty: boolean;
}

/**
 * A non-rendering component that blocks navigation when there are unsaved changes.
 * It uses React Router's `useBlocker` for in-app navigation and the `beforeunload`
 * event for browser-level navigation (closing tab, refresh).
 */
export const UnsavedChangesProtector = ({
  isDirty,
}: UnsavedChangesProtectorProps) => {
  const [showModal, setShowModal] = useState(false);

  const blocker = useBlocker((tx: Parameters<BlockerFunction>[0]) => {
    if (!isDirty) return false;

    const next = tx.nextLocation;

    if (
      (next.state as { skipUnsavedGuard?: boolean } | undefined)
        ?.skipUnsavedGuard
    )
      return false;

    if (next.pathname === location.pathname) return false;

    return true; // block
  });

  useEffect(() => {
    if (blocker.state === 'blocked') {
      setShowModal(true);
    }
  }, [blocker.state]);

  // Handler for Browser-Native Navigation (unload/refresh/close)
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isDirty) {
        event.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty]);

  const handleCloseModal = () => {
    setShowModal(false);
    if (blocker.state === 'blocked') {
      blocker.reset();
    }
  };

  const handleConfirmLeave = () => {
    setShowModal(false);
    if (blocker.state === 'blocked') {
      blocker.proceed();
    }
  };

  // This component's only visual output is the modal itself, when active.
  return (
    <UnsavedChangesModal
      isOpen={showModal}
      onClose={handleCloseModal}
      onConfirm={handleConfirmLeave}
    />
  );
};
