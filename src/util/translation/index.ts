import type * as Registration from 'feature/registration';
import type * as List from 'feature/list';

export interface Time {
  ageYears(): number;
  month(): string;
  day(): string;
}

export interface TimeClass {
  new (time: string): Time;
}

export default TimeClass;

export interface Factory {
  (Time: TimeClass): (
    ...args: Registration.TranslateArgs | List.TranslateArgs
  ) => string;
}
