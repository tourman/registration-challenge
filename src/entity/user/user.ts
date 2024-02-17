import {
  Key,
  PartialEntry,
  Validator,
  emptyUser,
  isValidationRejectedResult,
} from './types';

class User {
  constructor(protected validator: Validator) {}
  protected entry: PartialEntry = {};
  set(entry: PartialEntry): void {
    this.entry = entry;
  }
  async validate(): Promise<void> {
    const keys = Object.keys(emptyUser) as Key[];
    await Promise.allSettled(
      keys.map((key) => this.validator[key](this.entry[key]))
    )
      .then((results) =>
        results.map((result, index) => ({ ...result, key: keys[index] }))
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

export default User;
