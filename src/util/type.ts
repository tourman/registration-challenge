import { ComponentType } from 'react';

export type PropsFrom<C> = C extends ComponentType<infer P> ? P : never;
