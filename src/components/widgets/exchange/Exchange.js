import React, { useEffect, useState, useCallback } from 'react';
import { Web3 } from 'web3';
import { multicall, useEthers } from '@usedapp/core';
import { singer, ethers, BigNumber } from 'ethers';
import { Contract, Provider, setMulticallAddress } from 'ethers-multicall';
import { ConnectButton } from '../ConnectButton';
//import { ChainId, Token, TokenAmount, Fetcher, Pair, Route, Trade, TradeType, Percent } from '@pancakeswap-libs/sdk';
import tokenAbi from '../../../abis/token';
import { Requester } from "../../../requester";
import numberHelper from "../../../numberHelper";
import NumberFormat from "react-number-format";
import { TokenSelectModal } from './TokenSelectModal';
import { useSelector, useDispatch } from 'react-redux';
import * as selector from '../../../store/selectors';
import * as action from '../../../store/actions';
import { getFullDisplayBalance, formatNumberWithoutComma } from '../../../utils/number';
// console.log("Web3:", Web3);

const Exchange = (props) => {
	const account = useSelector(selector.accountState);
	const [connected, setConnected] = useState();
	const [loading, setLoading] = useState();
	const [ready, setReady] = useState();
	const [needApprove, setNeedApprove] = useState();
	const [quote, setQuote] = useState();
	const [confirmed, setConfirmed] = useState();
	const [pendingQuote, setPendingQuote] = useState();
	const [error, setError] = useState();
	const [showTokenSelectModal, setShowTokenSelectModal] = useState();

	const [from, setFrom] = useState({ symbol: props.fromSymbol, address: props.fromAddress, decimals: 0, amount: 0, balance: 0 });
	const [to, setTo] = useState({ symbol: props.toSymbol, address: props.toAddress, decimals: 0, amount: 0, balance: 0 });
	const [slippage, setSlippage] = useState(0.5);

	useEffect(() => {
		setFrom({ symbol: props.fromSymbol, address: props.fromAddress, decimals: 0, amount: 0, balance: 0 })
		setTo({ symbol: props.toSymbol, address: props.toAddress, decimals: 0, amount: 0, balance: 0 });
	}, [props.network])
	
	const validateQuote = async () => {
		setError();

		var response = await Requester.getAsync(props.network.SwapApi + "swap/v1/quote", {
			sellToken: from.address === "-" ? props.network.Currency.Name : from.address,
			buyToken: to.address === "-" ? props.network.Currency.Name : to.address,
			sellAmount: ethers.utils.parseUnits(from.amount.toString(), from.decimals),
			slippagePercentage: slippage / 100,
			takerAddress: account
		});

		if (response) {
			if (!response.price) {
				if (response.reason) {
					if (response.reason === "IncompleteTransformERC20Error") {
						setError("Insufficient Slippage");
					}
					else if (response.validationErrors) {
						setError(response.reason + ": " + response.validationErrors[0].reason);
					}
					else if (response.values) {
						setError(response.reason + ": " + response.values.message);
					}
					else {
						setError(response.reason);
					}
				}
				else {
					setError("Unknown error");
				}
			}
		}
		else {
			setError("Unknown error");
		}
	};

	const updateQuote = async (sellTokenAddress, sellTokenDecimals, buyTokenAddress, buyTokenDecimals, amount, slippage, side) => {
		setError();
		setConfirmed();

		if (amount > 0) {
			if (side === "from") {
				var response = await Requester.getAsync(props.network.SwapApi + "swap/v1/quote", {
					sellToken: sellTokenAddress === "-" ? props.network.Currency.Name : sellTokenAddress,
					buyToken: buyTokenAddress === "-" ? props.network.Currency.Name : buyTokenAddress,
					sellAmount: ethers.utils.parseUnits(amount.toString(), sellTokenDecimals),
					slippagePercentage: slippage / 100
				});
			}
			else {
				response = await Requester.getAsync(props.network.SwapApi + "swap/v1/quote", {
					sellToken: sellTokenAddress === "-" ? props.network.Currency.Name : sellTokenAddress,
					buyToken: buyTokenAddress === "-" ? props.network.Currency.Name : buyTokenAddress,
					buyAmount: ethers.utils.parseUnits(amount.toString(), buyTokenDecimals),
					slippagePercentage: slippage / 100
				});
			}

			if (response) {
				if (response.price) {
					response.side = side;
					console.log("response: ", response);
					setQuote(response);

					if (response.allowanceTarget !== "0x0000000000000000000000000000000000000000") {
						const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
						const contract = new ethers.Contract(
							from.address,
							tokenAbi,
							provider
						);

						try {
							var allowance = await contract.allowance(account, response.allowanceTarget);
						} catch { }

						if (BigNumber.from(response.sellAmount).gt(allowance)) {
							setNeedApprove({ target: response.allowanceTarget, amount: response.sellAmount });
						}
						else {
							setNeedApprove();
						}
					}
					else {
						setNeedApprove();
					}
				}
			}
			else {
				setQuote();
			}
		}

		return response;
	};

	const resetQuote = (overrideFrom, overrideTo, overrideSlippage) => {
		console.log("resetQuote");
		setReady();
		setQuote();
		setError();
		setConfirmed();

		const _from = overrideFrom ? overrideFrom : from;
		const _to = overrideTo ? overrideTo : to;

		if (pendingQuote) {
			clearTimeout(pendingQuote);
		}

		if (_from.amount > 0) {
			setPendingQuote(setTimeout(() => {
				updateQuote(_from.address, _from.decimals, _to.address, _to.decimals, _from.amount, overrideSlippage ? overrideSlippage : slippage, "from").then(quote => {
					setReady(true);
				});
				setPendingQuote();
			}, 1500));
		}
		else if (_to.amount > 0) {
			setPendingQuote(setTimeout(() => {
				updateQuote(_from.address, _from.decimals, _to.address, _to.decimals, _to.amount, overrideSlippage ? overrideSlippage : slippage, "to").then(quote => {
					setReady(true);
				});
				setPendingQuote();
			}, 1500));
		}
		else {
			setReady(true);
		}
	};

	const updateBalance = async (forContract, forTarget, setForTarget) => {
		const provider = new ethers.providers.JsonRpcProvider(props.network.RPC);
		if (props.network.chainId === 97) // When bsc testnet
		{
			setMulticallAddress(props.network.chainId, props.network.MulticallAddress);
		}
		const ethcallProvider = new Provider(provider);
		await ethcallProvider.init();

		try {
			if (forContract !== "-") {
				const contract = new Contract(forContract, tokenAbi);
				var [balance, decimals] = await ethcallProvider.all([
					contract.balanceOf(account),
					contract.decimals()
				]);
			} else {
				balance = await provider.getBalance(account);
				decimals = props.network.Currency.Decimals;
			}

			const newTarget = Object.assign({}, forTarget);
			newTarget.balance = ethers.utils.formatUnits(balance, decimals);
			newTarget.decimals = decimals;
			setForTarget(newTarget);
		} catch (error) {
			console.log("update balance err: ", error)
		}
	};

	const resetBalances = () => {
		console.log("resetBalances");
		setFrom(Object.assign({}, from));
		setTo(Object.assign({}, to));
	};

	const approve = async () => {
		console.log("approve");
		setReady();

		const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
		const contract = new ethers.Contract(
			from.address,
			tokenAbi,
			provider.getSigner()
		);

		try {
			const tx = await contract.approve(needApprove.target, quote.sellAmount);
			const receipt = await tx.wait(tx);
			if (receipt.status === 1) {
				setNeedApprove();
			}
		} catch { }

		setReady(true);
	};

	const confirm = () => {
		setReady();
		setConfirmed(true);
		validateQuote().then(() => {
			setReady(true);
		});
	}

	const trade = async () => {
		console.log("trade");
		const provider = new ethers.providers.Web3Provider(window.ethereum, "any");

		const txRequest = {
			from: account,
			to: quote.to,
			value: BigNumber.from(quote.value),
			gasLimit: BigNumber.from(quote.gas),
			gasPrice: BigNumber.from(quote.gasPrice),
			data: quote.data
		};

		await provider.getSigner().sendTransaction(txRequest);

		resetQuote();
		resetBalances();
	}

	const invert = () => {
		const newFrom = Object.assign({}, to);
		const newTo = Object.assign({}, from);
		setFrom(newFrom);
		setTo(newTo);
		resetQuote(newFrom, newTo);
	}

	const fill = (side, value) => {
		setReady();
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

		var newOther = Object.assign({}, other);
		newOther.amount = "";
		setOther(newOther);
		setQuote();

		if (pendingQuote) {
			clearTimeout(pendingQuote);
		}
		console.log("L292")
		if (value > 0) {
			setPendingQuote(setTimeout(() => {
				console.log("L295")
				updateQuote(from.address, from.decimals, to.address, to.decimals, value, slippage, side).then(quote => {
					if (quote?.price > 0) {
						const buyAmount = ethers.utils.formatUnits(quote.buyAmount, to.decimals);
						const sellAmount = ethers.utils.formatUnits(quote.sellAmount, from.decimals);

						newOther.amount = side === "from" ? buyAmount : sellAmount;
						setOther(newOther);
					}
					setReady(true);
				});
				setPendingQuote();
			}, 1500));
		}
		else {
			setReady(true);
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
		resetQuote(null, null, value);
	};

	const onSelectToken = (token, forTarget) => {
		if ((token.Address === to.address && forTarget === "from") || (token.Address === from.address && forTarget === "to")) {
			invert();
		}
		else {
			if (forTarget === "from") {
				const newFrom = Object.assign({}, from);
				newFrom.address = token.Address;
				newFrom.symbol = token.Symbol;
				newFrom.decimals = token.Decimals;
				updateBalance(token.Address, newFrom, setFrom)
					.then(() => resetQuote(newFrom));
			}
			else {
				const newTo = Object.assign({}, to);
				newTo.address = token.Address;
				newTo.symbol = token.Symbol;
				newTo.decimals = token.Decimals;
				updateBalance(token.Address, newTo, setTo)
					.then(() => resetQuote(null, newTo));
			}
		}
	}

	useEffect(() => {
		updateBalance(from.address, from, setFrom).then(() => {
			updateBalance(to.address, to, setTo).then(() => {
				setLoading();
				resetQuote();
			});
		});
	}, [account])

	if (account && !connected) {
		setConnected(true);
		setQuote();
		setReady();

		updateBalance(from.address, from, setFrom).then(() => {
			updateBalance(to.address, to, setTo).then(() => {
				setLoading();
				resetQuote();
			});
		});
	}

	if (!account && connected) {
		setConnected();

		resetBalances();
		resetQuote();
	}

	if (loading) {
		return (
			<div className="text-center p-5 w-100">
				<span className="spinner-border" role="status"></span>
			</div>
		);
	}

	const SubmitButton = () => {
		if (account) {
			if (!ready) {
				return <button className="default-btn w-100" disabled="disabled">Please wait...</button>;
			}
			else if (!(from.amount > 0 || to.amount > 0)) {
				return <button className="default-btn w-100" disabled="disabled">Enter an amount</button>;
			}
			else if (needApprove) {
				return <button className="default-btn w-100" disabled={!ready} onClick={() => approve(from.address)}>Approve</button>;
			}
			else if (error) {
				return <button className="default-btn w-100" disabled="disabled">{error}</button>;
			}
			else if (!confirmed) {
				return <button className="default-btn w-100" disabled={!ready} onClick={() => confirm()}>Confirm</button>;
			}
			else {
				return <button className="default-btn w-100" disabled={!ready} onClick={() => trade()}>Swap</button>;
			}
		}
		else {
			return <ConnectButton />;
		}
	};

	return (
		<>
			<div className="wallet-tabs wallet-tabs-h">
				<div className="tab">
					<ul className="tabs bg-need">
						<li>EXCHANGE</li>
					</ul>
					<div className="tab_content">
						<div className="tabs_item">
							<div className="exchange row">
								<div className='col'>
									<h3>EXCHANGE</h3>
									<p>Trade tokens in an instant</p>
								</div>
								<div className='col-auto'>
									Slippage: <input className='form-control d-inline-block' style={{ width: 70 }} step={0.5} type="number" autoComplete="off" onChange={onSlippageChange} min="0" max={49} value={slippage} />
								</div>
							</div>
							<div>
								<div className="form-group">
									<div className="row justify-content-between">
										<div className="col">
											<label htmlFor="from" className="w-100">From</label>
										</div>
										<div className="col text-end">
											<button data-balance={from.balance} onClick={e => fillMaxAmount(e, "from")} type="button" className="w-100 text-end badge btn text-white">Balance: {formatNumberWithoutComma(Number(from.balance))}</button>
										</div>
									</div>
									<div className="input-group">
										<input id="from" type="text" className="form-control me-2" placeholder="0" autoComplete="off" onChange={e => onAmountChange(e, "from")} min="0" max={from.balance} value={from.amount} />
										<div className="input-group-addon">
											<button type="button" className="default-btn" onClick={() => setShowTokenSelectModal("from")}>{from.symbol}</button>
										</div>
									</div>
								</div>
								<div className="form-group text-center">
									<button type="button" className="btn w-100 p-0 arrows" onClick={invert}><span className="fa fa-chevron-up" /> <span className="fa fa-chevron-down" /></button>
								</div>
								<div className="form-group">
									<div className="row justify-content-between">
										<div className="col">
											<label htmlFor="from" className="w-100">To</label>
										</div>
										<div className="col text-end">
											<button data-balance={to.balance} onClick={e => fillMaxAmount(e, "to")} type="button" className="w-100 text-end badge btn text-white">Balance: {formatNumberWithoutComma(Number(to.balance))}</button>
										</div>
									</div>
									<div className="input-group">
										<input id="from" type="text" className="form-control me-2" placeholder="0" autoComplete="off" onChange={e => onAmountChange(e, "to")} min="0" max={to.balance} value={to.amount} />
										<div className="input-group-addon">
											<button type="button" className="default-btn" onClick={() => setShowTokenSelectModal("to")}>{to.symbol}</button>
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
													{
														quote.side === "from"
															? <>
																<div className="col-6">
																	<label className="w-100">Guaranteed Price</label>
																</div>
																<div className="col-6 text-end pe-4 py-2">
																	<NumberFormat value={1 / quote.guaranteedPrice} decimalScale={numberHelper.calculatePricescale(1 / quote.guaranteedPrice)} displayType="text" thousandSeparator="," suffix={" " + from.symbol} />
																</div>
																<div className="col-6">
																	<label className="w-100">Guaranteed Price</label>
																</div>
																<div className="col-6 text-end pe-4 py-2">
																	<NumberFormat value={quote.guaranteedPrice} decimalScale={numberHelper.calculatePricescale(parseFloat(quote.guaranteedPrice))} displayType="text" thousandSeparator="," suffix={" " + to.symbol} />
																</div>
															</>
															: <>
																<div className="col-6">
																	<label className="w-100">Guaranteed Price</label>
																</div>
																<div className="col-6 text-end pe-4 py-2">
																	<NumberFormat value={quote.guaranteedPrice} decimalScale={numberHelper.calculatePricescale(parseFloat(quote.guaranteedPrice))} displayType="text" thousandSeparator="," suffix={" " + from.symbol} />
																</div>
																<div className="col-6">
																	<label className="w-100">Guaranteed Price</label>
																</div>

																<div className="col-6 text-end pe-4 py-2">
																	<NumberFormat value={1 / quote.guaranteedPrice} decimalScale={numberHelper.calculatePricescale(1 / quote.guaranteedPrice)} displayType="text" thousandSeparator="," suffix={" " + to.symbol} />
																</div>
															</>
													}
													<div className="col-6">
														<label className="w-100">Minimum Recieve</label>
													</div>
													<div className="col-6 text-end pe-4 py-2">
														<NumberFormat value={to.amount - (to.amount * slippage / 100)} decimalScale={numberHelper.calculateTokenscale(1 / quote.guaranteedPrice)} displayType="text" thousandSeparator="," suffix={" " + to.symbol} />
													</div>
													<div className="col-6">
														<label className="w-100">Estimated Fees</label>
													</div>
													<div className="col-6 text-end pe-4 py-2">
														{ethers.utils.formatUnits(BigNumber.from(quote.estimatedGas).mul(BigNumber.from(quote.gasPrice)).toString(), props.network.Currency.Decimals)} {props.network.Currency.Name}
													</div>
												</div>
											</div>
										</>
										:
										<></>
								}
								<div className="form-group btns">
									<SubmitButton />
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<TokenSelectModal
				showFor={showTokenSelectModal}
				hide={() => setShowTokenSelectModal()}
				onSelect={onSelectToken}
				network={props.network} />
		</>
	);
}

export { Exchange }