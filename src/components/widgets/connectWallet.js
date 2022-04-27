import Web3Modal from "web3modal";
import { providers/*, ethers*/ } from "ethers";
import WalletConnectProvider from "@walletconnect/web3-provider";
import config from '../../constants/config'
import networks from "../../networks";
import * as action from '../../store/actions';
import store from '../../store';

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
export const Connect = async (newChainIndex) => {
    // console.log("connect")
    const chainIndex = store.getState().selChain.index;
    try {
        const provider = await web3Modal.connect();

        if (window.ethereum) {
            // check if the chain to connect to is installed
            if ((await new providers.Web3Provider(provider).getNetwork()).chainId !== networks[newChainIndex ? newChainIndex : chainIndex].chainId) {
                try {
                    await window.ethereum.request({
                        method: "wallet_switchEthereumChain",
                        params: [{ chainId: networks[newChainIndex ? newChainIndex : chainIndex].chainHexId }], // chainId must be in hexadecimal numbers
                    });
                } catch (error) {
                    console.log("network switching error: ", error);
                }
            }
        } else {
            console.log(
                "MetaMask is not installed. Please consider installing it: https://metamask.io/download.html"
            );
        }

        const web3Provider = new providers.Web3Provider(provider);
        const chainId = (await web3Provider.getNetwork()).chainId;
        if (chainId === networks[newChainIndex ? newChainIndex : chainIndex].chainId) {
            const signer = web3Provider.getSigner();
            const account = await signer.getAddress();

            store.dispatch(action.setProvider(provider));
            store.dispatch(action.setWeb3Provider(web3Provider));
            store.dispatch(action.setSigner(signer));
            store.dispatch(action.setAccount(account));
            store.dispatch(action.setChainId(chainId));
        } else {
            alert(`Change network to ${networks[newChainIndex ? newChainIndex : chainIndex].Display}!`);
            // NotificationManager.info(`Change network to ${network.Display}!`, "Info", 2000);
            store.dispatch(action.setInit());
        }
    } catch (error) {
        if (error.code === 4902) {
            try {
                if (window.ethereum) {
                    await window.ethereum.request({
                        method: "wallet_addEthereumChain",
                        params: [
                            {
                                chainId: networks[newChainIndex ? newChainIndex : chainIndex].chainHexId,
                                rpcUrl: networks[newChainIndex ? newChainIndex : chainIndex].RPC,
                            },
                        ],
                    });
                }
            } catch (addError) {
                console.log(addError);
            }
        } else if (error.code === 4001) {
            console.log("connect error 4001: ", error);
        }
        console.log("connect", error);
    }
}

export const Reconnect = async (newChainIndex) => {
    // console.log("Reconnect")
    try {
        if (web3Modal.cachedProvider) {
            Connect(newChainIndex);
        }
    } catch (error) {
        console.log("auto connect with network switching err: ", error)
    }
}

export const Disconnect = async () => {
    // console.log("Disconnect")
    await web3Modal.clearCachedProvider();
    store.dispatch(action.setInit());
}

/*
const ConnectButton = () => {
    // console.log("rerender connectButton");
    const chainIndex = useSelector(selector.chainIndex);

    // const network = linq.from(networks).where(x => x.Name === "ropsten").single();
    // const [pendingConnectWallet, setPendingConnectWallet] = useState(false);

    const dispatch = useDispatch();

    const account = useSelector(selector.accountState);
    const provider = useSelector(selector.providerState);

    // const connect = useCallback(async function () {
    //     console.log("connect")
    //     // if (connectState === true) return;
    //     // setPendingConnectWallet(true);
    //     try {
    //         const provider = await web3Modal.connect();

    //         if (window.ethereum) {
    //             // check if the chain to connect to is installed
    //             if ((await new providers.Web3Provider(provider).getNetwork()).chainId !== networks[chainIndex].chainId) {
    //                 try {
    //                     await window.ethereum.request({
    //                         method: "wallet_switchEthereumChain",
    //                         params: [{ chainId: networks[chainIndex].chainHexId }], // chainId must be in hexadecimal numbers
    //                     });
    //                 } catch (error) {
    //                     console.log("network switching error: ", error);
    //                 }
    //             }
    //         } else {
    //             console.log(
    //                 "MetaMask is not installed. Please consider installing it: https://metamask.io/download.html"
    //             );
    //         }

    //         const web3Provider = new providers.Web3Provider(provider);
    //         const chainId = (await web3Provider.getNetwork()).chainId;
    //         if (chainId === networks[chainIndex].chainId) {
    //             const signer = web3Provider.getSigner();
    //             const account = await signer.getAddress();

    //             dispatch(action.setProvider(provider));
    //             dispatch(action.setWeb3Provider(web3Provider));
    //             dispatch(action.setSigner(signer));
    //             dispatch(action.setAccount(account));
    //             dispatch(action.setChainId(chainId));
    //         } else {
    //             alert(`Change network to ${networks[chainIndex].Display}!`);
    //             // NotificationManager.info(`Change network to ${network.Display}!`, "Info", 2000);
    //             dispatch(action.setInit());
    //         }
    //     } catch (error) {
    //         if (error.code === 4902) {
    //             try {
    //                 if (window.ethereum) {
    //                     await window.ethereum.request({
    //                         method: "wallet_addEthereumChain",
    //                         params: [
    //                             {
    //                                 chainId: networks[chainIndex].chainHexId,
    //                                 rpcUrl: networks[chainIndex].RPC,
    //                             },
    //                         ],
    //                     });
    //                 }
    //             } catch (addError) {
    //                 console.log(addError);
    //             }
    //         } else if (error.code === 4001) {
    //             console.log("connect error 4001: ", error);
    //         }
    //         console.log("connect", error);
    //     }
    //     // setPendingConnectWallet(false);
    // }, [chainIndex]);

    // const disconnect = useCallback(async function () {
    //     await web3Modal.clearCachedProvider();
    //     dispatch(action.setInit());
    // }, []);

    // useEffect(() => {
    //     console.log("chainIndex useEffect")
    //     try {
    //         if (web3Modal.cachedProvider) {
    //             console.log("reconnect if");
    //             connect();
    //         }
    //     } catch (error) {
    //         console.log("auto connect with network switching err: ", error)
    //     }
    // }, [chainIndex]);

    useEffect(() => {
        console.log("provider useEffect")
        try {
            if (provider) {
                const handleAccountsChanged = (accounts) => {
                    // console.log("reconnect if 2");
                    Connect();
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
        } catch (error) {
            console.log("auto connect with provider change err: ", error)
        }
    }, [provider]);

    // if (account) {
    //     return (<button className="default-btn" onClick={disconnect}>{account.substring(0, 8)}... (Disconnect)</button>);
    // }

    // return (<button className="default-btn" onClick={() => { connect() }}>Connect Wallet</button>);
}

export { ConnectButton }
*/