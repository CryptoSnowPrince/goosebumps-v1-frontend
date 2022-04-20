//import { useEthers } from '@usedapp/core'
import React, { useCallback, useEffect, useReducer } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Mainnet, DAppProvider, useEtherBalance, useEthers, Config } from '@usedapp/core'
import Web3Modal from "web3modal";
import { providers/*, ethers*/ } from "ethers";
import WalletConnectProvider from "@walletconnect/web3-provider";
import config from '../../constants/config'
import linq from "linq";
import networks from "../../networks";
import * as selector from '../../store/selectors';
import * as action from '../../store/actions';

const network = linq.from(networks).where(x => x.Name === "bsctestnet").single();
let web3Modal;
if (typeof window !== "undefined") {
    web3Modal = new Web3Modal({
        network: "mainnet", // optional
        cacheProvider: true,
        providerOptions: {
            walletconnect: {
                package: WalletConnectProvider,
                options: {
                    infuraId: config.INFURA_ID, // required
                    rpc: {
                        1: "https://mainnet.infura.io/v3/687f55defdfe416faa0b388c1332727c", // Ethereum mainnet
                        3: "https://ropsten.infura.io/v3/687f55defdfe416faa0b388c1332727c", // Ropsten testnet
                        4: "https://rinkeby.infura.io/v3/687f55defdfe416faa0b388c1332727c", // Rinkeby testnet
                        56: "https://speedy-nodes-nyc.moralis.io/03eb35954a0b7ed092444a8e/bsc/mainnet", // BSC mainnet
                        97: "https://speedy-nodes-nyc.moralis.io/03eb35954a0b7ed092444a8e/bsc/testnet", // BSC testnet
                        137: "https://speedy-nodes-nyc.moralis.io/03eb35954a0b7ed092444a8e/polygon/mainnet", // Polygon mainnet
                        80001: "https://speedy-nodes-nyc.moralis.io/03eb35954a0b7ed092444a8e/polygon/mumbai", // Mumbai Polygon testnet
                    },
                },
            },
        }, // required
        theme: "dark",
    });
}

const ConnectButton = (props) => {

    const dispatch = useDispatch();

    const account = useSelector(selector.accountState);
    const provider = useSelector(selector.providerState);

    useEffect(() => {
        if (account !== '') {
            console.log("account: ", account);
        }
    }, [account]);

    const connect = useCallback(async function () {
        try {
            const provider = await web3Modal.connect();
            if (window.ethereum) {
                // check if the chain to connect to is installed
                await window.ethereum.request({
                    method: "wallet_switchEthereumChain",
                    params: [{ chainId: network.chainHexID }], // chainId must be in hexadecimal numbers
                });
            } else {
                console.log(
                    "MetaMask is not installed. Please consider installing it: https://metamask.io/download.html"
                );
            }

            const web3Provider = new providers.Web3Provider(provider);
            const signer = web3Provider.getSigner();
            const account = await signer.getAddress();

            dispatch(action.setProvider(provider));
            dispatch(action.setWeb3Provider(web3Provider));
            dispatch(action.setSigner(signer));
            dispatch(action.setAccount(account));
            dispatch(action.setChainId(network.chainId));
        } catch (error) {
            if (error.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: "wallet_addEthereumChain",
                        params: [
                            {
                                chainId: network.chainHexID,
                                rpcUrl: network.RPC,
                            },
                        ],
                    });
                } catch (addError) {
                    console.log(addError);
                }
            } else if (error.code === 4001) {
                console.log(error);
            }
            console.log(`${error}`);
        }
    }, []);
    const disconnect = useCallback(async function () {
        await web3Modal.clearCachedProvider();
        dispatch(action.setInit());
    }, []);
    useEffect(() => {
        if (web3Modal.cachedProvider) {
            connect();
        }
    }, [connect]);
    useEffect(() => {
        if (provider) {
            const handleAccountsChanged = (accounts) => {
                connect();
                dispatch(action.setAccount(accounts[0]));
            };

            // https://docs.ethers.io/v5/concepts/best-practices/#best-practices--network-changes
            const handleChainChanged = (_hexChainId) => {
                window.location.reload();
            };

            provider.on("accountsChanged", handleAccountsChanged);
            provider.on("chainChanged", handleChainChanged);

            // Subscription Cleanup
            return () => {
                if (provider.removeListener) {
                    provider.removeListener("accountsChanged", handleAccountsChanged);
                    provider.removeListener("chainChanged", handleChainChanged);
                }
            };
        }
    }, [provider]);

    if (account) {
        return (<button className="default-btn" onClick={disconnect}>{account.substring(0, 8)}... (Disconnect)</button>);
    }

    return (<button className="default-btn" onClick={(connect)}>Connect Wallet</button>);
}

export { ConnectButton }
