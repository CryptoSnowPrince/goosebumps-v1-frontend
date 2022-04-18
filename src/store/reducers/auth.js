import { getType } from 'typesafe-actions';
import * as actions from '../actions';

export const defaultState = {
  provider: null,
  web3Provider: null,
  signer: null,
  account: '',
  chainId: 0
};

const states = (state = defaultState, action) => {
  switch (action.type) {
    case getType(actions.setProvider):
      return { ...state, provider: action.payload };
    case getType(actions.setWeb3Provider):
      return { ...state, web3Provider: action.payload };
    case getType(actions.setSigner):
      return { ...state, signer: action.payload };
    case getType(actions.setAccount):
      return { ...state, account: action.payload };
    case getType(actions.setChainId):
      return { ...state, chainId: action.payload };
    case getType(actions.setInit):
      return defaultState;
    default:
      return state;
  }
};

export default states;
