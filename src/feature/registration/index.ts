import type {
  Entry,
  PartialEntry,
  ValidationRejectedResult,
  ValidationType,
} from 'entity/user';

type Fields = {
  [K in keyof Entry]: {
    value: Entry[K];
    error: null | ValidationType;
  };
};

type Display = Fields & {
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

interface Reducer {
  (state: State, action: Action): State;
}

export interface StateValidator {
  (state: State): void;
}

interface ReducerFactory {
  (validator: StateValidator): Reducer;
}

interface GetInitialState {
  (): State;
}
