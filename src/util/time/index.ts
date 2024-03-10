import type { AcceptedTime, Time, TimeClass } from 'entity/user';
import moment, { Moment } from 'moment';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isTime(time: any): time is Time {
  return time?.isTime?.() === 'Time';
}

const ExternalUtilTime: TimeClass = class ExternalUtilTime implements Time {
  readonly time: Moment;
  protected toMoment(time: AcceptedTime): Moment {
    if (time instanceof ExternalUtilTime) {
      return this.time;
    } else if (isTime(time)) {
      return moment(time.getTime());
    } else {
      return moment(time);
    }
  }
  constructor(time: AcceptedTime) {
    this.time = this.toMoment(time);
  }
  isTime(): 'Time' {
    return 'Time';
  }
  getTime() {
    return this.time.toDate();
  }
  minusYears(years: number) {
    return new ExternalUtilTime(this.time.subtract(years, 'years').toDate());
  }
  minusDays(days: number) {
    return new ExternalUtilTime(this.time.subtract(days, 'days').toDate());
  }
  greaterThan(time: AcceptedTime) {
    return this.time.unix() > this.toMoment(time).unix();
  }
  lessOrEqualThan(time: AcceptedTime) {
    return this.time.unix() <= this.toMoment(time).unix();
  }
  toString() {
    return this.time.format('YYYY-MM-DD');
  }
  static now() {
    return new ExternalUtilTime(Date.now());
  }
  static isValid(time: string) {
    return moment(time).isValid();
  }
};

export default ExternalUtilTime;
