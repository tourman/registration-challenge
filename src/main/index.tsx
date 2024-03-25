import User from 'entity/user';
import UserValidator from 'entity/user/validator';
import languageFactory from 'feature/language';
import validatorFactory from 'feature/registration/reducer/validate';
import { fromPairs, mapValues, memoize, noop } from 'lodash-es';
import {
  ReactElement,
  StrictMode,
  startTransition,
  lazy,
  Suspense,
} from 'react';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import storageFactory from 'util/storageEmulator';
import ExternalUtilTime from 'util/time';
import withLoading from 'util/withLoading';
import App from 'App';
import switchFactory from 'feature/language/component/Button';
import 'semantic-ui-css/semantic.css';
import {
  Button,
  Message,
  Divider,
  Dimmer,
  Loader,
  Icon,
} from 'semantic-ui-react';
import type * as RegistrationTypes from 'feature/registration';
import type * as ListTypes from 'feature/list';
import type * as LanguageTypes from 'feature/language';
import { PropsFrom } from 'util/type';
import invariant from 'invariant';

const def = <M,>(module: { default: M }): M => {
  return module.default;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const pick =
  <K extends string>(key: K): (<M>(module: { [Y in K]: M }) => M) =>
  ({ [key]: module }) =>
    module;

const wait =
  (delay: number): (<T>(payload: T) => Promise<T>) =>
  (payload) =>
    new Promise((resolve) => setTimeout(() => resolve(payload), delay));

// See https://restcountries.com/
const _loadCountries = memoize(() =>
  fetch('https://restcountries.com/v3.1/all?fields=name,cca2')
    .then((data) => data.json())
    .then(wait(1000))
    .then((countries) => {
      interface Country {
        cca2: string;
        name: { common: string };
      }
      return countries as Country[];
    })
    .then((countries) =>
      Object.fromEntries(
        countries.map(({ cca2, name: { common } }) => [
          cca2.toLowerCase(),
          common,
        ]),
      ),
    ),
);

const getClient = memoize(async () => {
  const { ApolloClient, InMemoryCache, gql } = await import('@apollo/client');
  return new ApolloClient({
    cache: new InMemoryCache(),
    uri: 'https://countries.trevorblades.com',
  });
});

interface RawCountries {
  countries: { native: string; code: string }[];
}

function areCountries(data: any): data is RawCountries {
  const countries = data?.countries;
  return (
    Array.isArray(countries) &&
    countries.every(
      (country) =>
        typeof country === 'object' &&
        country &&
        ['native', 'code'].every((key) => typeof country[key] === 'string'),
    )
  );
}

// https://github.com/trevorblades/countries?tab=readme-ov-file
const loadCountries = async () => {
  const { gql } = await import('@apollo/client');
  const client = await getClient();
  const query = gql`
    {
      countries {
        native
        code
      }
    }
  `;
  const { data } = await client.query({ query });
  invariant(areCountries(data), 'Unknown result: ' + JSON.stringify(data));
  const result = fromPairs(
    data.countries.map(({ native, code }) => [code, native]),
  );
  return result;
};

const factories = {
  T: mapValues(
    {
      en: () => import('util/translation/en'),
      pt: () => import('util/translation/pt'),
    },
    (load) => () =>
      load()
        .then(def)
        .then((translationFactory) => translationFactory(ExternalUtilTime)),
  ),
};

const Error: Parameters<typeof withLoading>[1]['Error'] = function Error({
  error,
}) {
  return <Message error content={error?.toString() ?? 'Unknown error'} />;
};

const Load: Parameters<typeof withLoading>[1]['Load'] = function Load() {
  return (
    <Dimmer active inverted>
      <Loader />
    </Dimmer>
  );
};

const Registration = withLoading(
  async () => {
    loadCountries();
    const [factory, useRegistration] = await Promise.all([
      import('feature/registration').then(def).then(wait(2000)),
      import('feature/registration/useRegistration').then(def),
    ]);
    return factory({ useRegistration });
  },
  {
    factories: {
      getInitialState: () =>
        import('feature/registration/reducer/getInitialState').then(def),
      reducer: async () => {
        const immerReducerFactory = await import(
          'feature/registration/reducer/reducer/immer'
        ).then(def);
        return immerReducerFactory(
          // todo: replace with the scheduler API
          validatorFactory(
            (() => {
              type Task = Parameters<typeof requestIdleCallback>[0];
              const tasks: Task[] = [];
              let working = false;
              function handle(...args: Parameters<Task>) {
                const task = tasks.shift();
                if (!task) {
                  working = false;
                  return;
                } else {
                  task(...args);
                  requestIdleCallback(handle);
                }
              }
              return (task: Task) => {
                tasks.push(task);
                if (!working) {
                  working = true;
                  requestIdleCallback(handle);
                }
              };
            })(),
          ),
        );
      },
      Component: async () => {
        const [RegistrationViewSUIR, UIComponents] = await Promise.all([
          import('feature/registration/component/Registration').then(def),
          import('./registration'),
        ]);
        type P = PropsFrom<typeof RegistrationViewSUIR>['Popup'];
        const LazyPopup = lazy<P>(() =>
          import('./Popup').catch(() => ({
            default: ({ trigger }) => <>{trigger}</>,
          })),
        );
        const Popup: P = function Popup(props) {
          const { trigger } = props;
          return (
            <Suspense fallback={trigger}>
              <LazyPopup {...props} />
            </Suspense>
          );
        };
        const RegistrationView: RegistrationTypes.View =
          function RegistrationView(props) {
            return (
              <RegistrationViewSUIR
                {...props}
                {...UIComponents}
                Popup={Popup}
              />
            );
          };
        return RegistrationView;
      },
    },
    Error,
    Load,
  },
);

const List = withLoading(
  async () => {
    const [factory, useList] = await Promise.all([
      import('feature/list').then(def),
      import('feature/list/useList').then(def),
    ]);
    return factory({ useList });
  },
  {
    factories: {
      Component: async () => {
        const [ListViewSUIR, UIComponents] = await Promise.all([
          import('feature/list/component/List').then(def),
          import('./list'),
        ]);
        const ListView: ListTypes.View = function ListView(props) {
          return <ListViewSUIR {...props} {...UIComponents} />;
        };
        return ListView;
      },
    },
    Error,
    Load,
  },
);

const storage = storageFactory('list');

const routes = {
  revisited: 'revisited',
  root: '/',
} as const;

const basename = window.location.pathname
  .replace(/\/$/, '')
  .replace(new RegExp(`(${Object.values(routes).join('|')})$`), '');

function artificialT<M>(factory: () => Promise<M>): () => Promise<M> {
  return () => factory().then(wait(1000));
}

const Language = languageFactory({
  en: artificialT(factories.T.en),
  pt: artificialT(factories.T.pt),
});

const SwitchSUIR = switchFactory<keyof typeof factories.T>();

const Switch: LanguageTypes.View<keyof typeof factories.T> = function Switch(
  props,
) {
  return <SwitchSUIR {...props} {...{ Button, Icon }} />;
};

function from<T>(p: Promise<T>) {
  return {
    subscribe(subscription: {
      next: (value: T) => void;
      error: (error: unknown) => void;
      finally: () => void;
    }): () => void {
      let s = subscription;
      p.then(
        (result) => s.next(result),
        (error) => s.error(error),
      ).finally(() => s.finally());
      return () => {
        s = { next: noop, error: noop, finally: noop };
      };
    },
  };
}

function isNotEmpty<T>(value: T): value is NonNullable<T> {
  return typeof value !== 'undefined' && value !== null;
}

function WaitFor<T>(props: {
  subject: T;
  children: (subject: NonNullable<T>) => ReactElement;
}): ReactElement {
  const { subject, children } = props;
  if (!isNotEmpty(subject)) {
    return <Load />;
  }
  return children(subject);
}

function main(render: (content: ReactElement) => void): void {
  render(
    <StrictMode>
      <App>
        <Language defaultLang="en" Component={Switch} from={from}>
          {({ renderSwitch, T }) => (
            <BrowserRouter basename={basename}>
              {renderSwitch()}
              <Routes>
                <Route
                  path={routes.revisited}
                  element={
                    <>
                      <Link to={routes.root}>
                        <Button
                          labelPosition="left"
                          icon="arrow left"
                          content="Back to form"
                        />
                      </Link>
                      <WaitFor subject={T}>
                        {(notEmptyT) => (
                          <List
                            loadList={storage.load}
                            loadCountries={loadCountries}
                            Time={ExternalUtilTime}
                            T={notEmptyT}
                          />
                        )}
                      </WaitFor>
                    </>
                  }
                />
                <Route
                  path="*"
                  element={
                    <>
                      <Link to={routes.revisited} relative="route">
                        <Button
                          labelPosition="right"
                          icon="arrow right"
                          content="See all users"
                        />
                      </Link>
                      <Divider hidden />
                      <WaitFor subject={T}>
                        {(notEmptyT) => (
                          <Registration
                            userFactory={() =>
                              new User(
                                new UserValidator(
                                  loadCountries,
                                  ExternalUtilTime,
                                ),
                              )
                            }
                            save={storage.save}
                            registerSecondaryTask={(task) =>
                              startTransition(() => task())
                            }
                            T={notEmptyT}
                          />
                        )}
                      </WaitFor>
                    </>
                  }
                />
              </Routes>
            </BrowserRouter>
          )}
        </Language>
      </App>
    </StrictMode>,
  );
}

export default main;
