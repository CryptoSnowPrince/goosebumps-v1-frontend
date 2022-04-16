//import { useEthers } from '@usedapp/core'
import React, { useCallback, useEffect } from 'react';
import { Mainnet, DAppProvider, useEtherBalance, useEthers, Config } from '@usedapp/core'
import Web3Modal from "web3modal";
import config from '../../constants/config'

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
                        // 56: config.RpcURL[config.chainID],
                        97: network.RPC,
                    },
                },
            },
        }, // required
        theme: "dark",
    });
}

const initialState = {
    provider: null,
    web3Provider: null,
    address: null,
    chainId: null,
};

function reducer(state, action) {
    switch (action.type) {
        case "SET_WEB3_PROVIDER":
            return {
                ...state,
                provider: action.provider,
                web3Provider: action.web3Provider,
                address: action.address,
                chainId: action.chainId,
            };
        case "SET_ADDRESS":
            return {
                ...state,
                address: action.address,
            };
        case "SET_CHAIN_ID":
            return {
                ...state,
                chainId: action.chainId,
            };
        case "RESET_WEB3_PROVIDER":
            return initialState;
        default:
            throw new Error();
    }
}
const ConnectButton = (props) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    const { provider, web3Provider } = state;

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

            dispatch({
                type: "SET_WEB3_PROVIDER",
                provider,
                web3Provider,
                show_address,
                chainId: network.chainId,
            });
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
        // setSigner(null);
        setShowAccountAddress(null);
        setAccount(null);
        dispatch({
            type: "RESET_WEB3_PROVIDER",
        });
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
                dispatch({
                    type: "SET_ADDRESS",
                    address: accounts[0],
                });
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

    // const { activate, activateBrowserWallet, account, deactivate } = useEthers();

    // const connect = useCallback(async () => {
    //     console.log("connect");
    //     try {
    //         activate();
    //         // activateBrowserWallet();
    //     } catch (error) {
    //         console.log(error)
    //     }
    // }, [activateBrowserWallet]);

    // const disconnect = async () => {
    //     console.log("disconnect");
    //     try {
    //         deactivate();
    //     } catch (error) {
    //         console.log(error)
    //     }
    // }

    if (account) {
        return (<button className="default-btn" onClick={disconnect}>{account.substring(0, 8)}... (Disconnect)</button>);
    }

    return (<button className="default-btn" onClick={(connect)}>Connect Wallet</button>);
}

export { ConnectButton }
