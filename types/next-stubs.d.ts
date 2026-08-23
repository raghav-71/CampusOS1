declare module 'next' {
  export * from 'next/types';
}

declare module 'next/image-types/global' {
  // empty module to satisfy reference in next-env.d.ts when types aren't installed
}
