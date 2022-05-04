import React, { useEffect, useState/*, useCallback*/ } from 'react';
import Web3 from 'web3';
// import { multicall, useEthers } from '@usedapp/core';
import { /*singer, */ethers, BigNumber } from 'ethers';
import { Contract, Provider, setMulticallAddress } from 'ethers-multicall';
import { ConnectButtonModal } from '../ConnectButtonModal';
//import { ChainId, Token, TokenAmount, Fetcher, Pair, Route, Trade, TradeType, Percent } from '@pancakeswap-libs/sdk';
import tokenAbi from '../../../abis/token';
import dexManageAbi from '../../../abis/DEXManagement'
import wrappedAbi from '../../../abis/wrapped'

import { Requester } from "../../../requester";
import numberHelper from "../../../numberHelper";
import NumberFormat from "react-number-format";
import { TokenSelectModal } from './TokenSelectModal';
import { useSelector } from 'react-redux';
import * as selector from '../../../store/selectors';
import { /*getFullDisplayBalance, */formatNumberWithoutComma } from '../../../utils/number';
import qs from 'qs';

import '../../components.scss'

const PATH_WRAP_UNWRAP = 0;
const PATH_IS_IN_DEX = 1;
const PATH_IS_NOT_IN_DEX = 2;
const PATH_ERR = 3;

