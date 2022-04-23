import { Modal } from "react-bootstrap";
import React, { useEffect, useState } from "react";
import { singer, ethers, BigNumber } from 'ethers';
import { Contract, Provider, setMulticallAddress } from 'ethers-multicall';
import tokenAbi from '../../../abis/token';

const TokenSelectModal = (props) => {
    const [init, setInit] = useState(true);
    const [tokens, setTokens] = useState();

    const [searchTokens, setSearchTokens] = useState("");

    const [testtokenlist, setTesttokenlist] = useState();

    function onSelect(token) {
        props.onSelect(token, props.showFor);
        props.hide();
    }

    async function getTokenInfo(tokenAddress) {
        const provider = new ethers.providers.JsonRpcProvider(props.network.RPC);
        if (props.network.chainId === 97) // When bsc testnet
        {
            setMulticallAddress(props.network.chainId, props.network.MulticallAddress);
        }
        const ethcallProvider = new Provider(provider);
        await ethcallProvider.init();

        try {
            const contract = new Contract(tokenAddress, tokenAbi);
            var [name, symbol, decimals] = await ethcallProvider.all([
                contract.name(),
                contract.symbol(),
                contract.decimals()
            ]);
            console.log("name: ", name);
            console.log("symbol: ", symbol);
            console.log("decimals: ", decimals);
            // } else {
            // 	balance = await provider.getBalance(account);
            // 	decimals = props.network.Currency.Decimals;
            // }

            // const newTarget = Object.assign({}, forTarget);
            // newTarget.balance = ethers.utils.formatUnits(balance, decimals);
            // newTarget.decimals = decimals;
            // setForTarget(newTarget);
        } catch (error) {
            console.log("getTokenInfo err: ", error)
        }
    }

    useEffect(() => {
        if (init) {
            setInit(false);
            setTokens(require("../../../tokens/" + props.networkName))
            //
            setTesttokenlist(require("../../../tokens/" + props.networkName))
        };
    }, [init, props.networkName]);

    useEffect(() => {
        console.log("typeof tokens: ", typeof tokens)
        console.log("tokens: ", tokens)
        console.log("searchTokens: ", searchTokens)
        console.log("ethers.utils.isAddress(searchTokens): ", ethers.utils.isAddress(searchTokens))
        if (ethers.utils.isAddress(searchTokens)) {
            console.log("okay");
            getTokenInfo(searchTokens);
        }

    }, [tokens, searchTokens])

    if (!props.showFor || init) {
        return null;
    }

    return (
        <Modal show="true" onHide={props.hide}>
            <div className="bg-dark border border-info">
                <Modal.Header className="border-info">
                    <Modal.Title>Select a token</Modal.Title>
                    <button type="button" className="default-btn btn-sq" onClick={props.hide}><i className="fa fa-times"></i></button>
                </Modal.Header>
                <Modal.Body className="text-center">
                    <input type="text" className='form-control'
                        placeholder="Search name or paste address"
                        onChange={(e) => { setSearchTokens(e.target.value) }} />

                    <div className='text-start overflow-auto border mt-3 p-3' style={{ maxHeight: 250 }}>
                        {
                            tokens.map((token, index) => (
                                <div key={index} className='row mb-3 align-items-center'>
                                    <img className='col-auto' style={{ height: 32 }} src={token.Logo} alt={token.Name} />
                                    <div className='col'>
                                        <div>{token.Name}</div>
                                        <div>{token.Symbol}</div>
                                    </div>
                                    <div className='col-auto'>
                                        <button type="button" className="default-btn btn-sq" onClick={() => { onSelect(token) }}>Select</button>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </Modal.Body>
                <Modal.Footer className="border-info">
                    <button type="button" className="default-btn btn-sq" onClick={props.hide}>Close</button>
                </Modal.Footer>
            </div>
        </Modal>
    );
}

export { TokenSelectModal }