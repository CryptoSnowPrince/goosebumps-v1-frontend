import Web3Modal from "web3modal";
import { providers } from "ethers";
import WalletConnectProvider from "@walletconnect/web3-provider";
import config from '../../constants/config'
import networks from "../../networks";
import * as action from '../../store/actions';
import store from '../../store';
import { logMessage } from '../../utils/helpers';

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
    // logMessage("connect")
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
                    logMessage("network switching error: ", error);
                }
            }
        } else {
            logMessage(
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
            alert(`Switch network to ${networks[newChainIndex ? newChainIndex : chainIndex].Display} on your wallet!`);
            // NotificationManager.info(`Change network to ${network.Display}!`, "Info", 2000);
            Disconnect();
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
                logMessage(addError);
            }
        } else if (error.code === 4001) {
            logMessage("connect error 4001: ", error);
        }
        logMessage("connect", error);
    }
}

export const Reconnect = async (newChainIndex) => {
    try {
        Connect(newChainIndex);
    } catch (error) {
        logMessage("auto connect with network switching err: ", error)
    }
}

export const Disconnect = async () => {
    await web3Modal.clearCachedProvider();
    store.dispatch(action.setInit());
}
