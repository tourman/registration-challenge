import type { Factory } from 'util/translation';
import isCountry from './isCountry';

const enFactory: Factory = ({ Time, countries }) =>
  function T(key, placeholder?): string {
    if (isCountry(key)) {
      const countryKey = key.replace('country:', '');
      return (
        countries[countryKey] ??
        countries[countryKey.toLocaleLowerCase()] ??
        countries[countryKey.toUpperCase()] ??
        key
      );
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
      case 'Back to form': {
        return 'Voltar ao formulário';
      }
      case 'See all users': {
        return 'Ver todos os usuários';
      }
      default: {
        return key;
      }
    }
  };

export default enFactory;
