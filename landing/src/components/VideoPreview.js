import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
export function VideoPreview({ srcDesktop, srcMobile, }) {
    const [src, setSrc] = useState(srcDesktop);
    const [ratio, setRatio] = useState("16 / 9");
    useEffect(() => {
        const mq = window.matchMedia("(max-width: 640px)");
        const updateSrc = () => setSrc(mq.matches ? srcMobile : srcDesktop);
        updateSrc();
        mq.addEventListener("change", updateSrc);
        return () => mq.removeEventListener("change", updateSrc);
    }, [srcDesktop, srcMobile]);
    return (_jsxs("div", { className: "relative rounded-xl overflow-hidden border border-white/70 shadow-inner", style: {
            aspectRatio: ratio,
            background: "radial-gradient(1200px 200px at 50% 100%, rgba(168,85,247,0.10), rgba(255,255,255,0))",
        }, children: [_jsx("div", { className: "pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" }), _jsx("video", { className: "absolute inset-0 w-full h-full object-contain", src: src, autoPlay: true, loop: true, muted: true, playsInline: true, preload: "metadata", onLoadedMetadata: (e) => {
                    const v = e.currentTarget;
                    if (v.videoWidth && v.videoHeight)
                        setRatio(`${v.videoWidth} / ${v.videoHeight}`);
                } })] }));
}
