import type { Factory } from 'util/translation';
import isCountry from './isCountry';

const enFactory: Factory = (Time) =>
  function T(key, placeholder?, countries?): string {
    if (isCountry(key) && placeholder && !('name' in placeholder)) {
      return placeholder?.[key.replace('country:', '')] ?? key;
    }
    switch (key) {
      case 'done': {
        const { name, birthdate, country } = placeholder;
        const time = new Time(birthdate);
        return `Hello ${name} from ${T(
          `country:${country}`,
          countries,
        )}, on ${time.day()} of ${time.month()} you will be ${
          time.ageYears() + 1
        } years old!`;
      }
      case 'Please fill out the form correctly before submitting':
      case 'Name':
      case 'Country':
      case 'Birthdate':
      case 'Save':
      case 'Enter your first name':
      case 'Enter your second name':
      case 'Choose your country': {
        return key;
      }
      case 'error:DATE_PAST': {
        return 'Birthdate must be in past';
      }
      case 'error:AGE_LIMIT': {
        return 'Birthdate is too ancient';
      }
      case 'error:TRIMMED_STRING': {
        return 'String cannot be wrapped with spaces and contain mutiple spaces inside';
      }
      case 'label:name': {
        return 'Name';
      }
      case 'label:surname': {
        return 'Surname';
      }
      case 'label:birthdate': {
        return 'Birthdate';
      }
      case 'label:country': {
        return 'Country';
      }
      default: {
        return key;
      }
    }
  };

export default enFactory;
