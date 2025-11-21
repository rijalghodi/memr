import { useRef } from "react";

type UseClickOrDragProps = {
  clickMs?: number;
  moveThreshold?: number;
  onClick?: (e: React.PointerEvent<Element>) => void;
  onDrag?: (e: React.PointerEvent<Element>) => void;
};

type UseClickOrDragReturn = {
  onPointerDown: (e: React.PointerEvent<Element>) => void;
  onPointerMove: (e: React.PointerEvent<Element>) => void;
  onPointerUp: (e: React.PointerEvent<Element>) => void;
};

export function useClickOrDrag({
  clickMs = 200,
  moveThreshold = 6,
  onClick,
  onDrag,
}: UseClickOrDragProps = {}): UseClickOrDragReturn {
  const startTime = useRef(0);
  const startPos = useRef({ x: 0, y: 0 });
  const dragged = useRef(false);

  const onPointerDown = (e: React.PointerEvent<Element>) => {
    (e.target as Element).setPointerCapture(e.pointerId);

    startTime.current = performance.now();
    startPos.current = { x: e.clientX, y: e.clientY };
    dragged.current = false;
  };

  const onPointerMove = (e: React.PointerEvent<Element>) => {
    if (startTime.current === 0) return;

    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;

    if (!dragged.current && Math.hypot(dx, dy) > moveThreshold) {
      dragged.current = true;
      onDrag?.(e);
    }
  };

  const onPointerUp = (e: React.PointerEvent<Element>) => {
    if (startTime.current === 0) return;

    const elapsed = performance.now() - startTime.current;

    if (!dragged.current && elapsed <= clickMs) {
      onClick?.(e);
    }

    startTime.current = 0;
    dragged.current = false;

    try {
      (e.target as Element).releasePointerCapture(e.pointerId);
    } catch (_) {}
  };

  return { onPointerDown, onPointerMove, onPointerUp };
}
