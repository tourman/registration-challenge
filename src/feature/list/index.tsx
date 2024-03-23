import { ComponentType, ReactElement } from 'react';
import type * as User from 'entity/user';

export type ID = string | number;

export type View = ComponentType<InnerProps>;

export type Entry = User.Entry & { id: ID };

export type TranslateArgs =
  | ['Name']
  | ['Birthdate']
  | ['Country']
  | [`country:${string}`];

export interface Translate {
  (...args: TranslateArgs): string;
}

export interface TimeClass {
  formatDate(date: string): string;
}

interface Render {
  renderHeaderCell?: () => ReactElement;
  renderBodyCell?: (index: number) => ReactElement;
}

interface TransitProps extends Render {
  T: Translate;
  Time: TimeClass;
}

export interface Load {
  (): Promise<Entry[]>;
}

export interface OuterProps extends TransitProps {
  loadList: Load;
  loadCountries: User.LoadCountries;
}

export interface InnerProps extends TransitProps {
  list: Entry[];
  loading: boolean;
  error?: Error;
}

export interface UseList {
  (props: OuterProps): InnerProps;
}

function listFactory({
  useList,
}: {
  useList: UseList;
}): ComponentType<OuterProps & { Component: View }> {
  return function List({ Component, ...outerProps }) {
    const innerProps = useList(outerProps);
    return <Component {...innerProps} />;
  };
}

export default listFactory;
