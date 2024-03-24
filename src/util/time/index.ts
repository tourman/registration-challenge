import type * as Entity from 'entity/user';
import type * as Translation from 'util/translation';
import type * as List from 'feature/list';
import moment, { Moment } from 'moment';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isTime(time: any): time is Entity.Time {
  return time?.isTime?.() === 'Time';
}

const ExternalUtilTime: Entity.TimeClass &
  Translation.TimeClass &
  List.TimeClass = class ExternalUtilTime
  implements Entity.Time, Translation.Time
{
  readonly time: Moment;
  protected toMoment(time: Entity.AcceptedTime): Moment {
    if (time instanceof ExternalUtilTime) {
      return this.time;
    } else if (isTime(time)) {
      return moment(time.getTime());
    } else {
      return moment(time);
    }
  }
  constructor(time: Entity.AcceptedTime) {
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
  greaterThan(time: Entity.AcceptedTime) {
    return this.time.unix() > this.toMoment(time).unix();
  }
  lessOrEqualThan(time: Entity.AcceptedTime) {
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
  ageYears() {
    return moment().diff(this.time, 'years');
  }
  month() {
    return this.time.format('MMM');
  }
  day() {
    return this.time.format('Do');
  }
  static formatDate(time: string) {
    return new Date(time).toLocaleDateString();
  }
};

export default ExternalUtilTime;