const Exchange = (props) => {
  const account = useSelector(selector.accountState);
  const provider = useSelector(selector.providerState);
  const web3Provider = useSelector(selector.web3ProviderState);
  const [connected, setConnected] = useState();
  const [loading, setLoading] = useState();
  const [ready, setReady] = useState();
  const [needApprove, setNeedApprove] = useState();
  const [quote, setQuote] = useState();
  const [confirmed, setConfirmed] = useState();
  const [pendingQuote, setPendingQuote] = useState();
  const [error, setError] = useState();
  const [showTokenSelectModal, setShowTokenSelectModal] = useState();

  const [isPath, setIsPath] = useState(PATH_WRAP_UNWRAP);

  const [from, setFrom] = useState({ symbol: props.fromSymbol, address: props.fromAddress, decimals: 0, amount: 0, balance: 0 });
  const [to, setTo] = useState({ symbol: props.toSymbol, address: props.toAddress, decimals: 0, amount: 0, balance: 0 });
  const [slippage, setSlippage] = useState(0.5);

  const validateQuote = async () => {
    // console.log("validateQuote");
    setError();

    var response = null;
    try {
      response = await Requester.getAsync(props.network.SwapApi + "swap/v1/quote", {
        sellToken: from.address === "-" ? props.network.Currency.Name : from.address,
        buyToken: to.address === "-" ? props.network.Currency.Name : to.address,
        sellAmount: ethers.utils.parseUnits(from.amount.toString(), from.decimals),
        slippagePercentage: slippage / 100,
        takerAddress: account
      });
    } catch (error) {

    }

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
    // console.log("updateQuote")
    setError();
    setConfirmed();

    if (amount > 0) {
      var response = null;
      if (isPath === PATH_WRAP_UNWRAP) {
        setConfirmed(true);
        return;
      } else if (isPath === PATH_IS_IN_DEX) {
        setConfirmed(true);

        if (sellTokenAddress !== "-") {
          const contract = new ethers.Contract(
            sellTokenAddress,
            tokenAbi,
            web3Provider
          );

          try {
            var allowance = await contract.allowance(account, props.network.DEX.DEXManage);
            // console.log("allowance: ", allowance)
          } catch { }
          const sellAmount = ethers.utils.parseUnits(amount.toString(), sellTokenDecimals);
          if (BigNumber.from(sellAmount).gt(allowance)) {
            setNeedApprove({ target: props.network.DEX.DEXManage, amount: sellAmount });
          }
          else {
            setNeedApprove();
          }

        } else {
          setNeedApprove();
        }
      } else {
        // Swap API
        try {
          if (side === "from") {
            response = await Requester.getAsync(props.network.SwapApi + "swap/v1/quote", {
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
        } catch (error) {

        }

        if (response) {
          if (response.price) {
            response.side = side;
            // console.log("response: ", response);
            setQuote(response);

            // console.log("pass: ", response.allowanceTarget);
            if (response.allowanceTarget !== "0x0000000000000000000000000000000000000000") {
              // console.log("pass if");
              // const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
              // console.log("from.address: ", from.address);
              // console.log("sellTokenAddress: ", sellTokenAddress);
              const contract = new ethers.Contract(
                sellTokenAddress,
                tokenAbi,
                // provider
                web3Provider
              );

              allowance = 0;
              try {
                allowance = await contract.allowance(account, response.allowanceTarget);
                // console.log("allowance: ", allowance)
              } catch { }

              if (BigNumber.from(response.sellAmount).gt(allowance)) {
                setNeedApprove({ target: response.allowanceTarget, amount: response.sellAmount });
              }
              else {
                setNeedApprove();
              }
            }
            else {
              // console.log("pass else");
              setNeedApprove();
            }
          }
        }
        else {
          setQuote();
        }

      }
    }

    return response;
  };

  const resetQuote = (overrideFrom, overrideTo, overrideSlippage) => {
    // console.log("resetQuote");
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

  const updateBalance = async (forContract, forTarget, setForTarget, setAmount = false) => {
    // console.log("updateBalance")
    const provider = new ethers.providers.JsonRpcProvider(props.network.RPC);
    if (props.network.chainId === 97) // When bsc testnet
    {
      setMulticallAddress(props.network.chainId, props.network.MulticallAddress);
    }
    const ethcallProvider = new Provider(provider);

    try {
      await ethcallProvider.init();

      if (ethers.utils.isAddress(account)) {
        var balance = 0;
        var decimals = 0;

        if (forContract !== "-") {
          const contract = new Contract(forContract, tokenAbi);
          [balance, decimals] = await ethcallProvider.all([
            contract.balanceOf(account),
            contract.decimals()
          ]);
        } else {
          balance = await provider.getBalance(account);
          decimals = props.network.Currency.Decimals;
        }

        const newTarget = Object.assign({}, forTarget);
        newTarget.balance = ethers.utils.formatUnits(balance, decimals);
        if (setAmount) {
          newTarget.amount = "";
        }
        newTarget.decimals = decimals;
        setForTarget(newTarget);
      } else {
        setForTarget(forTarget);
      }
    } catch (error) {
      setForTarget(forTarget);
      console.log("update balance err: ", error)
    }
  };

  const resetBalances = () => {
    // console.log("resetBalances");
    setFrom(Object.assign({}, from));
    setTo(Object.assign({}, to));
  };

  const approve = async (fromAddr) => {
    console.log("approve");
    setReady();

    // const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    const contract = new ethers.Contract(
      from.address,
      tokenAbi,
      web3Provider.getSigner()
      // provider.getSigner()
    );
    console.log("approve pass 1");

    try {
      // const tx = await contract.approve(needApprove.target, quote.sellAmount);
      const tx = await contract.approve(needApprove.target, needApprove.amount);
      const receipt = await tx.wait(tx);
      if (receipt.status === 1) {
        setNeedApprove();
      }
    } catch (err) {
      console.log("approve err: ", err);
    }
    console.log("approve pass 2");

    setReady(true);
  };

  const confirm = () => {
    // console.log("confirm");
    setReady();
    setConfirmed(true);
    if (isPath === PATH_IS_IN_DEX || isPath === PATH_WRAP_UNWRAP) {
      setReady(true);
      return;
    }
    validateQuote().then(() => {
      setReady(true);
    });
  }

  const trade = async () => {
    
    const params = {
      sellToken: (from.address === "-" ? from.symbol : from.address),
      buyToken: (to.address === "-" ? to.symbol : to.address),
      sellAmount: quote.sellAmount, // 1 ETH = 10^18 wei
      takerAddress: account,
    }

    setLoading(true);
    try {
      // Fetch the swap quote.
      const response = await fetch(
        `${props.network.SwapApi}swap/v1/quote?${qs.stringify(params)}`
      );

      const web3 = new Web3(provider);
      const ret = await response.json();
      await web3.eth.sendTransaction(ret);
    } catch (error) {
      console.log("trade error: ", error)
      if (error.code === 4001) {
        alert(`User denied transaction signature.`)
      }
    }

    updateBalance(from.address, from, setFrom, true).then(() => {
      updateBalance(to.address, to, setTo, true).then(() => {
        setLoading();
        resetQuote();
      });
    });
  }

  const wrapping = async () => {
    console.log("wrapping");
    const contract = new ethers.Contract(
      props.network.Currency.Address,
      wrappedAbi,
      web3Provider.getSigner()
    )
    setLoading(true);
    try {
      if (from.address === "-") {
        var options = { value: ethers.utils.parseUnits(from.amount.toString(), from.decimals) };
        var tx = await contract.deposit(options);
      } else if (from.address === props.network.Currency.Address) {
        tx = await contract.withdraw(ethers.utils.parseUnits(from.amount.toString(), from.decimals))
      } else {
        return;
      }
      const receipt = await tx.wait(tx);
      // console.log("receipt: ", receipt);
      updateBalance(from.address, from, setFrom, true).then(() => {
        updateBalance(to.address, to, setTo, true).then(() => {
        });
      });
      setLoading(false);
      if (receipt.status === 1) {
        alert(`wrapped success`);
      }
    } catch (error) {
      setLoading(false);
      console.log("wrapping error: ", error)
      if (error.code === 4001) {
        alert(`User denied transaction signature.`)
      } else {
        alert(`Something went wrong!`)
      }
    }
  }

  const invert = () => {
    // console.log("invert")
    const newFrom = Object.assign({}, to);
    const newTo = Object.assign({}, from);
    setFrom(newFrom);
    setTo(newTo);
    resetQuote(newFrom, newTo);
  }

  const fill = async (side, value) => {
    // console.log("fill")
    setReady();
    setError();
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

    console.log("pass of fill: isPath=", isPath)

    newOther.amount = "";
    // console.log("newOther.amount = ", parseFloat(newOther.amount))
    // console.log("NAN > 1: ", parseFloat(newOther.amount) > 1)

    if (isPath === PATH_WRAP_UNWRAP) {
      console.log("pass if of fill")
      newOther.amount = value;
      setOther(newOther);
      setReady(true);
    } else if (isPath === PATH_IS_IN_DEX && value > 0) {
      setConfirmed(true);

      const contract = new ethers.Contract(
        props.network.DEX.DEXManage,
        dexManageAbi,
        web3Provider
      )

      var sellAmount = ethers.utils.parseUnits(value.toString(), from.decimals);;
      if (side === "from") {
        try {
          const amountOut = await contract.getAmountOut(
            from.address === "-" ? props.network.Currency.Address : from.address,
            to.address === "-" ? props.network.Currency.Address : to.address,
            ethers.utils.parseUnits(value.toString(), from.decimals))
          newOther.amount = ethers.utils.formatUnits(amountOut, to.decimals);
        } catch (error) {
          setError("Unknown error");
          console.log("fill amountOut error: ", error)
        }
      } else {
        try {
          const amountIn = await contract.getAmountIn(
            from.address === "-" ? props.network.Currency.Address : from.address,
            to.address === "-" ? props.network.Currency.Address : to.address,
            ethers.utils.parseUnits(value.toString(), from.decimals))
          sellAmount = amountIn;
          newOther.amount = ethers.utils.formatUnits(amountIn, from.decimals);
        } catch (error) {
          setError("Unknown error");
          console.log("fill amountIn error: ", error)
        }
      }
      setOther(newOther);

      if (from.address !== "-") {
        const contract = new ethers.Contract(
          from.address,
          tokenAbi,
          web3Provider
        );

        try {
          var allowance = await contract.allowance(account, props.network.DEX.DEXManage);
          // console.log("allowance: ", allowance)
        } catch (error) {
          console.log("fill allowance error: ", error);
        }

        if (BigNumber.from(sellAmount).gt(allowance)) {
          setNeedApprove({ target: props.network.DEX.DEXManage, amount: sellAmount });
        }
        else {
          setNeedApprove();
        }

      } else {
        setNeedApprove();
      }

      setReady(true);
    } else {
      setOther(newOther);
      setQuote();

      if (pendingQuote) {
        clearTimeout(pendingQuote);
      }
      // console.log("L292")
      if (value > 0) {
        setPendingQuote(setTimeout(() => {
          // console.log("L295")
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

    if (side === "from") {
      if (parseFloat(value) > parseFloat(from.balance)) {
        setError(`Insufficient ${from.symbol} balance`)
      }
    } else {
      if (parseFloat(newOther.amount) > parseFloat(from.balance)) {
        setError(`Insufficient ${from.symbol} balance`)
      }
    }
  }

  const onAmountChange = (e, side) => {
    // console.log("onAmountChange")
    fill(side, e.target.value.replace(/[^0-9.]/g, ""));
  };

  const fillMaxAmount = (e, side) => {
    // console.log("fillMaxAmount")
    fill(side, e.target.dataset.balance);
  };

  const onSlippageChange = (e) => {
    // console.log("onSlippageChange")
    const value = e.target.value.replace(/[^0-9.]/g, "");
    setSlippage(value);
    resetQuote(null, null, value);
  };

  const onSelectToken = async (token, forTarget) => {
    // console.log("onSelectToken")
    if ((token.Address === to.address && forTarget === "from") || (token.Address === from.address && forTarget === "to")) {
      invert();
    }
    else {
      setLoading(true);
      if (forTarget === "from") {
        var tokenA = token.Address;
        var tokenB = to.address;
        const newFrom = Object.assign({}, from);
        newFrom.address = token.Address;
        newFrom.symbol = token.Symbol;
        newFrom.decimals = token.Decimals;
        updateBalance(token.Address, newFrom, setFrom, true).then(() => {
          updateBalance(to.address, to, setTo, true).then(() => {
            setLoading();
            resetQuote();
          });
        });

      }
      else {
        tokenA = from.address;
        tokenB = token.Address;
        const newTo = Object.assign({}, to);
        newTo.address = token.Address;
        newTo.symbol = token.Symbol;
        newTo.decimals = token.Decimals;
        updateBalance(token.Address, newTo, setTo, true).then(() => {
          updateBalance(from.address, from, setFrom, true).then(() => {
            setLoading();
            resetQuote();
          });
        });
      }

      const contract = new ethers.Contract(
        props.network.DEX.DEXManage,
        dexManageAbi,
        web3Provider
      );
      tokenA = tokenA === "-" ? props.network.Currency.Address : tokenA;
      tokenB = tokenB === "-" ? props.network.Currency.Address : tokenB;

      console.log("tokenA: ", tokenA)
      console.log("tokenB: ", tokenB)
      if ((tokenA === tokenB) && (tokenA === props.network.Currency.Address)) {
        setIsPath(PATH_WRAP_UNWRAP);
        console.log("isPathExists: ", PATH_WRAP_UNWRAP);
      } else {
        try {
          const ret = await contract.isPathExists(tokenA, tokenB);
          console.log("isPathExists: ", ret);
          if (ret) {
            setIsPath(PATH_IS_IN_DEX);
          } else {
            setIsPath(PATH_IS_NOT_IN_DEX);
          }
        } catch (error) {
          console.log("isPathExists err: ", error)
          setIsPath(PATH_ERR);
        }
      }

    }
  }

  useEffect(() => {
    const reloadFromToToken = async () => {
      const newFrom = {
        symbol: props.fromSymbol,
        address: props.fromAddress,
        decimals: 0,
        amount: "",
        balance: 0
      };

      const newTo = {
        symbol: props.toSymbol,
        address: props.toAddress,
        decimals: 0,
        amount: "",
        balance: 0
      };

      setLoading(true);
      updateBalance(newFrom.address, newFrom, setFrom, true).then(() => {
        updateBalance(newTo.address, newTo, setTo, true).then(() => {
          setLoading();
          resetQuote();
        });
      });
    }
    reloadFromToToken();
  }, [props.network, account])

  // useEffect(() => {
  // 	console.log("from token: ", from);
  // 	console.log("to token: ", to);
  // 	console.log("rpc token: ", props.network.RPC);
  // }, [from, to, props.network])

  // useEffect(() => {
  //   console.log("from address", from.address);
  //   console.log("to address", to.address);

  // }, [from.address, to.address])

  // useEffect(() => {

  // }, [])

  if (account && !connected) {
    // console.log("account && !connected")
    setConnected(true);
    setQuote();
    setReady();

    setLoading(true);
    updateBalance(from.address, from, setFrom).then(() => {
      updateBalance(to.address, to, setTo).then(() => {
        setLoading();
        resetQuote();
      });
    });
  }

  if (!account && connected) {
    // console.log("!account && connected")
    setConnected();

    resetBalances();
    resetQuote();
  }

  const SubmitButton = () => {
    // console.log("SubmitButton")
    if (account) {
      if (!ready) {
        return <button className="default-btn w-100" disabled="disabled">Please wait...</button>;
      }
      else if (!(from.amount > 0 || to.amount > 0)) {
        return <button className="default-btn w-100" disabled="disabled">Enter an amount</button>;
      }
      else if (error) {
        return <button className="default-btn w-100" disabled>{error}</button>;
      }
      else if (needApprove) {
        return <button className="default-btn w-100" disabled={!ready} onClick={() => approve(from.address)}>Approve</button>;
      }
      else if (isPath === PATH_WRAP_UNWRAP) {
        return <button className="default-btn w-100" disabled={!ready} onClick={() => wrapping()}>
          {to.address === "-" ? "Unwrap" : "Wrap"}
        </button>;
      }
      else if (!confirmed) {
        return <button className="default-btn w-100" disabled={!ready} onClick={() => confirm()}>Confirm</button>;
      }
      else {
        return <button className="default-btn w-100" disabled={!ready} onClick={() => trade()}>Swap</button>;
      }
    }
    else {
      return <ConnectButtonModal />;
    }
  };

  return (
    <>
      <div className={`wallet-tabs wallet-tabs-h ${loading ? "loading-state" : ""}`}>
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
                      <button
                        data-balance={from.balance}
                        onClick={e => fillMaxAmount(e, "from")}
                        type="button"
                        className="w-100 text-end badge btn text-white">
                        Balance: {formatNumberWithoutComma(Number(from.balance))}
                      </button>
                    </div>
                  </div>
                  <div className="input-group">
                    <input id="from" type="text" className="form-control me-2" placeholder="0" autoComplete="off" onChange={e => onAmountChange(e, "from")} min="0" max={from.balance} value={from.amount} />
                    <div className="input-group-addon">
                      <button type="button" className="default-btn"
                        onClick={() => setShowTokenSelectModal("from")}>
                        {from.symbol}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="form-group text-center">
                  <button type="button" className="btn w-100 p-0 arrows" onClick={invert}>
                    <span className="fa fa-chevron-up" /> <span className="fa fa-chevron-down" />
                  </button>
                </div>
                <div className="form-group">
                  <div className="row justify-content-between">
                    <div className="col">
                      <label htmlFor="from" className="w-100">To</label>
                    </div>
                    <div className="col text-end">
                      <button data-balance={to.balance}
                        onClick={e => fillMaxAmount(e, "to")}
                        type="button"
                        className="w-100 text-end badge btn text-white">
                        Balance: {formatNumberWithoutComma(Number(to.balance))}
                      </button>
                    </div>
                  </div>
                  <div className="input-group">
                    <input id="from" type="text" className="form-control me-2"
                      placeholder="0" autoComplete="off"
                      onChange={e => onAmountChange(e, "to")}
                      min="0" max={to.balance} value={to.amount} />
                    <div className="input-group-addon">
                      <button type="button" className="default-btn"
                        onClick={() => setShowTokenSelectModal("to")}>
                        {to.symbol}
                      </button>
                    </div>
                  </div>
                </div>
                {
                  quote && (from.amount !== 0 || to.amount !== 0) ?
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
                                  <NumberFormat value={1 / quote.guaranteedPrice}
                                    decimalScale={numberHelper.calculatePricescale(1 / quote.guaranteedPrice)}
                                    displayType="text"
                                    thousandSeparator=","
                                    suffix={" " + from.symbol} />
                                </div>
                                <div className="col-6">
                                  <label className="w-100">Guaranteed Price</label>
                                </div>
                                <div className="col-6 text-end pe-4 py-2">
                                  <NumberFormat value={quote.guaranteedPrice}
                                    decimalScale={numberHelper.calculatePricescale(parseFloat(quote.guaranteedPrice))}
                                    displayType="text" thousandSeparator="," suffix={" " + to.symbol} />
                                </div>
                              </>
                              : <>
                                <div className="col-6">
                                  <label className="w-100">Guaranteed Price</label>
                                </div>
                                <div className="col-6 text-end pe-4 py-2">
                                  <NumberFormat value={quote.guaranteedPrice}
                                    decimalScale={numberHelper.calculatePricescale(parseFloat(quote.guaranteedPrice))}
                                    displayType="text" thousandSeparator="," suffix={" " + from.symbol} />
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
                            <NumberFormat
                              value={to.amount - (to.amount * slippage / 100)}
                              decimalScale={numberHelper.calculateTokenscale(1 / quote.guaranteedPrice)}
                              displayType="text"
                              thousandSeparator=","
                              suffix={" " + to.symbol} />
                          </div>
                          <div className="col-6">
                            <label className="w-100">Estimated Fees</label>
                          </div>
                          <div className="col-6 text-end pe-4 py-2">
                            {ethers.utils.formatUnits(
                              BigNumber.from(quote.estimatedGas)
                                .mul(BigNumber.from(quote.gasPrice)).toString(),
                              props.network.Currency.Decimals)}
                            {props.network.Currency.Name}
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
      {loading ?
        <div style={{
          position: "fixed",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          top: "0px", left: "0px",
          height: "100%", width: "100%",
          zIndex: 100000, opacity: 0.8
        }}>
          <span className="spinner-border" role="status"></span>
        </div>
        : ""
      }
      <TokenSelectModal
        showFor={showTokenSelectModal}
        hide={() => setShowTokenSelectModal()}
        onSelect={onSelectToken}
        network={props.network} />

    </>
  );
}

export { Exchange }