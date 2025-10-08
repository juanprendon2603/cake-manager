// src/hooks/useParallax.ts
import { useEffect, useState } from "react";
export function useParallax(mult = 0.15, max = 24) {
    const [t, setT] = useState(0);
    useEffect(() => {
        const onScroll = () => {
            const y = Math.min(window.scrollY * mult, max);
            setT(y);
        };
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, [mult, max]);
    return t;
}
