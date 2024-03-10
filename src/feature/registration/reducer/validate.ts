import { keys } from 'entity/user';
import type { State, StateValidator } from 'feature/registration';
import invariant from 'invariant';

interface Validator {
  (state: State): void;
}

const allowSubmit: Validator = ({ display, validating, submitting }) => {
  const noErrors = !keys
    .map((key) => display[key].error)
    .filter((error) => error).length;
  const allFilled = !keys
    .map((key) => display[key].value)
    .filter((value) => value === '').length;
  invariant(
    display.allowSubmit ===
      (noErrors && allFilled && !validating && !submitting),
    'allowSubmit is violated %s',
    JSON.stringify({
      'display.allowSubmit': display.allowSubmit,
      noErrors,
      validating,
      submitting,
    }),
  );
};

const checkSubmitting: Validator = ({ submitting, display }) => {
  invariant(!!submitting === display.submitting, 'Submitting is violated');
};

const noErrorWhileSubmitting: Validator = ({
  submitting,
  display: { error },
}) => {
  if (submitting && error) {
    throw new Error('No error allowed while submitting');
  }
};

const checkDone: Validator = ({ display, validating }) => {
  const { done, error, submitting } = display;
  if (done) {
    invariant(
      !keys.filter((key) => display[key].value !== '').length,
      'All values must be nullish when done',
    );
    invariant(
      !keys.filter((key) => display[key].error !== null).length,
      'All errors must be reset when done',
    );
    invariant(!error, 'No error expected when done');
    invariant(!submitting, 'No submitting expected when done');
    invariant(!validating, 'No validation expected when done');
  }
  if (keys.filter((key) => display[key].value !== '').length) {
    invariant(!done, 'Done value must be reset once form has changed');
  }
  if (error) {
    invariant(!done, 'No done expected when error');
  }
};

const fullStringError: Validator = ({ display }) => {
  for (const key of keys) {
    if (display[key].value === '') {
      invariant(
        display[key].error !== 'FULL_STRING',
        'FULL_STRING error should be ignore due to better user experience',
      );
    }
  }
};

const validatorFactory: (
  registerTask: (task: () => void) => void,
) => StateValidator = (registerTask) => (state) => {
  [
    allowSubmit,
    checkSubmitting,
    noErrorWhileSubmitting,
    checkDone,
    fullStringError,
  ].forEach((innerValidator) => registerTask(() => innerValidator(state)));
};

export default validatorFactory;
