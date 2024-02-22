import { UseRegistration } from './types';
import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';

const useRegistration: UseRegistration = function useRegistration({
  userFactory,
  save,
  reducer,
  getInitialState,
  ...rest
}) {
  const { registerSecondaryTask } = rest;
  const [
    {
      display: { error, ...display },
      validating,
      submitting,
    },
    dispatch,
  ] = useReducer(reducer, null, getInitialState);
  const onChange = useCallback(
    (
      payload: Extract<
        Parameters<typeof dispatch>[0],
        { type: 'CHANGE' }
      >['payload']
    ) => dispatch({ type: 'CHANGE', payload }),
    []
  );
  const onSubmit = useCallback(() => dispatch({ type: 'SUBMIT' }), []);
  const user = useMemo(userFactory, [userFactory]);
  useEffect(() => {
    if (!validating) {
      return;
    }
    const entry = Object.fromEntries(
      Object.entries(validating).filter(([, value]) => value !== null)
    ) as {
      [K in keyof typeof validating]: NonNullable<(typeof validating)[K]>;
    };
    const dispatchTask = (...args: Parameters<typeof dispatch>) =>
      registerSecondaryTask(() => dispatch(...args));
    user.set(entry);
    // todo: discard update after unmount
    user
      .validate()
      .then(() => dispatchTask({ type: 'VALIDATE', validated: validating }))
      .catch((error) =>
        dispatchTask({ type: 'VALIDATE', error, validated: validating })
      );
  }, [user, validating, registerSecondaryTask]);
  const [errorInstance, setErrorInstance] = useState<Error | undefined>();
  useEffect(() => {
    if (!submitting) {
      return;
    }
    // todo: discard after unmount
    save(submitting)
      .then(() => dispatch({ type: 'DONE' }))
      .catch((error) => {
        dispatch({ type: 'ERROR', error });
        setErrorInstance(error);
      });
  }, [save, submitting]);
  return {
    onChange,
    onSubmit,
    ...display,
    error: error ? errorInstance : void 0,
    user,
    ...rest,
  };
};

export default useRegistration;
