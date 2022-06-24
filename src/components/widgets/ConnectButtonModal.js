//import { useEthers } from '@usedapp/core'
import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { accountState } from '../../store/selectors';
import { Connect, Disconnect } from './connectWallet';

const ConnectButtonModal = () => {
    const account = useSelector(accountState);

    const disconnect = useCallback(async function () {
        Disconnect()
    }, []);

    const connect = useCallback(async function () {
        Connect()
    }, []);


    if (account) {
        return (<button className="default-btn w-100" onClick={disconnect}>{account.substring(0, 8)}... (Disconnect)</button>);
    }

    return (<button className="default-btn w-100" onClick={connect}>Connect Wallet</button>);
}

export { ConnectButtonModal }
