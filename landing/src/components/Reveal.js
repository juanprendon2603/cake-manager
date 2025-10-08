import { jsx as _jsx } from "react/jsx-runtime";
import React, { cloneElement, isValidElement, useEffect, useMemo, useRef, useState, } from "react";
export function Reveal({ as: Tag = "div", children, delay = 0, once = true, y = 12, className = "", threshold = 0.15, }) {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);
    const prefersReducedMotion = useMemo(() => typeof window !== "undefined" &&
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches, []);
    useEffect(() => {
        if (prefersReducedMotion) {
            setVisible(true);
            return;
        }
        const el = ref.current;
        if (!el)
            return;
        const obs = new IntersectionObserver((entries) => {
            entries.forEach((e) => {
                if (e.isIntersecting) {
                    setTimeout(() => setVisible(true), delay);
                    if (once)
                        obs.unobserve(e.target);
                }
                else if (!once) {
                    setVisible(false);
                }
            });
        }, { threshold });
        obs.observe(el);
        return () => obs.disconnect();
    }, [delay, once, threshold, prefersReducedMotion]);
    return (_jsx(Tag, { ref: ref, className: className, style: {
            transform: visible
                ? "translateY(0px) scale(1)"
                : `translateY(${y}px) scale(0.995)`,
            opacity: visible ? 1 : 0,
            filter: visible ? "blur(0px)" : "blur(2px)",
            transition: "transform 520ms cubic-bezier(.21,.69,.25,1), opacity 420ms ease, filter 420ms ease",
            willChange: "transform, opacity, filter",
        }, children: children }));
}
Reveal.Group = function Group({ children, as: Tag = "div", gap = 60, startDelay = 0, once = true, y = 12, className = "", threshold = 0.15, }) {
    const array = React.Children.toArray(children);
    return (_jsx(Tag, { className: className, children: array.map((child, i) => isValidElement(child) ? (_jsx(Reveal, { delay: startDelay + i * gap, once: once, y: y, threshold: threshold, children: cloneElement(child) }, i)) : (_jsx(Reveal, { delay: startDelay + i * gap, once: once, y: y, threshold: threshold, children: child }, i))) }));
};
