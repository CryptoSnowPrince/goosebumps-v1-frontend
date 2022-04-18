import { combineReducers } from 'redux';
import authReducer from './auth';
import chainReducer from './selChain'

export const rootReducer = combineReducers({
  auth: authReducer,
  chain: chainReducer
});

const reducers = (state, action) => rootReducer(state, action);

export default reducers;
