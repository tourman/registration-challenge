/* eslint-disable import/no-unused-modules */
import { ComponentType } from 'react';

export type PropsFrom<C> = C extends ComponentType<infer P> ? P : never;
