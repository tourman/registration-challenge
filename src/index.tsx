import User from 'entity/user/user';
import UserValidator from 'entity/user/validator';
import List from 'feature/list';
import ListView from 'feature/list/List';
import useList from 'feature/list/useList';
import Registration from 'feature/registration';
import RegistrationView from 'feature/registration/component/Registration';
import immerReducerFactory, {
  getInitialState,
} from 'feature/registration/reducer';
import validatorFactory from 'feature/registration/reducer/validate';
import useRegistration from 'feature/registration/useRegistration';
import React, { ComponentType, startTransition } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { Button, Container, Divider, Label } from 'semantic-ui-react';
import GlobalStyles from 'styles/global';
import storageFactory from 'util/storageEmulator';
import ExternalUtilTime from 'util/time';
import translationFactory from 'util/translation';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// See https://restcountries.com/
const loadCountries = () =>
  fetch('https://restcountries.com/v3.1/all?fields=name,cca2')
    .then((data) => data.json())
    .then(
      (json) => new Promise((resolve) => setTimeout(() => resolve(json), 1000))
    )
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
        ])
      )
    );

const T = translationFactory(ExternalUtilTime);

const storage = storageFactory('list');

root.render(
  <React.StrictMode>
    <App>
      {() => (
        <BrowserRouter>
          <Routes>
            <Route
              path="revisited"
              element={
                <>
                  <Link to="/">
                    <Button
                      labelPosition="left"
                      icon="arrow left"
                      content="Back to form"
                    />
                  </Link>
                  <List
                    loadList={storage.load}
                    loadCountries={loadCountries}
                    T={T}
                    Time={ExternalUtilTime}
                    Component={ListView}
                    useList={useList}
                  />
                </>
              }
            />
            <Route
              path="*"
              element={
                <>
                  <Link to="/revisited">
                    <Button
                      labelPosition="right"
                      icon="arrow right"
                      content="See all users"
                    />
                  </Link>
                  <Divider hidden />
                  <Registration
                    userFactory={() =>
                      new User(
                        new UserValidator(loadCountries, ExternalUtilTime)
                      )
                    }
                    save={storage.save}
                    reducer={immerReducerFactory(
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
                        })()
                      )
                    )}
                    getInitialState={getInitialState}
                    T={T}
                    useRegistration={useRegistration}
                    Component={RegistrationView}
                    registerSecondaryTask={(task) =>
                      startTransition(() => task())
                    }
                  />
                </>
              }
            />
          </Routes>
        </BrowserRouter>
      )}
    </App>
    <GlobalStyles />
  </React.StrictMode>
);
