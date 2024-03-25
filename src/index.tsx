import User from 'entity/user';
import UserValidator from 'entity/user/validator';
import validatorFactory from 'feature/registration/reducer/validate';
import { mapValues, memoize } from 'lodash-es';
import { startTransition, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import storageFactory from 'util/storageEmulator';
import ExternalUtilTime from 'util/time';
import withLoading from 'util/withLoading';
import App from './App';
import 'semantic-ui-css/semantic.css';
import {
  Dropdown,
  Form,
  Input,
  Button,
  Grid,
  Message,
  Divider,
  Popup,
  Container,
  Dimmer,
  Loader,
  Table,
} from 'semantic-ui-react';
import type * as RegistrationTypes from 'feature/registration';
import type * as ListTypes from 'feature/list';

const root = createRoot(document.getElementById('root') as HTMLElement);

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
const loadCountries = memoize(() =>
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
        const RegistrationViewSUIR = await import(
          'feature/registration/component/Registration'
        ).then(def);
        const RegistrationView: RegistrationTypes.View =
          function RegistrationView(props) {
            return (
              <RegistrationViewSUIR
                {...props}
                {...{
                  Dropdown,
                  Form,
                  Input,
                  Button,
                  Grid,
                  Message,
                  Divider,
                  Popup,
                  Container,
                }}
              />
            );
          };
        return RegistrationView;
      },
      T: factories.T.en,
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
        const ListViewSUIR = await import('feature/list/component/List').then(
          def,
        );
        const ListView: ListTypes.View = function ListView(props) {
          return (
            <ListViewSUIR
              {...props}
              {...{
                Dimmer,
                Loader,
                Message,
                Table,
              }}
            />
          );
        };
        return ListView;
      },
      T: factories.T.en,
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

root.render(
  <StrictMode>
    <App>
      <BrowserRouter basename={basename}>
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
                <List
                  loadList={storage.load}
                  loadCountries={loadCountries}
                  Time={ExternalUtilTime}
                />
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
                <Registration
                  userFactory={() =>
                    new User(new UserValidator(loadCountries, ExternalUtilTime))
                  }
                  save={storage.save}
                  registerSecondaryTask={(task) =>
                    startTransition(() => task())
                  }
                />
              </>
            }
          />
        </Routes>
      </BrowserRouter>
    </App>
  </StrictMode>,
);
