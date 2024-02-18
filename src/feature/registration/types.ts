import {
  Entry,
  PartialEntry,
  UserFactory,
  ValidationRejectedResult,
  ValidationType,
} from 'entity/user/types';
import User from 'entity/user/user';
import { ComponentType } from 'react';

type Fields = {
  [K in keyof Entry]: {
    value: Entry[K];
    error: null | ValidationType;
  };
};

export type Display = Fields & {
  allowSubmit: boolean;
  submitting: boolean;
  error: boolean;
  done: null | Entry;
};

type SerializableEntry = {
  [K in keyof Entry]: Entry[K];
};

export interface State {
  display: Display;
  validating: null | SerializableEntry;
  submitting: null | Entry;
}

interface AggregateValidationError {
  errors: ValidationRejectedResult[];
}

export type Action =
  | { type: 'CHANGE'; payload: PartialEntry }
  | {
      type: 'VALIDATE';
      error?: AggregateValidationError;
      validated: SerializableEntry;
    }
  | { type: 'SUBMIT' }
  | { type: 'DONE' }
  | { type: 'ERROR'; error: Error };

export interface Reducer {
  (state: State, action: Action): State;
}

export interface StateValidator {
  (state: State): void;
}

export interface ReducerFactory {
  (validator: StateValidator): Reducer;
}

export interface GetInitialState {
  (): State;
}

export interface Save {
  (entry: Entry): Promise<void>;
}

interface Translate {
  (key: string, placeholders?: Record<string, unknown>): string;
}

interface TransiteProps {
  T: Translate;
}

export interface OuterProps extends TransiteProps {
  userFactory: UserFactory;
  save: Save;
  reducer: Reducer;
  getInitialState: GetInitialState;
}

export interface InnerProps extends Omit<Display, 'error'>, TransiteProps {
  onChange: (payload: PartialEntry) => void;
  onSubmit: () => void;
  error?: Error;
  user: User;
}

export interface UseRegistration {
  (outerProps: OuterProps): InnerProps;
}

export type View = ComponentType<InnerProps>;
