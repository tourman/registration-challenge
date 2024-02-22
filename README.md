# Registration Challenge

- [x] The app is built using [CRA](https://create-react-app.dev/) and [CRACO](https://craco.js.org/), incorporating ESLint and Prettier for code formatting, as well as a Docker environment for smooth and flexible development.
- [x] TS is used for [DIP](https://en.wikipedia.org/wiki/Dependency_inversion_principle).
- [x] Hooks are employed, including for state management within the application.
- [x] The codebase follows the architectural and design principles of [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html), providing flexibility to meet various business requirements.
- [x] Additionally, some performance techniques and patterns are applied to enhance the overall efficiency and responsiveness of the application.
- [ ] The sky's the limit, so it can be improved continuously.
- [x] Users can input their personal data and save it within the application.
- [x] Previously entered data can be accessed via the `/revisited` endpoint.
- [x] Routing is currently implemented within the [main component](https://www.oreilly.com/library/view/clean-architecture-a/9780134494272/ch26.xhtml) (see [index.tsx](./src/index.tsx)) as a temporary solution. This could be improved by moving it to a separate routing component/feature for better organization and maintainability.
- [x] Data is stored in Local Storage using the storage emulator, with occasional network errors simulated at a probability of 1/3.
- [x] Data manipulation operations utilize asynchronous functions.
- [x] Microinteractions are implemented to enhance the user experience during data management.
- [x] Internationalization (i18n) is supported through a translation function, currently only available in English.
- [ ] Additional languages would require the development of a separate feature, such as a Language.
- [ ] To reuse greetings within the list of existing users, a separate feature (e.g., Greeting) needs to be developed, or the greeting component can be extracted from the Registration feature.
- [ ] Code generation capabilities to be integrated alongside GraphQL functionality.

The app is available here: https://tourman.github.io/registration-challenge.
