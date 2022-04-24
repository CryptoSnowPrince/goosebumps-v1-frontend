import { Modal } from "react-bootstrap";
import React, { useEffect, useState } from "react";
import { singer, ethers, BigNumber } from 'ethers';
import { Contract, Provider, setMulticallAddress } from 'ethers-multicall';
import tokenAbi from '../../../abis/token';
import linq from "linq";

const TokenSelectModal = (props) => {
    const [init, setInit] = useState(true);
    const [tokens, setTokens] = useState();
    const [tokensAddedByUser, setTokensAddedByUser] = useState();

    const [searchTokens, setSearchTokens] = useState("");

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

            const token = [
                {
                    Name: name,
                    Symbol: symbol,
                    Address: tokenAddress,
                    Decimals: decimals,
                }
            ]

            var addedTokenList = JSON.parse(localStorage.getItem(props.networkName))

            if (addedTokenList) {
                try {
                    const alreadyAdded = linq.from(addedTokenList).where(x => x.Address === tokenAddress).single();
                    console.log("alreadyAdded: ", alreadyAdded);
                } catch (error) {
                    addedTokenList = addedTokenList.concat(token);
                    localStorage.setItem(props.networkName, JSON.stringify(addedTokenList));
                    console.log(token);
                }
            } else {
                localStorage.setItem(props.networkName, JSON.stringify(token));
                console.log(token);
            }
        } catch (error) {
            console.log("getTokenInfo err: ", error)
        }
    }

    useEffect(() => {
        if (init) {
            setInit(false);
            setTokens(
                require("../../../tokens/" + props.networkName)
            )
            setTokensAddedByUser(
                JSON.parse(
                    localStorage.getItem(props.networkName)
                )
            )
        };
    }, [init, props.networkName]);

    useEffect(() => {

    }, [])

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
                    <button type="button" className="default-btn btn-sq"
                        onClick={props.hide}><i className="fa fa-times"></i></button>
                </Modal.Header>
                <Modal.Body className="text-center">
                    <input type="text" className='form-control'
                        placeholder="Search name or paste address"
                        onChange={(e) => { setSearchTokens(e.target.value) }} />

                    <div className='text-start overflow-auto border mt-3 p-3' style={{ maxHeight: 250 }}>
                        {
                            tokens.map((token, index) => (
                                <div key={index} className='row mb-3 align-items-center'>
                                    <img className='col-auto' style={{ height: 32 }}
                                        src={token.Logo ? token.Logo : "/assets/tokens/empty.png"}
                                        alt={token.Symbol} />
                                    <div className='col'>
                                        <div>{token.Name}</div>
                                        <div>{token.Symbol}</div>
                                    </div>
                                    <div className='col-auto'>
                                        <button type="button" className="default-btn btn-sq"
                                            onClick={() => { onSelect(token) }}>Select</button>
                                    </div>
                                </div>
                            ))
                        }
                        {
                            tokensAddedByUser.map((token, index) => (
                                <div key={index} className='row mb-3 align-items-center'>
                                    <img className='col-auto' style={{ height: 32 }}
                                        src={"/assets/tokens/empty.png"}
                                        alt={token.Symbol} />
                                    <div className='col'>
                                        <div>{token.Name}</div>
                                        <div>{token.Symbol}</div>
                                    </div>
                                    <div className='col-auto'>
                                        <button type="button" className="default-btn btn-sq"
                                            onClick={() => { onSelect(token) }}>Select</button>
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