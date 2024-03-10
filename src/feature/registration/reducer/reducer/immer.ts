import type { Key, ValidationType } from 'entity/user';
import { keys } from 'entity/user';
import type { Action, State } from 'feature/registration';
import { produce } from 'immer';

const immerReducerFactory =
  (validate: (state: State) => void) =>
  (state: State, action: Action): State => {
    validate(state);
    const result = produce(state, (draft) => {
      function setSubmitting() {
        draft.display.submitting = !!draft.submitting;
      }
      function allowSubmit() {
        const noErrors = !keys
          .map((key) => draft.display[key].error)
          .filter((error) => error).length;
        const allFilled = !keys
          .map((key) => draft.display[key].value)
          .filter((value) => value === '').length;
        draft.display.allowSubmit =
          noErrors && allFilled && !draft.submitting && !draft.validating;
      }
      const { type } = action;
      switch (type) {
        case 'CHANGE': {
          if (state.submitting) {
            break;
          }
          const { payload } = action;
          let toValidate = false;
          for (const key of keys) {
            const value = payload[key];
            if (
              typeof value !== 'undefined' &&
              draft.display[key].value !== value
            ) {
              toValidate = true;
              draft.display[key].value = value;
              draft.display[key].error = null;
            }
          }
          if (toValidate) {
            const validating = {} as NonNullable<typeof state.validating>;
            for (const key of keys) {
              validating[key] = draft.display[key].value;
            }
            draft.validating = validating;
          }
          draft.display.done = null;
          break;
        }
        case 'DONE': {
          draft.submitting = null;
          for (const key of keys) {
            draft.display[key].value = '';
          }
          draft.display.error = false;
          draft.display.done = state.submitting;
          break;
        }
        case 'ERROR': {
          draft.submitting = null;
          draft.display.error = true;
          break;
        }
        case 'SUBMIT': {
          if (!state.display.allowSubmit) {
            break;
          }
          const submitting = {} as NonNullable<typeof state.submitting>;
          for (const key of keys) {
            const { value } = state.display[key];
            if (value === null) {
              break;
            }
            submitting[key] = value;
          }
          draft.submitting = submitting;
          draft.display.error = false;
          break;
        }
        case 'VALIDATE': {
          const { validated, error } = action;
          if (validated !== state.validating) {
            break;
          }
          const errorList = error?.errors ?? [];
          const errors = errorList.reduce((acc, { key, reason }) => {
            acc[key] = typeof reason === 'string' ? reason : reason.message;
            return acc;
          }, {} as Record<Key, ValidationType>);
          for (const key of keys) {
            const reason = errors[key] ?? null;
            if (reason === 'FULL_STRING') {
              draft.display[key].error = null;
            } else if (reason !== state.display[key].error) {
              draft.display[key].error = reason;
            }
          }
          draft.validating = null;
          break;
        }
      }
      setSubmitting();
      allowSubmit();
    });
    validate(result);
    return result;
  };

export default immerReducerFactory;
