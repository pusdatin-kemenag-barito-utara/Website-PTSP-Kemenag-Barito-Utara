/// <reference types="astro/client" />

import "react";

declare module "react" {
  interface HTMLAttributes<T> {
    class?: string;
    style?: any;
    "is:inline"?: boolean;
    "set:html"?: string;
  }
  interface MetaHTMLAttributes<T> {
    charset?: string;
  }
  interface ScriptHTMLAttributes<T> {
    "is:inline"?: boolean;
    "set:html"?: string;
  }
  interface Attributes {
    "client:load"?: boolean;
    "client:idle"?: boolean;
    "client:visible"?: boolean;
    "client:media"?: string;
    "client:only"?: string;
  }
}

declare global {
  namespace JSX {
    interface IntrinsicAttributes {
      "client:load"?: boolean;
      "client:idle"?: boolean;
      "client:visible"?: boolean;
      "client:media"?: string;
      "client:only"?: string;
    }
  }
}

declare module "astro/jsx-runtime" {
  export const JSX: any;
  export const jsx: any;
  export const jsxs: any;
  export const Fragment: any;
}
