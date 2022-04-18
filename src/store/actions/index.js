import { 
    createAction as action, 
    createAsyncAction as asyncAction 
} from 'typesafe-actions';

export const setProvider = action('auth/SET_PROVIDER')();
export const setAccount = action('auth/SET_ACCOUNT')();
