import validatorFactory from 'feature/registration/reducer/validate';

let validate: ReturnType<typeof validatorFactory>;

self.addEventListener('message', (e) => {
  validate =
    validate ??
    validatorFactory((task) => {
      try {
        task();
      } catch (error) {
        self.postMessage(error);
      }
    });
  validate(e?.data);
});

export {};
