import immer from 'feature/registration/reducer/reducer/immer';
import combined from 'feature/registration/reducer/reducer/combined';
import importedCases from './cases';
import type { Action, State } from 'feature/registration';
import validatorFactory from 'feature/registration/reducer/validate';

export interface Case {
  prop?: Extract<keyof jest.Describe, 'only' | 'skip'>;
  description?: string;
  should: string;
  state: State;
  expected: State;
  action: Action;
}

const cases: Case[] = importedCases;

const reducers = {
  immer: immer(validatorFactory((task) => task())),
  combined: combined(validatorFactory((task) => task())),
};

describe('registration', () => {
  describe('reducer', () => {
    describe.each(
      Object.entries(reducers).map(([name, reducer]) => ({ name, reducer })),
    )('$name', ({ reducer }) => {
      describe.each(cases)(
        '$description',
        ({ prop, should, state, expected, action }) => {
          (prop ? describe[prop] : describe)('case', () => {
            it(`should ${should}`, () => {
              const result = reducer(state, action);
              expect(result).toStrictEqual(expected);
            });
            it('should not mutate state', () => {
              const clone = JSON.parse(JSON.stringify(state));
              reducer(state, action);
              expect(state).toStrictEqual(clone);
            });
          });
        },
      );
    });
  });
});
