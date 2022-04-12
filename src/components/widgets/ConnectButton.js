//import { useEthers } from '@usedapp/core'
import { useCallback, useEffect } from 'react';
import { Mainnet, DAppProvider, useEtherBalance, useEthers, Config } from '@usedapp/core'


const ConnectButton = () => {
    const { activateBrowserWallet, account, deactivate } = useEthers();

    const connect = useCallback(async () => {
        try {
            activateBrowserWallet();
        } catch (error) {
            console.log(error)
        }
    }, [activateBrowserWallet]);

    const disconnect = async () => {
        try {
            deactivate();
        } catch (error) {
            console.log(error)
        }
    }

    if (account) {
        return (<button className="default-btn" onClick={disconnect}>{account.substring(0, 8)}... (Disconnect)</button>);
    }

    return (<button className="default-btn" onClick={(connect)}>Connect Wallet</button>);
}

export { ConnectButton }
