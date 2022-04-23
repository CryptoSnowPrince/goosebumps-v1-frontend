import { getType } from 'typesafe-actions';
import * as actions from '../actions';

const chainInfo ={
  index: 0,
  network: "ethereum",
  chainId: 1,
  chainHexId: "0x1"
}

export const defaultState = {
  chain: chainInfo
};

const states = (state = defaultState, action) => {
  switch (action.type) {
    case getType(actions.setChain):
      return { ...state, chain: action.payload };
    case getType(actions.setChainInit):
      return defaultState;
    default:
      return state;
  }
};

export default states;
