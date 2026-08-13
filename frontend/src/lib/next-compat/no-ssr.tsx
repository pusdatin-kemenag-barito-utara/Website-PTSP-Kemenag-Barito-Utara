import type { ComponentType, ReactElement } from "react";

export function noSSR<P>(Component: ComponentType<P>): ComponentType<P> {
  return Component;
}

export function NoSSR({
  children,
}: {
  children: ReactElement | ReactElement[];
}) {
  return children;
}