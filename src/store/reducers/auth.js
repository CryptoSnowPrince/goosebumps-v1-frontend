import { getType } from 'typesafe-actions';
import * as actions from '../actions';
import { initEntityState, entityLoadingStarted, entityLoadingSucceeded, entityLoadingFailed } from '../utils';

export const defaultState = {
  provider: null,
  account: ''
};

const states = (state = defaultState, action) => {
  switch (action.type) {

    case getType(actions.setProvider):
      return { ...state, provider: action.payload };
    case getType(actions.setAccount):
      return { ...state, account: action.payload };
    default:
      return state;
  }
};

export default states;
