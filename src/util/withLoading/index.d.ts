import { ComponentType } from 'react';

declare function withLoading<
  P,
  F extends { [K in keyof P]?: () => Promise<P[K]> },
>(
  componentFactory: () => Promise<ComponentType<{ [K in keyof P]: P[K] }>>,
  options: {
    factories: F;
    Load: ComponentType;
    Error: ComponentType<{ error: unknown }>;
  },
): ComponentType<Omit<P, keyof F>>;

export default withLoading;
