import { useEffect, useRef } from "react";

export type MousePosition = { x: number; y: number };

export function useMousePositionRef() {
  const mousePos = useRef<MousePosition>({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      mousePos.current = { x: event.clientX, y: event.clientY };
    };
    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length > 1) {
        event.preventDefault();
        mousePos.current = {
          x: event.touches[0].pageX,
          y: event.touches[0].pageY,
        };
      }
    };
    const handleTouchEnd = () => {
      mousePos.current = {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      };
    };
    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length === 1) {
        event.preventDefault();
        mousePos.current = {
          x: event.touches[0].pageX,
          y: event.touches[0].pageY,
        };
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });
    window.addEventListener("touchend", handleTouchEnd);
    window.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  return mousePos;
}
