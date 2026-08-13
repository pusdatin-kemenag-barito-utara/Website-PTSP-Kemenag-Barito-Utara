import * as React from "react";

export default function dynamic<P extends object>(
  loader: any,
  options?: {
    ssr?: boolean;
    loading?: React.ComponentType<any>;
  }
): React.ComponentType<P> {
  if (typeof loader !== "function") {
    return loader;
  }

  const LazyComponent = React.lazy(async () => {
    const res = await loader();
    if (res && res.default) {
      return res;
    }
    return { default: res };
  });

  return function DynamicComponent(props: P) {
    const [isMounted, setIsMounted] = React.useState(false);

    React.useEffect(() => {
      setIsMounted(true);
    }, []);

    const Loading = options?.loading;

    if (options?.ssr === false && !isMounted) {
      return Loading ? React.createElement(Loading) : null;
    }

    return React.createElement(
      React.Suspense,
      { fallback: Loading ? React.createElement(Loading) : null },
      React.createElement(LazyComponent, props as any)
    );
  };
}

export { noSSR } from "./no-ssr";