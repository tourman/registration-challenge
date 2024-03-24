import User, {
  CountryMap,
  Entry,
  PartialEntry,
  UserFactory,
  ValidationRejectedResult,
  ValidationType,
} from 'entity/user';
import { ComponentType } from 'react';

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

interface Save {
  (entry: Entry): Promise<void>;
}

interface Translate {
  (
    key: string,
    placeholderA?: Record<string, unknown>,
    placeholderB?: Record<string, unknown>,
  ): string;
}

interface TransitProps {
  T: Translate;
}

interface OuterProps extends TransitProps {
  userFactory: UserFactory;
  save: Save;
  reducer: Reducer;
  getInitialState: GetInitialState;
}

export interface InnerProps extends Omit<Display, 'error'>, TransitProps {
  onChange: (payload: PartialEntry) => void;
  onSubmit: () => void;
  error?: Error;
  user: User;
  countries: CountryMap;
}

export interface UseRegistration {
  (outerProps: OuterProps): InnerProps;
}

type View = ComponentType<InnerProps>;

function registrationFactory({
  useRegistration,
}: {
  useRegistration: UseRegistration;
}): ComponentType<OuterProps & { Component: View }> {
  return function Registration({ Component, ...outerProps }) {
    const innerProps = useRegistration(outerProps);
    return <Component {...innerProps} />;
  };
}

export default registrationFactory;
