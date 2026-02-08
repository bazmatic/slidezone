import { useState, useEffect, useRef, useCallback, type RefObject } from 'react';
import { PANEL_EDGE_THRESHOLD_PX, PANEL_CLOSE_DELAY_MS } from '@/constants/panel';

function isPointInRect(rect: DOMRect, clientX: number, clientY: number): boolean {
  return (
    clientX >= rect.left &&
    clientX <= rect.right &&
    clientY >= rect.top &&
    clientY <= rect.bottom
  );
}

export interface UseLeftEdgePanelResult {
  isOpen: boolean;
  setOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
}

/**
 * Opens the panel when the mouse is in the left-edge zone or over the panel;
 * closes it after a delay when the mouse leaves both.
 */
export function useLeftEdgePanel(panelRef: RefObject<HTMLElement | null>): UseLeftEdgePanelResult {
  const [isOpen, setOpen] = useState<boolean>(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCloseTimer = useCallback((): void => {
    if (closeTimerRef.current !== null) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const scheduleClose = useCallback((): void => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      setOpen(false);
      closeTimerRef.current = null;
    }, PANEL_CLOSE_DELAY_MS);
  }, [clearCloseTimer]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent): void => {
      const { clientX, clientY } = e;
      const inEdgeZone = clientX <= PANEL_EDGE_THRESHOLD_PX;
      const panel = panelRef.current;
      const overPanel =
        panel !== null && isPointInRect(panel.getBoundingClientRect(), clientX, clientY);

      if (inEdgeZone || overPanel) {
        setOpen(true);
        clearCloseTimer();
      } else {
        scheduleClose();
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearCloseTimer();
    };
  }, [panelRef, clearCloseTimer, scheduleClose]);

  return { isOpen, setOpen };
}
