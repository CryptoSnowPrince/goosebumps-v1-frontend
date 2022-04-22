import { getType } from 'typesafe-actions';
import * as actions from '../actions';

const chainInfo ={
  index: 2,
  network: "bsc",
  chainId: 56,
  chainHexId: "0x38"
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
