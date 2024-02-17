import { GetInitialState, ReducerFactory } from 'feature/registration/types';
import immerReducerFactory from './immerReducer';
import getInitialStateSimple from './getInitialState';

const reducerFactory: ReducerFactory = immerReducerFactory;
export const getInitialState: GetInitialState = getInitialStateSimple;

export default reducerFactory;
