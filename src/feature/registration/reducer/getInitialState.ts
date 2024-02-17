import { State } from 'feature/registration/types';

function getInitialState(): State {
  return {
    display: {
      name: { value: '', error: null },
      surname: { value: '', error: null },
      birthdate: { value: '', error: null },
      country: { value: '', error: null },
      allowSubmit: false,
      submitting: false,
      error: false,
      done: null,
    },
    validating: null,
    submitting: null,
  };
}

export default getInitialState;
