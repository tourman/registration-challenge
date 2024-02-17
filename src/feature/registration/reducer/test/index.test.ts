import reducerFactory from 'feature/registration/reducer/immerReducer';
import importedCases from './cases';
import { Action, State } from 'feature/registration/types';
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

const reducer = reducerFactory(validatorFactory((task) => task()));

describe('registration', () => {
  describe('reducer', () => {
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
      }
    );
  });
});
