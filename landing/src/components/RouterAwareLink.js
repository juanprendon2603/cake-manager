import { jsx as _jsx } from "react/jsx-runtime";
import { Link, useInRouterContext } from "react-router-dom";
export function RouterAwareLink({ to, newTab, className, children, ...rest }) {
    const inRouter = typeof useInRouterContext === "function" ? useInRouterContext() : false;
    const isExternal = /^https?:\/\//i.test(to);
    if (isExternal || !inRouter) {
        return (_jsx("a", { href: to, className: className, target: newTab ? "_blank" : undefined, rel: newTab ? "noopener noreferrer" : undefined, ...rest, children: children }));
    }
    // estamos dentro de un Router y es ruta interna
    return (_jsx(Link, { to: to, className: className, ...rest, children: children }));
}
