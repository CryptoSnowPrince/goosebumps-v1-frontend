import { combineReducers } from 'redux';
import authReducer from './auth';
import selChainReducer from './selChain'

export const rootReducer = combineReducers({
  auth: authReducer,
  selChain: selChainReducer
});

const reducers = (state, action) => rootReducer(state, action);

export default reducers;
