import { 
    createAction as action,
    // createAsyncAction as asyncAction 
} from 'typesafe-actions';

// Wallet connect
export const setProvider = action('auth/SET_PROVIDER')();
export const setAccount = action('auth/SET_ACCOUNT')();
export const setWeb3Provider = action('auth/SET_WEB3PROVIDER')();
export const setSigner = action('auth/SET_SIGNER')();
export const setChainId = action('auth/SET_CHAINID')();
export const setInit = action('auth/SET_INIT')();

// Select chain
export const setChainIndex = action('selChain/SET_CHAININDEX')();
export const setChainIndexInit = action('selChain/SET_INIT')();
