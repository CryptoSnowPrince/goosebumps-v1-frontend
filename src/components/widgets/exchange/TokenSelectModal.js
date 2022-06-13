import { Modal } from "react-bootstrap";
import React, { useEffect, useState } from "react";
import { ethers } from 'ethers';
import { Contract, Provider, setMulticallAddress } from 'ethers-multicall';
import tokenAbi from '../../../abis/token';
import linq from "linq";
import { logMessage } from '../../../utils/helpers';

const TokenSelectModal = (props) => {
    const [init, setInit] = useState(true);

    const [tokens, setTokens] = useState([]);
    const [tokensAddedByUser, setTokensAddedByUser] = useState([]);

    const [tokenSchKey, setTokenSchKey] = useState("");

    const [schedTokens, setSchedTokens] = useState([]);
    const [newTokenSrched, setNewTokenSrched] = useState([]);

    function onSelect(token) {
        props.onSelect(token, props.showFor);
        setTokenSchKey("");
        setSchedTokens([]);
        setNewTokenSrched([]);
        props.hide();
    }

    function onNewTokenSelect(token) {
        setTokensAddedByUser(tokensAddedByUser.concat(newTokenSrched));
        localStorage.setItem(props.network.Name, JSON.stringify(tokensAddedByUser.concat(newTokenSrched)));
        onSelect(token);
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

            setNewTokenSrched([
                {
                    Name: name,
                    Symbol: symbol,
                    Address: tokenAddress,
                    Decimals: decimals,
                }
            ])
        } catch (error) {
            logMessage("getTokenInfo err: ", error)
        }
    }

    useEffect(() => {
        // logMessage("props.network.Name: ", props.network.Name);
        if (init) {
            setInit(false);
            setTokens(
                require("../../../tokens/" + props.network.Name)
            )
            if (localStorage.getItem(props.network.Name)) {
                setTokensAddedByUser(
                    JSON.parse(
                        localStorage.getItem(props.network.Name)
                    )
                )
            }
        } else {
            setTokens(
                require("../../../tokens/" + props.network.Name)
            )
            if (localStorage.getItem(props.network.Name)) {
                setTokensAddedByUser(
                    JSON.parse(
                        localStorage.getItem(props.network.Name)
                    )
                )
            } else {
                setTokensAddedByUser([]);
            }
        }
    }, [init, props.network]);

    useEffect(() => {
        if (ethers.utils.isAddress(tokenSchKey)) {
            try {
                const sched = linq.from(tokens.concat(tokensAddedByUser))
                    .where(x => x.Address.toLowerCase() === tokenSchKey.toLowerCase()).toArray();
                setSchedTokens(sched);
                if (sched.length === 0) {
                    getTokenInfo(tokenSchKey);
                }
            } catch (error) {
                logMessage("Token Search with address Err: ", error);
            }
        }
        else if (tokenSchKey !== "") {
            try {
                const sched = linq.from(tokens.concat(tokensAddedByUser))
                    .where(x =>
                    (
                        (x.Name.toLowerCase()).indexOf(tokenSchKey.toLowerCase()) !== -1 ||
                        (x.Symbol.toLowerCase()).indexOf(tokenSchKey.toLowerCase()) !== -1)
                    ).toArray();
                setSchedTokens(sched);
            } catch (error) {
                logMessage("Token Search with name or symbol Err: ", error);
            }
        }
    }, [tokenSchKey])

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
                        onChange={(e) => { setTokenSchKey(e.target.value) }} />

                    <div className='text-start overflow-auto border mt-3 p-3' style={{ maxHeight: 250 }}>
                        {
                            tokenSchKey !== "" ?
                                (
                                    newTokenSrched.length > 0 ?
                                        newTokenSrched.map((token, index) => (
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
                                                        onClick={() => { onNewTokenSelect(token) }}>Select</button>
                                                </div>
                                            </div>
                                        )) :
                                        (schedTokens.length > 0 ?
                                            schedTokens.map((token, index) => (
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
                                            )) : "No results found."
                                        )
                                ) :
                                (
                                    (tokensAddedByUser ? tokens.concat(tokensAddedByUser) : tokens)
                                        .map((token, index) => (
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
                                )
                        }
                    </div>
                </Modal.Body>
                <Modal.Footer className="border-info">
                    <button type="button" className="default-btn btn-sq"
                        onClick={() => {
                            setTokenSchKey("");
                            setSchedTokens([]);
                            setNewTokenSrched([]);
                            props.hide();
                        }}>Close</button>
                </Modal.Footer>
            </div>
        </Modal>
    );
}

export { TokenSelectModal }