import { Case } from './index.test';

const fullValidationObj = {
  name: 'Name',
  surname: 'Surname',
  birthdate: '1990-01-01',
  country: 'es',
};

const semiFullValidationObj = {
  name: 'Name ',
  surname: '',
  birthdate: '',
  country: '',
};

const cases: Case[] = [
  {
    description: 'SUBMIT while error',
    should: 'forbit submitting and reflect submitting status',
    state: {
      display: {
        name: { value: 'a', error: null },
        surname: { value: 'b', error: null },
        birthdate: { value: 'c', error: null },
        country: { value: 'd', error: null },
        allowSubmit: true,
        submitting: false,
        error: true,
        done: null,
      },
      validating: null,
      submitting: null,
    },
    action: { type: 'SUBMIT' },
    expected: {
      display: {
        name: { value: 'a', error: null },
        surname: { value: 'b', error: null },
        birthdate: { value: 'c', error: null },
        country: { value: 'd', error: null },
        allowSubmit: false,
        submitting: true,
        error: false,
        done: null,
      },
      validating: null,
      submitting: {
        name: 'a',
        surname: 'b',
        birthdate: 'c',
        country: 'd',
      },
    },
  },
  {
    description: 'VALIDATE with the same validation object',
    should:
      'map errors to display and reset validating; FULL_STRING errors are ignored to allow continue editing',
    state: {
      display: {
        name: { value: 'Name ', error: null },
        surname: { value: '', error: null },
        birthdate: { value: '', error: null },
        country: { value: '', error: null },
        allowSubmit: false,
        submitting: false,
        error: false,
        done: null,
      },
      validating: semiFullValidationObj,
      submitting: null,
    },
    action: {
      type: 'VALIDATE',
      error: {
        errors: [
          {
            key: 'name',
            reason: 'TRIMMED_STRING',
            status: 'rejected',
          },
          {
            key: 'surname',
            reason: 'FULL_STRING',
            status: 'rejected',
          },
          {
            key: 'birthdate',
            reason: 'FULL_STRING',
            status: 'rejected',
          },
          {
            key: 'country',
            reason: 'FULL_STRING',
            status: 'rejected',
          },
        ],
      },
      validated: semiFullValidationObj,
    },
    expected: {
      display: {
        name: { value: 'Name ', error: 'TRIMMED_STRING' },
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
    },
  },
  {
    description: 'VALIDATE no errors',
    should: 'behave as success',
    state: {
      display: {
        name: { value: 'Name', error: null },
        surname: { value: 'Surname', error: null },
        birthdate: { value: '1990-01-01', error: null },
        country: { value: 'es', error: null },
        allowSubmit: false,
        submitting: false,
        error: false,
        done: null,
      },
      validating: fullValidationObj,
      submitting: null,
    },
    action: {
      type: 'VALIDATE',
      error: {
        errors: [],
      },
      validated: fullValidationObj,
    },
    expected: {
      display: {
        name: { value: 'Name', error: null },
        surname: { value: 'Surname', error: null },
        birthdate: { value: '1990-01-01', error: null },
        country: { value: 'es', error: null },
        allowSubmit: true,
        submitting: false,
        error: false,
        done: null,
      },
      validating: null,
      submitting: null,
    },
  },
  {
    description: 'CHANGE nothing',
    should: 'ignore',
    state: {
      display: {
        name: { value: '', error: null },
        surname: { value: '', error: null },
        birthdate: { value: '', error: null },
        country: { value: '-', error: 'COUNTRY' },
        allowSubmit: false,
        submitting: false,
        error: true,
        done: null,
      },
      validating: {
        name: '',
        surname: '',
        birthdate: '',
        country: '',
      },
      submitting: null,
    },
    action: { type: 'CHANGE', payload: {} },
    expected: {
      display: {
        name: { value: '', error: null },
        surname: { value: '', error: null },
        birthdate: { value: '', error: null },
        country: { value: '-', error: 'COUNTRY' },
        allowSubmit: false,
        submitting: false,
        error: true,
        done: null,
      },
      validating: {
        name: '',
        surname: '',
        birthdate: '',
        country: '',
      },
      submitting: null,
    },
  },
  {
    description: 'CHANGE when validating and errors',
    should: 'change validating, appropriate field values and reset errors',
    state: {
      display: {
        name: { value: '', error: null },
        surname: { value: '', error: null },
        birthdate: { value: 'c', error: 'DATE_FORMAT' },
        country: { value: 'd', error: null },
        allowSubmit: false,
        submitting: false,
        error: true,
        done: null,
      },
      validating: {
        name: '',
        surname: '',
        birthdate: 'c',
        country: 'd',
      },
      submitting: null,
    },
    action: { type: 'CHANGE', payload: { birthdate: '1990-02-02' } },
    expected: {
      display: {
        name: { value: '', error: null },
        surname: { value: '', error: null },
        birthdate: { value: '1990-02-02', error: null },
        country: { value: 'd', error: null },
        allowSubmit: false,
        submitting: false,
        error: true,
        done: null,
      },
      validating: {
        name: '',
        surname: '',
        birthdate: '1990-02-02',
        country: 'd',
      },
      submitting: null,
    },
  },
  {
    description: 'ERROR',
    should: 'set error flag',
    state: {
      display: {
        name: { value: 'a', error: null },
        surname: { value: 'b', error: null },
        birthdate: { value: 'c', error: null },
        country: { value: 'd', error: null },
        allowSubmit: false,
        submitting: true,
        error: false,
        done: null,
      },
      validating: null,
      submitting: {
        name: 'a',
        surname: 'b',
        birthdate: 'c',
        country: 'd',
      },
    },
    action: { type: 'ERROR', error: new Error() },
    expected: {
      display: {
        name: { value: 'a', error: null },
        surname: { value: 'b', error: null },
        birthdate: { value: 'c', error: null },
        country: { value: 'd', error: null },
        allowSubmit: true,
        submitting: false,
        error: true,
        done: null,
      },
      validating: null,
      submitting: null,
    },
  },
  {
    description: 'DONE',
    should: 'reset field values and submitting flags',
    state: {
      display: {
        name: { value: 'k', error: null },
        surname: { value: 'l', error: null },
        birthdate: { value: 'm', error: null },
        country: { value: 'n', error: null },
        allowSubmit: false,
        submitting: true,
        error: false,
        done: null,
      },
      validating: null,
      submitting: {
        name: 'k',
        surname: 'l',
        birthdate: 'm',
        country: 'n',
      },
    },
    action: { type: 'DONE' },
    expected: {
      display: {
        name: { value: '', error: null },
        surname: { value: '', error: null },
        birthdate: { value: '', error: null },
        country: { value: '', error: null },
        allowSubmit: false,
        submitting: false,
        error: false,
        done: {
          name: 'k',
          surname: 'l',
          birthdate: 'm',
          country: 'n',
        },
      },
      validating: null,
      submitting: null,
    },
  },
  // todo: test if error is replaced
  {
    description: 'VALIDATE with another validation object',
    should: 'change nothing',
    state: {
      display: {
        name: { value: 'a', error: null },
        surname: { value: 'b', error: null },
        birthdate: { value: 'c', error: 'DATE_FORMAT' },
        country: { value: 'd', error: null },
        allowSubmit: false,
        submitting: false,
        error: false,
        done: null,
      },
      validating: {
        name: 'a',
        surname: 'b',
        birthdate: 'c',
        country: 'd',
      },
      submitting: null,
    },
    action: {
      type: 'VALIDATE',
      error: {
        errors: [
          {
            key: 'name',
            reason: 'FULL_STRING',
            status: 'rejected',
          },
          {
            key: 'surname',
            reason: 'FULL_STRING',
            status: 'rejected',
          },
          {
            key: 'birthdate',
            reason: 'FULL_STRING',
            status: 'rejected',
          },
          {
            key: 'country',
            reason: 'FULL_STRING',
            status: 'rejected',
          },
        ],
      },
      validated: {
        name: '',
        surname: '',
        birthdate: '',
        country: '',
      },
    },
    expected: {
      display: {
        name: { value: 'a', error: null },
        surname: { value: 'b', error: null },
        birthdate: { value: 'c', error: 'DATE_FORMAT' },
        country: { value: 'd', error: null },
        allowSubmit: false,
        submitting: false,
        error: false,
        done: null,
      },
      validating: {
        name: 'a',
        surname: 'b',
        birthdate: 'c',
        country: 'd',
      },
      submitting: null,
    },
  },
  {
    description: 'CHANGE while submitting',
    should: 'change nothing',
    state: {
      display: {
        name: { value: '', error: null },
        surname: { value: '', error: null },
        birthdate: { value: '', error: null },
        country: { value: '', error: null },
        allowSubmit: false,
        submitting: true,
        error: false,
        done: null,
      },
      validating: null,
      submitting: {
        name: '',
        surname: '',
        birthdate: '',
        country: '',
      },
    },
    action: { type: 'CHANGE', payload: { name: 'test-name' } },
    expected: {
      display: {
        name: { value: '', error: null },
        surname: { value: '', error: null },
        birthdate: { value: '', error: null },
        country: { value: '', error: null },
        allowSubmit: false,
        submitting: true,
        error: false,
        done: null,
      },
      validating: null,
      submitting: {
        name: '',
        surname: '',
        birthdate: '',
        country: '',
      },
    },
  },
  {
    description: 'VALIDATE with success',
    should: 'remove all errors from display',
    state: {
      display: {
        name: { value: 'Name', error: null },
        surname: { value: 'Surname', error: null },
        birthdate: { value: '1990-01-01', error: null },
        country: { value: 'es', error: null },
        allowSubmit: false,
        submitting: false,
        error: false,
        done: null,
      },
      validating: fullValidationObj,
      submitting: null,
    },
    action: {
      type: 'VALIDATE',
      validated: fullValidationObj,
    },
    expected: {
      display: {
        name: { value: 'Name', error: null },
        surname: { value: 'Surname', error: null },
        birthdate: { value: '1990-01-01', error: null },
        country: { value: 'es', error: null },
        allowSubmit: true,
        submitting: false,
        error: false,
        done: null,
      },
      validating: null,
      submitting: null,
    },
  },
  {
    description: 'SUBMIT while validation errors',
    should: 'ignore',
    state: {
      display: {
        name: { value: '', error: null },
        surname: { value: '', error: null },
        birthdate: { value: '-', error: 'DATE_FORMAT' },
        country: { value: '', error: null },
        allowSubmit: false,
        submitting: false,
        error: false,
        done: null,
      },
      validating: null,
      submitting: null,
    },
    action: { type: 'SUBMIT' },
    expected: {
      display: {
        name: { value: '', error: null },
        surname: { value: '', error: null },
        birthdate: { value: '-', error: 'DATE_FORMAT' },
        country: { value: '', error: null },
        allowSubmit: false,
        submitting: false,
        error: false,
        done: null,
      },
      validating: null,
      submitting: null,
    },
  },
  {
    description: 'SUBMIT while submitting',
    should: 'ignore',
    state: {
      display: {
        name: { value: '', error: null },
        surname: { value: '', error: null },
        birthdate: { value: '', error: null },
        country: { value: '', error: null },
        allowSubmit: false,
        submitting: true,
        error: false,
        done: null,
      },
      validating: null,
      submitting: {
        name: '',
        surname: '',
        birthdate: '',
        country: '',
      },
    },
    action: { type: 'SUBMIT' },
    expected: {
      display: {
        name: { value: '', error: null },
        surname: { value: '', error: null },
        birthdate: { value: '', error: null },
        country: { value: '', error: null },
        allowSubmit: false,
        submitting: true,
        error: false,
        done: null,
      },
      validating: null,
      submitting: {
        name: '',
        surname: '',
        birthdate: '',
        country: '',
      },
    },
  },
  {
    description: 'CHANGE after success',
    should: 'reset done and change values',
    state: {
      display: {
        name: { value: '', error: null },
        surname: { value: '', error: null },
        birthdate: { value: '', error: null },
        country: { value: '', error: null },
        allowSubmit: false,
        submitting: false,
        error: false,
        done: {
          name: 'a',
          surname: 'b',
          birthdate: 'c',
          country: 'd',
        },
      },
      validating: null,
      submitting: null,
    },
    action: { type: 'CHANGE', payload: { name: 'x' } },
    expected: {
      display: {
        name: { value: 'x', error: null },
        surname: { value: '', error: null },
        birthdate: { value: '', error: null },
        country: { value: '', error: null },
        allowSubmit: false,
        submitting: false,
        error: false,
        done: null,
      },
      validating: {
        name: 'x',
        surname: '',
        birthdate: '',
        country: '',
      },
      submitting: null,
    },
  },
];

export default cases;
