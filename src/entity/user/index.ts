const emptyUser = {
  name: '',
  surname: '',
  birthdate: '',
  country: '',
};

type Entry = typeof emptyUser;

type PartialEntry = Partial<Entry>;

type Key = keyof Entry;

// const keys = Object.keys(emptyUser) as Key[];

export type Validator = {
  [K in keyof Entry]: (value?: Entry[K]) => Promise<void>;
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

type ValidationType = keyof typeof validationTypes;

export interface ValidationInvariant {
  (condition: unknown, validationType: ValidationType): asserts condition;
}

type CountryMap = Record<string, string>;

export interface LoadCountries {
  (): Promise<CountryMap>;
}

interface ValidationRejectedResult extends PromiseRejectedResult {
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

class User {
  constructor(protected validator: Validator) {}
  protected entry: PartialEntry = {};
  set(entry: PartialEntry): void {
    this.entry = entry;
  }
  async validate(): Promise<void> {
    const keys = Object.keys(emptyUser) as Key[];
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
