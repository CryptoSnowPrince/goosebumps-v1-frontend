//import { useEthers } from '@usedapp/core'
import React, {useCallback} from 'react';
import { useSelector } from 'react-redux';
import * as selector from '../../store/selectors';
import * as connectWallet from './connectWallet';

const ConnectButtonModal = () => {
    const account = useSelector(selector.accountState);

    const disconnect = useCallback(async function () {
        connectWallet.Disconnect()
    }, []);

    const connect = useCallback(async function () {
        connectWallet.Connect()
    }, []);


    if (account) {
        return (<button className="default-btn w-100" onClick={disconnect}>{account.substring(0, 8)}... (Disconnect)</button>);
    }

    return (<button className="default-btn w-100" onClick={connect}>Connect Wallet</button>);
}

export { ConnectButtonModal }
