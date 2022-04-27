import { getType } from 'typesafe-actions';
import * as actions from '../actions';

export const defaultState = {
  index: 0
};

const states = (state = defaultState, action) => {
  switch (action.type) {
    case getType(actions.setChainIndex):
      return { ...state, index: action.payload };
    case getType(actions.setChainIndexInit):
      return defaultState;
    default:
      return state;
  }
};

export default states;
