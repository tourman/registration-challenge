import type { Factory } from 'util/translation';
import isCountry from './isCountry';

const enFactory: Factory = (Time) =>
  function T(key, placeholder?, countries?): string {
    if (isCountry(key) && placeholder && !('name' in placeholder)) {
      return placeholder?.[key.replace('country:', '')] ?? key;
    }
    switch (key) {
      case 'lang:en':
      case 'lang:pt': {
        return key.replace('lang:', '').toUpperCase();
      }
      case 'done': {
        const { name, birthdate, country } = placeholder;
        const time = new Time(birthdate);
        return `Olá ${name} de ${T(
          `country:${country}`,
          countries,
        )}, no dia ${time.day()} de ${time.month()} fará ${
          time.ageYears() + 1
        } anos!`;
      }
      case 'Please fill out the form correctly before submitting': {
        return 'Por favor preencha o formulário corretamente antes de enviar';
      }
      case 'Enter your first name': {
        return 'Digite seu primeiro nome';
      }
      case 'Enter your second name': {
        return 'Digite seu segundo nome';
      }
      case 'Choose your country': {
        return 'Escolha seu país';
      }
      case 'Save': {
        return 'Guardar';
      }
      case 'error:DATE_PAST': {
        return 'A data de nascimento deve estar no passado';
      }
      case 'error:AGE_LIMIT': {
        return 'A data de nascimento é muito antiga';
      }
      case 'error:TRIMMED_STRING': {
        return 'Uma linha não pode ser agrupada com espaços e conter vários espaços dentro';
      }
      case 'Name':
      case 'label:name': {
        return 'Nome';
      }
      case 'label:surname': {
        return 'Sobrenome';
      }
      case 'Birthdate':
      case 'label:birthdate': {
        return 'Aniversário';
      }
      case 'Country':
      case 'label:country': {
        return 'País';
      }
      default: {
        return key;
      }
    }
  };

export default enFactory;
