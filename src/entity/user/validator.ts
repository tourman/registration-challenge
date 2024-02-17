import defaultInvariant from 'invariant';
import type {
  LoadCountries,
  ValidationInvariant,
  Validator,
} from 'entity/user';

const invariant: ValidationInvariant = function (condition, validationType) {
  defaultInvariant(condition, validationType);
};

class UserValidator implements Validator {
  constructor(protected loadCountries: LoadCountries) {}
  protected sanitizedString(value?: string): asserts value {
    invariant(value && value !== '', 'FULL_STRING');
    invariant(value.trim().replace(/\s+/g, ' ') === value, 'TRIMMED_STRING');
  }
  async name(value?: string) {
    this.sanitizedString(value);
  }
  async surname(value?: string) {
    this.sanitizedString(value);
  }
  readonly ageLimitYears: number = 150;
  async birthdate(value?: string) {
    this.sanitizedString(value);
    invariant(/^\d{4}-\d{2}-\d{2}$/.test(value), 'DATE_FORMAT');
    const date = new Date(value);
    invariant(!isNaN(date.valueOf()), 'VALID_DATE');
    invariant(date.getTime() < Date.now(), 'DATE_PAST');
    invariant(
      new Date().getFullYear() - date.getFullYear() < this.ageLimitYears,
      'AGE_LIMIT',
    );
  }
  async country(value?: string) {
    this.sanitizedString(value);
    const countries = await this.loadCountries();
    invariant(value in countries, 'COUNTRY');
  }
}

// export default UserValidator;
