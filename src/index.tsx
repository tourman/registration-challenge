import User from 'entity/user/user';
import UserValidator from 'entity/user/validator';
import Registration from 'feature/registration';
import RegistrationView from 'feature/registration/component/Registration';
import immerReducerFactory, {
  getInitialState,
} from 'feature/registration/reducer';
import validatorFactory from 'feature/registration/reducer/validate';
import useRegistration from 'feature/registration/useRegistration';
import React from 'react';
import ReactDOM from 'react-dom/client';
import GlobalStyles from 'styles/global';
import ExternalUtilTime from 'util/time';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App>
      {() => (
        <>
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
                            setTimeout(() => resolve(json), 1000)
                          )
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
                      ),
                  ExternalUtilTime
                )
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
                }, 1000)
              );
              // eslint-disable-next-line no-console
              console.log('Saved result', result);
            }}
            reducer={immerReducerFactory(
              validatorFactory((task) => requestIdleCallback(task))
            )}
            getInitialState={getInitialState}
            T={(string) => string}
            useRegistration={useRegistration}
            Component={RegistrationView}
          />
        </>
      )}
    </App>
    <GlobalStyles />
  </React.StrictMode>
);
