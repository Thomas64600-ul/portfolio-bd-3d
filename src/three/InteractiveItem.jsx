import { useRef, useState, useCallback } from "react";
import { useCursor } from "@react-three/drei";

export default function InteractiveItem({ children, onPick }) {
  const [hovered, setHovered] = useState(false);
  const down = useRef({ x: 0, y: 0, id: null });

  useCursor(hovered);

  const handleOver = useCallback((e) => {
    e.stopPropagation();
    setHovered(true);
  }, []);

  const handleOut = useCallback((e) => {
    e.stopPropagation();
    setHovered(false);
  }, []);

  const handleDown = useCallback((e) => {
    e.stopPropagation();
    try {
      e.target.setPointerCapture?.(e.pointerId);
    } catch {
      // ignore
    }
    down.current = { x: e.clientX ?? 0, y: e.clientY ?? 0, id: e.pointerId };
  }, []);

  const handleClick = useCallback(
    (e) => {
      e.stopPropagation();
      onPick?.();
    },
    [onPick]
  );

  const handleUp = useCallback((e) => {
    e.stopPropagation();

    const dx = Math.abs((e.clientX ?? 0) - down.current.x);
    const dy = Math.abs((e.clientY ?? 0) - down.current.y);
    const dragged = dx + dy > 10;

    // On garde la mesure anti-drag sans changer le comportement :
    // le déclenchement se fait via onClick.
    void dragged;
  }, []);

  return (
    <group
      onPointerOver={handleOver}
      onPointerOut={handleOut}
      onPointerDown={handleDown}
      onClick={handleClick}
      onPointerUp={handleUp}
    >
      <group scale={hovered ? 1.03 : 1.0}>{children}</group>
    </group>
  );
}


