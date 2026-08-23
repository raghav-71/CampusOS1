declare module 'react' {
  export function useState<S>(initialState: S | (() => S)): [S, (s: S | ((prev: S) => S)) => void];
  export function useEffect(fn: () => void | (() => void), deps?: any[]): void;
  export function useRef<T = any>(initial?: T): { current: T };
  export type FC<P = {}> = (props: P & { children?: any }) => any;
  const React: any;
  export default React;

}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
    interface Element {}
    interface ElementClass {}
    interface ElementAttributesProperty {}
  }
}

export {};
