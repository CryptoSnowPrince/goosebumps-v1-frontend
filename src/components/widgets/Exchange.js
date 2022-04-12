import React, { useEffect, useState, useCallback } from 'react';
import { Button, Modal } from "react-bootstrap";
import { useEthers } from '@usedapp/core';
import { singer, ethers } from 'ethers';
import { Contract, Provider } from 'ethers-multicall';
import { ConnectButton } from './ConnectButton';
//import { ChainId, Token, TokenAmount, Fetcher, Pair, Route, Trade, TradeType, Percent } from '@pancakeswap-libs/sdk';
//import Web3 from 'web3';
import tokenAbi from '../../abis/token';
import pairAbi from '../../abis/pair';
import routerAbi from '../../abis/router';
import { useWeb3React } from '@web3-react/core';
import { Requester } from "../../requester";
import numberHelper from "../../numberHelper";
import NumberFormat from "react-number-format";

const Exchange = (props) => {
    const { account } = useEthers();
    const [init, setInit] = useState(true);
    const [from, setFrom] = useState({ symbol: props.pair.sellCurrency.symbol, address: props.pair.sellCurrency.address, decimals: 0, amount: "", balance: 0, origin: "from" });
    const [to, setTo] = useState({ symbol: props.pair.buyCurrency.symbol, address: props.pair.buyCurrency.address, decimals: 0, amount: "", balance: 0, origin: "to" });
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState();
    const [tokens, setTokens] = useState();
    const [quote, setQuote] = useState();
    const [slippage, setSlippage] = useState(0.5);
    const [trackQuote, setTrackQuote] = useState(false);

    const startLoading = () => {
        setLoading(true);
        let fadeStyle = document.querySelector('.wallet-tabs-h');
        fadeStyle.classList.add('fade-in-wallet-tabs');
    }

    const stopLoading = () => {
        setLoading(false);
        let fadeStyle = document.querySelector('.wallet-tabs-h');
        fadeStyle.classList.remove('fade-in-wallet-tabs');
    }

    const getQuote = useCallback(async (from, to, slippage) => {
        if (from.amount > 0) {
            var response = await Requester.getAsync(props.network.SwapApi + "swap/v1/quote", {
                sellToken: from.address === "-" ? props.network.Currency.Name : from.address,
                buyToken: to.address === "-" ? props.network.Currency.Name : to.address,
                sellAmount: ethers.utils.parseUnits(from.amount.toString(), from.decimals),
                slippagePercentage: slippage / 100
            });
            response.price = 1 / response.price;
            response.guaranteedPrice = 1 / response.guaranteedPrice;
        }
        else if (to.amount > 0) {
            response = await Requester.getAsync(props.network.SwapApi + "swap/v1/quote", {
                sellToken: from.address === "-" ? props.network.Currency.Name : from.address,
                buyToken: to.address === "-" ? props.network.Currency.Name : to.address,
                buyAmount: ethers.utils.parseUnits(to.amount.toString(), to.decimals),
                slippagePercentage: slippage / 100
            });
        }

        setQuote(response);
    }, [props.network]);

    const updateBalances = useCallback(async (from, to) => {
        if (account) {
            const provider = new ethers.providers.JsonRpcProvider(props.network.RPC);
            const ethcallProvider = new Provider(provider);
            await ethcallProvider.init();

            let fromBalance = 0;
            let fromDecimals = 0;
            let toBalance = 0;
            let toDecimals = 0;

            if (from.address !== "-") {
                const buyContract = new Contract(from.address, tokenAbi);
                const [buyBalance, buyDecimals] = await ethcallProvider.all([
                    buyContract.balanceOf(account),
                    buyContract.decimals()
                ]);
                fromBalance = ethers.utils.formatUnits(buyBalance, buyDecimals);
                fromDecimals = buyDecimals;
            }
            else {
                fromBalance = ethers.utils.formatUnits(await provider.getBalance(account), props.network.Currency.Decimals);
                fromDecimals = props.network.Currency.Decimals;
            }

            if (to.address !== "-") {
                const sellContract = new Contract(to.address, tokenAbi);
                const [sellBalance, sellDecimals] = await ethcallProvider.all([
                    sellContract.balanceOf(account),
                    sellContract.decimals()
                ]);
                toBalance = ethers.utils.formatUnits(sellBalance, sellDecimals);
                toDecimals = sellDecimals;
            }
            else {
                toBalance = ethers.utils.formatUnits(await provider.getBalance(account), props.network.Currency.Decimals);
                toDecimals = props.network.Currency.Decimals;
            }

            const newTo = Object.assign({}, to);
            newTo.balance = toBalance;
            newTo.decimals = toDecimals;
            setTo(newTo);

            const newFrom = Object.assign({}, from);
            newFrom.balance = fromBalance;
            newFrom.decimals = fromDecimals;
            setFrom(newFrom);
        }
    }, [account, props.network]);

    //swap yaparken approve gerekiyor mu emin değilim.

    const approve = async (TokenAddress) => {
        const abi = ["function approve(address spender, uint amount) external returns (bool)"]
        startLoading();
        if (quote.sellAmount === "") {
            alert("Please enter a valid amount");
            stopLoading();
            return;
        }
        let provider = new ethers.providers.Web3Provider(window.ethereum, "any");
        await provider.send("eth_requestAccounts", []);
        const contract = new ethers.Contract(
            TokenAddress,
            abi,
            provider.getSigner()
        );
        try {
            startLoading();
            const tx = await contract.approve(
            quote.allowanceTarget,
            quote.sellAmount
        );
            const receipt = await tx.wait(tx);
            console.log("receiptLog: ", receipt);
            if (receipt.status === 1) {
                stopLoading();
                console.log("Approve Status: Success");
            } else {
                stopLoading();
                console.error(
                    "Approve Status: Failed, please check receiptLog message."
                );
            }
        } catch (error) {
            stopLoading();
            console.log("Error: ", error);
        } finally {
            stopLoading();
            console.log(
                "The Promise is settled, meaning it has been resolved or rejected."
            );
        }
    };


    const trade = async () => {
        const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
        const txRequest = {
            from: account,
            to: quote.to,
            value: quote.value,
            nonce: provider.getTransactionCount(account, "latest"),
            gasLimit: quote.gas,
            gasPrice: quote.gasPrice,
            data: quote.data
        };
        await provider.getSigner().sendTransaction(txRequest);
    }

    const invert = () => {
        const newFrom = Object.assign({}, to);
        const newTo = Object.assign({}, from);
        setFrom(newFrom);
        setTo(newTo);
        setQuote();
    }

    const fill = (side, value) => {

        if (side === "from") {
            var target = from;
            var setTarget = setFrom;
            var other = to;
            var setOther = setTo;
        }
        else {
            target = to;
            setTarget = setTo;
            other = from;
            setOther = setFrom;
        }

        const newTarget = Object.assign({}, target);
        newTarget.amount = value;
        setTarget(newTarget);

        if (quote?.price > 0) {
            var newOther = Object.assign({}, other);
            newOther.amount = target.origin === "from" ? 1 / quote.price * value : quote.price * value;
            setOther(newOther);
        }
    }

    const onAmountChange = (e, side) => {
        fill(side, e.target.value.replace(/[^0-9.]/g, ""));
    };

    const fillMaxAmount = (e, side) => {
        fill(side, e.target.dataset.balance);
    };

    const onSlippageChange = (e) => {
        const value = e.target.value.replace(/[^0-9.]/g, "");
        setSlippage(value);
    };

    const onTokenSelect = (side, token) => {
        const newTo = Object.assign({}, to);
        const newFrom = Object.assign({}, from);

        if (side === "to") {
            newTo.address = token.Address;
            newTo.symbol = token.Symbol;
            setTo(newTo);
        } else {
            newFrom.address = token.Address;
            newFrom.symbol = token.Symbol;
            setFrom(newFrom);
        }

        updateBalances(newFrom, newTo).then();

        setShowModal();
    };

    useEffect(() => {
        if (init) {
            setInit(false);
            updateBalances(from, to).then();
            setTokens(require("../../tokens/" + props.network.Name))
            setTrackQuote(true);
        };

        const id = setInterval(() => {
            if (trackQuote) {
                getQuote(from, to, slippage).then();
            }
        }, 1000);

        return () => clearInterval(id);
    }, [init, updateBalances, setTokens, props.network, from, to, getQuote, slippage, trackQuote]);

    if (!tokens) {
        return (
            <div className="text-center p-5 w-100">
                <span className="spinner-border" role="status"></span>
            </div>
        );
    }

    return (
        <>
            <div className="wallet-tabs wallet-tabs-h">
                {/*loading && <i className="fas fa-spinner fa-spin" />*/}
                <div className="tab">
                    <ul className="tabs bg-need">
                        <li>EXCHANGE</li>
                    </ul>
                    <div className="tab_content">
                        <div className="tabs_item">
                            <div className="exchange d-flex justify-content-between">
                                <div>
                                    <h3>EXCHANGE</h3>
                                    <p>Trade tokens in an instant</p>
                                </div>
                                <div>
                                    Slippage: <input type="text" autoComplete="off" onChange={onSlippageChange} min="0" max={49} value={slippage} />
                                </div>
                            </div>
                            <div>
                                <div className="form-group">
                                    <div className="row justify-content-between">
                                        <div className="col">
                                            <label htmlFor="from" className="w-100">From</label>
                                        </div>
                                        <div className="col text-end">
                                            <button data-balance={from.balance} disabled={loading} onClick={e => fillMaxAmount(e, "from")} type="button" className="w-100 text-end badge btn text-white">Balance: {from.balance}</button>
                                        </div>
                                    </div>
                                    <div className="input-group">
                                        <input id="from" type="text" className="form-control me-2" placeholder="0" autoComplete="off" onChange={e => onAmountChange(e, "from")} min="0" max={from.balance} value={from.amount} />
                                        <div className="input-group-addon">
                                            <button type="button" disabled={loading} className="default-btn" onClick={() => setShowModal("from")}>{from.symbol}</button>
                                        </div>
                                    </div>
                                </div>
                                <div className="form-group text-center">
                                    <button type="button" className="btn w-100" onClick={invert}><span className="fa fa-arrow-down" /></button>
                                </div>
                                <div className="form-group">
                                    <div className="row justify-content-between">
                                        <div className="col">
                                            <label htmlFor="from" className="w-100">To</label>
                                        </div>
                                        <div className="col text-end">
                                            <button data-balance={to.balance} disabled={loading} onClick={e => fillMaxAmount(e, "to")} type="button" className="w-100 text-end badge btn text-white">Balance: {to.balance}</button>
                                        </div>
                                    </div>
                                    <div className="input-group">
                                        <input id="from" type="text" className="form-control me-2" placeholder="0" autoComplete="off" onChange={e => onAmountChange(e, "to")} min="0" max={to.balance} value={to.amount} />
                                        <div className="input-group-addon">
                                            <button type="button" disabled={loading} className="default-btn" onClick={() => setShowModal("to")}>{to.symbol}</button>
                                        </div>
                                    </div>
                                </div>
                                {
                                    quote ?

                                        <>
                                            <div className="form-group text-center">
                                                =
                                            </div>
                                            <div className="form-group">
                                                <div className="row justify-content-between">
                                                    <div className="col-6">
                                                        <label htmlFor="from" className="w-100">Guaranteed Price</label>
                                                    </div>
                                                    <div className="col-6 text-end pe-4 py-2">
                                                        <NumberFormat value={quote.guaranteedPrice} decimalScale={numberHelper.calculatePricescale(parseFloat(quote.guaranteedPrice))} displayType="text" thousandSeparator="," suffix={" " + from.symbol} />
                                                    </div>
                                                    <div className="col-6">
                                                        <label htmlFor="from" className="w-100">Guaranteed Recieve</label>
                                                    </div>
                                                    <div className="col-6 text-end pe-4 py-2">
                                                        <NumberFormat value={from.amount * (1 / quote.guaranteedPrice)} decimalScale={numberHelper.calculateTokenscale(quote.guaranteedPrice)} displayType="text" thousandSeparator="," suffix={" " + to.symbol} />
                                                    </div>
                                                    <div className="col-6">
                                                        <label htmlFor="from" className="w-100">Estimated Fees</label>
                                                    </div>
                                                    <div className="col-6 text-end pe-4 py-2">
                                                        {ethers.utils.formatUnits(quote.estimatedGas * quote.gasPrice, props.network.Currency.Decimals)} {props.network.Currency.Name}
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                        :
                                        <></>
                                }
                                <div className="form-group btns">
                                    {account
                                        ? quote && quote.allowanceTarget !== "0x0000000000000000000000000000000000000000"
                                            ? <Button className="default-btn w-100" disabled={loading} onClick={() => approve(from.address)}>Approve</Button>
                                            : <Button className="default-btn w-100" disabled={loading || !quote} onClick={() => trade()}>Trade</Button>
                                        : <ConnectButton />
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Modal show={showModal} onHide={() => setShowModal()}>
                <div className="bg-dark border border-info">
                    <Modal.Header className="border-info">
                        <Modal.Title>Select a token</Modal.Title>
                        <button type="button" className="default-btn btn-sq" onClick={() => setShowModal()}><i className="fa fa-times"></i></button>
                    </Modal.Header>
                    <Modal.Body className="text-center">
                        <input type="text" className='form-control' placeholder="Search name or paste address" />

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
                                            <button type="button" className="default-btn btn-sq" onClick={() => { onTokenSelect(showModal, token) }}>Select</button>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </Modal.Body>
                    <Modal.Footer className="border-info">
                        <button type="button" className="default-btn btn-sq" onClick={() => setShowModal()}>Close</button>
                    </Modal.Footer>
                </div>
            </Modal>
        </>
    );
}

export { Exchange }