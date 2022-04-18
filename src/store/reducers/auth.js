import { getType } from 'typesafe-actions';
import * as actions from '../actions';

export const defaultState = {
  provider: null,
  account: ''
};

const states = (state = defaultState, action) => {
  console.log("action payload: ", action.payload);
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
