import invariant from 'invariant';
import { memoize } from 'lodash-es';
import { useEffect, useLayoutEffect, useState } from 'react';

function getDisplayName(name) {
  return `withLoading(${name ?? '...'})`;
}

const setAll = (setters) => (results) => {
  invariant(setters.length === results.length, 'Lengths are different');
  setters.forEach((setter, index) => setter(() => results[index]));
};

function withLoading(componentFactory, { factories, Load, Error }) {
  const all = memoize(() =>
    Promise.all([
      componentFactory(),
      Promise.all(
        Object.entries(factories).map(([key, factory]) =>
          factory().then((module) => [key, module]),
        ),
      ).then(Object.fromEntries),
    ]),
  );
  function WithLoading(props) {
    const [Component, setComponent] = useState();
    const [deps, setDeps] = useState();
    const [error, setError] = useState();
    useLayoutEffect(
      function load() {
        if (error) {
          return;
        }
        all()
          .then(setAll([setComponent, setDeps]))
          .catch(setError);
      },
      [error],
    );
    useEffect(
      function setComponentName() {
        if (!Component) {
          return;
        }
        WithLoading.displayName = getDisplayName(
          Component.displayName || Component.name,
        );
      },
      [Component],
    );
    if (error) {
      return <Error error={error} />;
    }
    if (Component && deps) {
      return <Component {...{ ...props, ...deps }} />;
    }
    return <Load />;
  }
  WithLoading.displayName = getDisplayName();
  return WithLoading;
}

export default withLoading;
