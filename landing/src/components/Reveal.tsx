import React, {
  cloneElement,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type RevealProps = {
  as?: React.ElementType;
  children: React.ReactNode;
  /** ms de retraso inicial */
  delay?: number;
  /** animación sólo la primera vez que entra (default true) */
  once?: boolean;
  /** offset vertical inicial en px (default 12) */
  y?: number;
  /** opcional: clase extra */
  className?: string;
  /** umbral de visibilidad 0..1 (default 0.15) */
  threshold?: number;
};

export function Reveal({
  as: Tag = "div",
  children,
  delay = 0,
  once = true,
  y = 12,
  className = "",
  threshold = 0.15,
}: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  const prefersReducedMotion = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );

  useEffect(() => {
    if (prefersReducedMotion) {
      setVisible(true);
      return;
    }
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setTimeout(() => setVisible(true), delay);
            if (once) obs.unobserve(e.target);
          } else if (!once) {
            setVisible(false);
          }
        });
      },
      { threshold }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [delay, once, threshold, prefersReducedMotion]);

  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        transform: visible
          ? "translateY(0px) scale(1)"
          : `translateY(${y}px) scale(0.995)`,
        opacity: visible ? 1 : 0,
        filter: visible ? "blur(0px)" : "blur(2px)",
        transition:
          "transform 520ms cubic-bezier(.21,.69,.25,1), opacity 420ms ease, filter 420ms ease",
        willChange: "transform, opacity, filter",
      }}
    >
      {children}
    </Tag>
  );
}

/**
 * Stagger para una lista de hijos.
 * Aplica delays crecientes a cada hijo (i * gap).
 */
type GroupProps = {
  children: React.ReactNode;
  as?: React.ElementType;
  /** ms entre cada hijo */
  gap?: number;
  /** ms delay inicial del primero */
  startDelay?: number;
  once?: boolean;
  y?: number;
  className?: string;
  threshold?: number;
};
Reveal.Group = function Group({
  children,
  as: Tag = "div",
  gap = 60,
  startDelay = 0,
  once = true,
  y = 12,
  className = "",
  threshold = 0.15,
}: GroupProps) {
  const array = React.Children.toArray(children);
  return (
    <Tag className={className}>
      {array.map((child, i) =>
        isValidElement(child) ? (
          <Reveal
            key={i}
            delay={startDelay + i * gap}
            once={once}
            y={y}
            threshold={threshold}
          >
            {cloneElement(child as React.ReactElement)}
          </Reveal>
        ) : (
          <Reveal
            key={i}
            delay={startDelay + i * gap}
            once={once}
            y={y}
            threshold={threshold}
          >
            {child}
          </Reveal>
        )
      )}
    </Tag>
  );
};
