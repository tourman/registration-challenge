import type { Key, ValidationType } from 'entity/user';
import { keys } from 'entity/user';
import type { Action, State } from 'feature/registration';
import { produce } from 'immer';

const immerReducerFactory =
  (validate: (state: State) => void) =>
  (state: State, action: Action): State => {
    validate(state);
    const { type } = action;
    let result: State = state;
    function setAllowSubmit() {
      const noErrors = !keys
        .map((key) => result.display[key].error)
        .filter((error) => error).length;
      const allFilled = !keys
        .map((key) => result.display[key].value)
        .filter((value) => value === '').length;
      const allowSubmit =
        noErrors && allFilled && !result.submitting && !result.validating;
      if (result.display.allowSubmit !== allowSubmit) {
        result = { ...result };
        result.display = { ...result.display, allowSubmit };
      }
    }
    // todo: move the new changes to the new reducer instance
    if (type === 'CHANGE') {
      (() => {
        if (state.submitting) {
          return;
        }
        const { payload } = action;
        let toValidate = false;
        let replaced = false;
        for (const key of keys) {
          const value = payload[key];
          const field = result.display[key];
          if (typeof value !== 'undefined' && field.value !== value) {
            toValidate = true;
            if (!replaced) {
              replaced = true;
              result = { ...result };
              result.display = { ...result.display };
            }
            result.display[key] = { ...field, value };
          }
        }
        if (toValidate) {
          const validating = {} as NonNullable<typeof state.validating>;
          for (const key of keys) {
            validating[key] = result.display[key].value;
          }
          result = { ...result, validating };
        }
        if (result.display.done !== null) {
          if (!replaced) {
            result = { ...result };
          }
          result.display = { ...result.display, done: null };
        }
      })();
    } else if (type === 'VALIDATE') {
      (() => {
        const { validated, error } = action;
        if (validated !== state.validating) {
          return;
        }
        const errorList = error?.errors ?? [];
        const errors = errorList.reduce((acc, { key, reason }) => {
          acc[key] = typeof reason === 'string' ? reason : reason.message;
          return acc;
        }, {} as Record<Key, ValidationType>);
        let replaced = false;
        function replace() {
          if (replaced) return;
          replaced = true;
          result = { ...result };
          result.display = { ...result.display };
        }
        for (const key of keys) {
          const reason = errors[key] ?? null;
          if (reason === 'FULL_STRING') {
            if (result.display[key].error !== null) {
              replace();
              result.display[key] = { ...result.display[key], error: null };
            }
          } else if (reason !== state.display[key].error) {
            if (result.display[key].error !== reason) {
              replace();
              result.display[key] = { ...result.display[key], error: reason };
            }
          }
        }
        if (result.validating !== null) {
          replace();
          result = { ...result, validating: null };
        }
      })();
    } else {
      result = produce(state, (draft) => {
        function setSubmitting() {
          draft.display.submitting = !!draft.submitting;
        }
        switch (type) {
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
        }
        setSubmitting();
      });
    }
    setAllowSubmit();

    validate(result);
    return result;
  };

export default immerReducerFactory;
