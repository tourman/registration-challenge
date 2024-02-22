export interface Time {
  ageYears(): number;
  month(): string;
  day(): string;
}

export interface TimeClass {
  new (time: string): Time;
}

export default TimeClass;
