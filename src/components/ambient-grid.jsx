import { useEffect, useRef } from 'react';

export function AmbientGrid({ variant = 'app' }) {
  const canvasRef = useRef(null);
  const pointerRef = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return undefined;
    }

    const context = canvas.getContext('2d');
    if (!context) {
      return undefined;
    }

    let frame = 0;
    let animationId = 0;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const setSize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * ratio);
      canvas.height = Math.floor(window.innerHeight * ratio);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const handlePointerMove = (event) => {
      pointerRef.current = {
        x: event.clientX / window.innerWidth,
        y: event.clientY / window.innerHeight,
      };
    };

    const draw = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isLanding = variant === 'landing';
      const spacing = isLanding ? 30 : 34;
      const pulse = 0.5 + Math.sin(frame * 0.025) * 0.5;
      const driftX = (pointerRef.current.x - 0.5) * (isLanding ? 16 : 12);
      const driftY = (pointerRef.current.y - 0.5) * (isLanding ? 16 : 12);

      context.clearRect(0, 0, width, height);

      if (isLanding) {
        const gradient = context.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#08110c');
        gradient.addColorStop(1, '#050907');
        context.fillStyle = gradient;
        context.fillRect(0, 0, width, height);
      }

      for (let y = -spacing; y < height + spacing; y += spacing) {
        for (let x = -spacing; x < width + spacing; x += spacing) {
          const focusX = isLanding ? width * 0.5 : width * 0.45;
          const focusY = isLanding ? height * 0.45 : height * 0.28;
          const dx = x - focusX + driftX;
          const dy = y - focusY + driftY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const fade = Math.max(0, 1 - distance / (Math.max(width, height) * (isLanding ? 0.78 : 0.82)));
          const radius = (isLanding ? 0.75 : 0.55) + fade * (isLanding ? 1.15 : 0.55) + pulse * (isLanding ? 0.28 : 0.18);

          context.beginPath();
          context.fillStyle = isLanding
            ? `rgba(146, 255, 193, ${0.05 + fade * 0.28})`
            : `rgba(36, 18, 8, ${0.04 + fade * 0.09})`;
          context.arc(x + driftX * 0.18, y + driftY * 0.14, radius, 0, Math.PI * 2);
          context.fill();
        }
      }

      frame += mediaQuery.matches ? 0.2 : 1;
      animationId = window.requestAnimationFrame(draw);
    };

    setSize();
    draw();

    window.addEventListener('resize', setSize);
    window.addEventListener('pointermove', handlePointerMove);

    return () => {
      window.cancelAnimationFrame(animationId);
      window.removeEventListener('resize', setSize);
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={`pointer-events-none fixed inset-0 z-0 ${variant === 'landing' ? 'opacity-100' : 'opacity-70'}`}
      />
      <div className={variant === 'landing' ? 'theme-grid-landing' : 'theme-grid'} aria-hidden="true" />
    </>
  );
}
