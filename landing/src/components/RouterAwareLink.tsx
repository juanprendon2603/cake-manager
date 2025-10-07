import { Link, useInRouterContext } from "react-router-dom";

type Props = React.ComponentProps<"a"> & {
  to: string; // ruta interna o url externa
  newTab?: boolean; // abrir en tab nueva (para URLs externas)
  className?: string;
  children: React.ReactNode;
};

export function RouterAwareLink({
  to,
  newTab,
  className,
  children,
  ...rest
}: Props) {
  const inRouter =
    typeof useInRouterContext === "function" ? useInRouterContext() : false;

  const isExternal = /^https?:\/\//i.test(to);
  if (isExternal || !inRouter) {
    return (
      <a
        href={to}
        className={className}
        target={newTab ? "_blank" : undefined}
        rel={newTab ? "noopener noreferrer" : undefined}
        {...rest}
      >
        {children}
      </a>
    );
  }

  // estamos dentro de un Router y es ruta interna
  return (
    <Link to={to} className={className} {...(rest as any)}>
      {children}
    </Link>
  );
}
