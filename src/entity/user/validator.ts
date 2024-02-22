import defaultInvariant from 'invariant';
import {
  LoadCountries,
  TimeClass,
  ValidationInvariant,
  Validator,
} from './types';

const invariant: ValidationInvariant = function (condition, validationType) {
  defaultInvariant(condition, validationType);
};

class UserValidator implements Validator {
  constructor(
    public readonly loadCountries: LoadCountries,
    protected Time: TimeClass
  ) {}
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
  getMinDate(): string {
    return this.Time.now().minusYears(this.ageLimitYears).toString();
  }
  getMaxDate(): string {
    return this.Time.now().minusDays(1).toString();
  }
  async birthdate(value?: string) {
    this.sanitizedString(value);
    invariant(this.Time.isValid(value), 'VALID_DATE');
    const time = new this.Time(value);
    invariant(time.toString() === value, 'DATE_FORMAT');
    invariant(time.lessOrEqualThan(this.getMaxDate()), 'DATE_PAST');
    invariant(time.greaterThan(this.getMinDate()), 'AGE_LIMIT');
  }
  async country(value?: string) {
    this.sanitizedString(value);
    const countries = await this.loadCountries();
    invariant(value in countries, 'COUNTRY');
  }
}

export default UserValidator;
