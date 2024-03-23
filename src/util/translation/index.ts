import type * as Registration from 'feature/registration';
import type * as List from 'feature/list';
import type * as Language from 'feature/language';

export interface Time {
  ageYears(): number;
  month(): string;
  day(): string;
}

export interface TimeClass {
  new (time: string): Time;
}

export default TimeClass;

type MainArgs = ['Back to form'] | ['See all users'];

export interface Factory {
  (Time: TimeClass): (
    ...args:
      | Registration.TranslateArgs
      | List.TranslateArgs
      | Language.TranslateArgs<'en' | 'pt'>
      | MainArgs
  ) => string;
}
