import type { UseRegistration } from 'feature/registration';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useState,
} from 'react';

const useRegistration: UseRegistration = function useRegistration({
  userFactory,
  save,
  reducer,
  getInitialState,
  registerSecondaryTask,
  ...rest
}) {
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
      >['payload'],
    ) => dispatch({ type: 'CHANGE', payload }),
    [],
  );
  const onSubmit = useCallback(() => dispatch({ type: 'SUBMIT' }), []);
  const user = useMemo(userFactory, [userFactory]);
  useEffect(() => {
    if (!validating) {
      return;
    }
    const entry = Object.fromEntries(
      Object.entries(validating).filter(([, value]) => value !== null),
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
      .catch((err) =>
        dispatchTask({ type: 'VALIDATE', error: err, validated: validating }),
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
      .catch((err) => {
        dispatch({ type: 'ERROR', error: err });
        setErrorInstance(err);
      });
  }, [save, submitting]);
  const { loadCountries } = user.validator;
  const [countries, setCountries] = useState<
    Awaited<ReturnType<typeof loadCountries>>
  >({});
  useLayoutEffect(() => {
    loadCountries().then((newCountries) =>
      registerSecondaryTask(() => setCountries(newCountries)),
    );
  }, [loadCountries, registerSecondaryTask]);
  return {
    onChange,
    onSubmit,
    ...display,
    error: error ? errorInstance : void 0,
    user,
    countries,
    ...rest,
  };
};

export default useRegistration;
