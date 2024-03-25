import User, {
  CountryMap,
  Entry,
  Key,
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

export interface Save {
  (entry: Entry): Promise<void>;
}

export type TranslateArgs =
  | ['Please fill out the form correctly before submitting']
  | ['done', Entry, CountryMap]
  | ['Enter your first name']
  | ['Enter your second name']
  | ['Choose your country']
  | ['Save']
  | [`label:${Key}`]
  | [`error:${ValidationType}`]
  | [`country:${string}`, CountryMap];

export interface Translate {
  (...args: TranslateArgs): string;
}

interface TransitProps {
  T: Translate;
}

export interface OuterProps extends TransitProps {
  userFactory: UserFactory;
  save: Save;
  reducer: Reducer;
  getInitialState: GetInitialState;
  registerSecondaryTask: (task: () => void) => void;
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

export type View = ComponentType<InnerProps>;

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
