const emptyUser = {
  name: '',
  surname: '',
  birthdate: '',
  country: '',
};

export type Entry = typeof emptyUser;

export type PartialEntry = Partial<Entry>;

export type Key = keyof Entry;

export const keys = Object.keys(emptyUser) as Key[];

export type Validator = {
  [K in keyof Entry]: (value?: Entry[K]) => Promise<void>;
} & {
  getMinDate(): string;
  getMaxDate(): string;
  loadCountries: LoadCountries;
};

const validationTypes = {
  FULL_STRING: 'String must be not empty',
  TRIMMED_STRING: 'String must be trimmed',
  DATE_FORMAT: 'Date must be YYYY-MM-DD',
  VALID_DATE: 'Date must be valid',
  DATE_PAST: 'Date must be in past',
  AGE_LIMIT: 'Date cannot be more than specific amount of years',
  COUNTRY: 'Country code must be valid',
} as const;

export type ValidationType = keyof typeof validationTypes;

export interface ValidationInvariant {
  (condition: unknown, validationType: ValidationType): asserts condition;
}

type CountryMap = Record<string, string>;

export interface LoadCountries {
  (): Promise<CountryMap>;
}

export interface ValidationRejectedResult extends PromiseRejectedResult {
  key: Key;
  reason: ValidationType | { message: ValidationType };
}

function isValidationRejectedResult(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result: any,
): result is ValidationRejectedResult {
  return (
    result?.status === 'rejected' &&
    result?.key in emptyUser &&
    (result?.reason?.message ?? result?.reason) in validationTypes
  );
}

type AcceptedTime = Time | Date | string | number;

interface Time {
  isTime(): 'Time';
  getTime(): Exclude<AcceptedTime, Time>;
  minusYears(years: number): Time;
  minusDays(days: number): Time;
  // should return in format 'yyyy-mm-dd'
  toString(): string;
  greaterThan(time: AcceptedTime): boolean;
  lessOrEqualThan(time: AcceptedTime): boolean;
}

export interface TimeClass {
  new (time: AcceptedTime): Time;
  now(): Time;
  isValid(time: string): boolean;
}

interface UserFactory {
  (): User;
}

class User {
  constructor(public readonly validator: Validator) {}
  protected entry: PartialEntry = {};
  set(entry: PartialEntry): void {
    this.entry = entry;
  }
  async validate(): Promise<void> {
    await Promise.allSettled(
      keys.map((key) => this.validator[key](this.entry[key])),
    )
      .then((results) =>
        results.map((result, index) => ({ ...result, key: keys[index] })),
      )
      .then((results) => results.filter(isValidationRejectedResult))
      .then((rejects) => {
        if (!rejects.length) {
          return;
        }
        throw new AggregateError(rejects, 'Invalid user entry');
      });
  }
}

// export default User;
