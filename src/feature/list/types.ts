import * as User from 'entity/user/types';
import { ComponentType } from 'react';

type ID = string | number;

export type View = ComponentType<InnerProps>;

type Entry = User.Entry & { id: ID };

export type TranslateArgs =
  | ['Name']
  | ['Birthdate']
  | ['Country']
  | [`country:${string}`, User.CountryMap];

export interface Translate {
  (...args: TranslateArgs): string;
}

export interface TimeClass {
  formatDate(date: string): string;
}

interface TransiteProps {
  T: Translate;
  Time: TimeClass;
}

export interface Load {
  (): Promise<Entry[]>;
}

export interface OuterProps extends TransiteProps {
  loadList: Load;
  loadCountries: User.LoadCountries;
}

interface InnerProps extends TransiteProps {
  list: Entry[];
  loading: boolean;
  error?: Error;
  countries: User.CountryMap;
}

export interface UseList {
  (props: OuterProps): InnerProps;
}
