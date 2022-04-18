import { getType } from 'typesafe-actions';
import * as actions from '../actions';

export const defaultState = {
  chain: 97
};

const states = (state = defaultState, action) => {
  switch (action.type) {
    case getType(actions.setSelChain):
      return { ...state, chain: action.payload };
    case getType(actions.setSelChainInit):
      return defaultState;
    default:
      return state;
  }
};

export default states;
