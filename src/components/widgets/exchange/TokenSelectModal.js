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

    const [tokenSchKey, setTokenSchKey] = useState("");

    const [schedTokens, setSchedTokens] = useState([]);

    function onSelect(token) {
        props.onSelect(token, props.showFor);
        props.hide();
        setSchedTokens();
        setTokenSchKey("");
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
        try {
            // console.log("schedTokens: ", schedTokens);
            // console.log("schedTokens length: ", schedTokens.length);
            // console.log("typeof schedTokens: ", typeof schedTokens === Array);
            // console.log("typeof schedTokens: ", typeof schedTokens);
            // console.log("schedTokens: ", schedTokens);
            // console.log("typeof tokens: ", typeof tokens);
            // console.log("tokens: ", tokens);
        } catch (error) {

        }
    }, [schedTokens])

    useEffect(() => {
        // console.log("ethers.utils.isAddress(tokenSchKey): ", ethers.utils.isAddress(tokenSchKey))
        if (ethers.utils.isAddress(tokenSchKey)) {
            try {
                const sched = linq.from(tokens.concat(tokensAddedByUser))
                    .where(x => x.Address === tokenSchKey).toArray();
                setSchedTokens(sched);
            } catch (error) {
                console.log("Token Search with address Err: ", error);
            }
            // getTokenInfo(tokenSchKey);
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
                console.log("Token Search with name or symbol Err: ", error);
            }
        }
    }, [tokens, tokensAddedByUser, tokenSchKey])

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
                                ) :
                                (tokens.concat(tokensAddedByUser)).map((token, index) => (
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
                    </div>
                </Modal.Body>
                <Modal.Footer className="border-info">
                    <button type="button" className="default-btn btn-sq"
                        onClick={() => {
                            setSchedTokens();
                            setTokenSchKey("");
                            props.hide();
                        }}>Close</button>
                </Modal.Footer>
            </div>
        </Modal>
    );
}

export { TokenSelectModal }