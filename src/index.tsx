import User from 'entity/user';
import UserValidator from 'entity/user/validator';
import registrationFactory from 'feature/registration';
import RegistrationViewSUIR from 'feature/registration/component/Registration';
import immerReducerFactory from 'feature/registration/reducer/reducer/immer';
import getInitialState from 'feature/registration/reducer/getInitialState';
import validatorFactory from 'feature/registration/reducer/validate';
import useRegistration from 'feature/registration/useRegistration';
import { startTransition, StrictMode, ComponentType } from 'react';
import { createRoot } from 'react-dom/client';
import ExternalUtilTime from 'util/time';
import translationFactory from 'util/translation';
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
} from 'semantic-ui-react';

const root = createRoot(document.getElementById('root') as HTMLElement);

const Registration = registrationFactory({ useRegistration });

type PropsFrom<C> = C extends ComponentType<infer P> ? P : never;

const RegistrationView: PropsFrom<typeof Registration>['Component'] =
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

root.render(
  <StrictMode>
    <App>
      <Registration
        userFactory={() =>
          new User(
            new UserValidator(
              // See https://restcountries.com/
              () =>
                fetch('https://restcountries.com/v3.1/all?fields=name,cca2')
                  .then((data) => data.json())
                  .then(
                    (json) =>
                      new Promise((resolve) =>
                        setTimeout(() => resolve(json), 1000),
                      ),
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
                      ]),
                    ),
                  ),
              ExternalUtilTime,
            ),
          )
        }
        save={async function emulateSave(result) {
          await new Promise<void>((resolve, reject) =>
            setTimeout(() => {
              if (Math.random() < 1 / 3) {
                reject(new Error('Unable to save'));
              } else {
                resolve();
              }
            }, 1000),
          );
          // eslint-disable-next-line no-console
          console.log('Saved result', result);
        }}
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
            })(),
          ),
        )}
        getInitialState={getInitialState}
        T={translationFactory(ExternalUtilTime)}
        Component={RegistrationView}
        registerSecondaryTask={(task) => startTransition(() => task())}
      />
    </App>
  </StrictMode>,
);
