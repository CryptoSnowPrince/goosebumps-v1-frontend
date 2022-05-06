import React, { useEffect, useState/*, useCallback*/ } from 'react';
// import Web3 from 'web3';
// import { multicall, useEthers } from '@usedapp/core';
import { /*singer, */ethers, BigNumber } from 'ethers';
import { Contract, Provider, setMulticallAddress } from 'ethers-multicall';
import { ConnectButtonModal } from '../ConnectButtonModal';
//import { ChainId, Token, TokenAmount, Fetcher, Pair, Route, Trade, TradeType, Percent } from '@pancakeswap-libs/sdk';
import tokenAbi from '../../../abis/token';
import dexManageAbi from '../../../abis/DEXManagement'
import wrappedAbi from '../../../abis/wrapped'

// import simpleAbi from '../../../abis/SimpleTokenSwap'

import config from '../../../constants/config'

import { Requester } from "../../../requester";
import numberHelper from "../../../numberHelper";
import NumberFormat from "react-number-format";
import { TokenSelectModal } from './TokenSelectModal';
import { useSelector } from 'react-redux';
import * as selector from '../../../store/selectors';
import { /*getFullDisplayBalance, */formatNumberWithoutComma } from '../../../utils/number';
// import qs from 'qs';

import '../../components.scss'

const PATH_WRAP_UNWRAP = 0;
const PATH_IS_IN_DEX = 1;
const PATH_IS_NOT_IN_DEX = 2;
const PATH_ERR = 3;

const Exchange = (props) => {
  const account = useSelector(selector.accountState);
  // const provider = useSelector(selector.providerState);
  const web3Provider = useSelector(selector.web3ProviderState);
  // const [connected, setConnected] = useState();
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
        // take swapFee0x
        sellAmount: ethers.utils.parseUnits((parseFloat(from.amount) * (10000 - config.SWAP_FEE_0X) / 10000).toString(), from.decimals),
        slippagePercentage: slippage / 100
        // takerAddress: props.network.DEX1.DEXManage
      });
    } catch (error) {

    }

    console.log("validateQuote response: ", response)

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
        console.log("updateQuote PATH_WRAP_UNWRAP")
        setConfirmed(true);
        return;
      } else if (isPath === PATH_IS_IN_DEX) {
        console.log("updateQuote PATH_IS_IN_DEX")
        // can't come from "fill" here
        // can come here othercase, but in these case, side is "from", so, amount == sellAmount
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
        console.log("updateQuote Swap API")
        try {
          if (side === "from") {
            response = await Requester.getAsync(props.network.SwapApi + "swap/v1/quote", {
              sellToken: sellTokenAddress === "-" ? props.network.Currency.Name : sellTokenAddress,
              buyToken: buyTokenAddress === "-" ? props.network.Currency.Name : buyTokenAddress,
              // take swapFee0x
              sellAmount: ethers.utils.parseUnits((parseFloat(amount) * (10000 - config.SWAP_FEE_0X) / 10000).toString(), sellTokenDecimals),
              slippagePercentage: slippage / 100,
            });
          }
          else {
            // can come from "fill" here
            response = await Requester.getAsync(props.network.SwapApi + "swap/v1/quote", {
              sellToken: sellTokenAddress === "-" ? props.network.Currency.Name : sellTokenAddress,
              buyToken: buyTokenAddress === "-" ? props.network.Currency.Name : buyTokenAddress,
              buyAmount: ethers.utils.parseUnits(amount.toString(), buyTokenDecimals),
              slippagePercentage: slippage / 100,
            });
          }
        } catch (error) {

        }

        if (response) {
          if (response.price) {
            // console.log("response before: ", response);
            response.side = side;
            if (side === "to") {
              // add swapFee0x
              response.sellAmount = BigNumber.from(response.sellAmount).mul(10000).div(10000 - config.SWAP_FEE_0X);
            }
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
                // allowance = await contract.allowance(account, response.allowanceTarget);
                allowance = await contract.allowance(account, props.network.DEX.DEXManage);
                // console.log("allowance: ", allowance)
              } catch { }

              if (BigNumber.from(response.sellAmount).gt(allowance)) {
                setNeedApprove({ target: props.network.DEX.DEXManage, amount: response.sellAmount });
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

    if (parseFloat(_from.amount) > 0) {
      setPendingQuote(setTimeout(() => {
        updateQuote(_from.address, _from.decimals, _to.address, _to.decimals, _from.amount, overrideSlippage ? overrideSlippage : slippage, "from").then(quote => {
          setReady(true);
        });
        setPendingQuote();
      }, 1500));
    }
    // else if (parseFloat(_to.amount) > 0) {
    //   setPendingQuote(setTimeout(() => {
    //     updateQuote(_from.address, _from.decimals, _to.address, _to.decimals, _to.amount, overrideSlippage ? overrideSlippage : slippage, "to").then(quote => {
    //       setReady(true);
    //     });
    //     setPendingQuote();
    //   }, 1500));
    // }
    else {
      setReady(true);
    }
  };

  const updateBalance = async (forContract, forTarget, setForTarget, setAmount = false) => {
    console.log("updateBalance")
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
    // console.log("approve");
    setReady();

    // const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    const contract = new ethers.Contract(
      from.address,
      tokenAbi,
      web3Provider.getSigner()
      // provider.getSigner()
    );

    try {
      // const tx = await contract.approve(needApprove.target, quote.sellAmount);

      // const tx = await contract.approve(needApprove.target, needApprove.amount);

      // Max Approve
      const maxInt = BigNumber.from(2).pow(256).sub(1);
      console.log("maxInt: ", maxInt);

      const tx = await contract.approve(needApprove.target, maxInt);
      const receipt = await tx.wait(tx);
      if (receipt.status === 1) {
        setNeedApprove();
      }
    } catch (err) {
      console.log("approve err: ", err);
    }

    setReady(true);
  };

  const confirm = () => {
    // console.log("confirm");
    setReady();
    setConfirmed(true);
    if (isPath === PATH_IS_IN_DEX || isPath === PATH_WRAP_UNWRAP) {
      setReady(true);
      return;
    } else {
      validateQuote().then(() => {
        setReady(true);
      });
    }
  }

  const trade = async () => {
    setLoading(true);
    var tx;
    var receipt;
    try {
      const contract = new ethers.Contract(
        props.network.DEX.DEXManage,
        dexManageAbi,
        web3Provider.getSigner()
      )

      var nowTimestamp = (await web3Provider.getBlock()).timestamp;

      if (isPath === PATH_IS_IN_DEX) {
        try {
          if (from.address === "-") {
            var options = { value: ethers.utils.parseUnits(from.amount.toString(), from.decimals) };
            tx = await contract.swapExactETHForTokens(
              to.address,
              ethers.utils.parseUnits((parseFloat(to.amount) * (100 - slippage) / 100).toString(), to.decimals),
              account,
              nowTimestamp + config.SWAP_DEADLINE,
              options
            );
          } else if (to.address === "-") {
            tx = await contract.swapExactTokenForETH(
              from.address,
              ethers.utils.parseUnits(from.amount.toString(), from.decimals),
              ethers.utils.parseUnits((parseFloat(to.amount) * (100 - slippage) / 100).toString(), to.decimals),
              account,
              nowTimestamp + config.SWAP_DEADLINE
            )
          } else {
            tx = await contract.swapExactTokensForTokens(
              from.address,
              to.address,
              ethers.utils.parseUnits(from.amount.toString(), from.decimals),
              ethers.utils.parseUnits((parseFloat(to.amount) * (100 - slippage) / 100).toString(), to.decimals),
              account,
              nowTimestamp + config.SWAP_DEADLINE
            )
          }
        } catch (error) {
          console.log("trade on DEX error: ", error)
          if (error.code === 4001) {
            alert(`User denied transaction signature.`)
          }
        }
      } else {
        // trade on 0x protocol
        // console.log("quote: ", quote);
        try {
          if (quote.data) {
            // console.log(quote.data);
            const reQuote = await Requester.getAsync(props.network.SwapApi + "swap/v1/quote", {
              sellToken: from.address === "-" ? props.network.Currency.Name : from.address,
              buyToken: to.address === "-" ? props.network.Currency.Name : to.address,
              // take swapFee0x
              sellAmount: ethers.utils.parseUnits((parseFloat(from.amount) * (10000 - config.SWAP_FEE_0X) / 10000).toString(), from.decimals),
              slippagePercentage: slippage / 100
            });
            console.log("reQuote: ", reQuote);

            if (from.address === "-") {
              tx = await contract.swapExactETHForTokensOn0x(
                reQuote.buyTokenAddress,
                reQuote.to,
                reQuote.data,
                account,
                nowTimestamp + config.SWAP_DEADLINE,
                { value: ethers.utils.parseUnits((from.amount).toString(), from.decimals) }
              )
            } else if (to.address === "-") {
              tx = await contract.swapExactTokenForETHOn0x(
                reQuote.sellTokenAddress,
                ethers.utils.parseUnits((from.amount).toString(), from.decimals),
                reQuote.allowanceTarget,
                reQuote.to,
                reQuote.data,
                account,
                nowTimestamp + config.SWAP_DEADLINE
              )
            } else {
              tx = await contract.swapExactTokensForTokensOn0x(
                reQuote.sellTokenAddress,
                reQuote.buyTokenAddress,
                ethers.utils.parseUnits((from.amount).toString(), from.decimals),
                reQuote.allowanceTarget,
                reQuote.to,
                reQuote.data,
                account,
                nowTimestamp + config.SWAP_DEADLINE
              )
            }
          }
          // const params = {
          //   sellToken: (from.address === "-" ? from.symbol : from.address),
          //   buyToken: (to.address === "-" ? to.symbol : to.address),
          //   sellAmount: quote.sellAmount, // 1 ETH = 10^18 wei
          //   takerAddress: account,
          // }

          // // Fetch the swap quote.
          // const response = await fetch(
          //   `${props.network.SwapApi}swap/v1/quote?${qs.stringify(params)}`
          // );

          // const web3 = new Web3(provider);
          // const ret = await response.json();
          // console.log("await response.json()", ret);
          // tx = await web3.eth.sendTransaction(ret);
          // tx = await web3.eth.sendTransaction(ret);
        } catch (error) {
          console.log("trade on 0x API error: ", error)
          if (error.code === 4001) {
            alert(`User denied transaction signature.`)
          }
        }
      }
      receipt = await tx.wait(tx);
      if (receipt.status === 1) {
        alert("trade sucess");
        updateBalance(from.address, from, setFrom, true).then(() => {
          updateBalance(to.address, to, setTo, true).then(() => {
            resetQuote();
          });
        });
      }
    } catch (error) {
      console.log("trade error: ", error)
    }
    setLoading();
  }


  // Wait for a web3 tx `send()` call to be mined and return the receipt.

  // function waitForTxSuccess(tx) {
  //   return new Promise((accept, reject) => {
  //     try {
  //       tx.on('error', err => reject(err));
  //       tx.on('receipt', receipt => accept(receipt));
  //     } catch (err) {
  //       reject(err);
  //     }
  //   });
  // }

  // function createQueryString(params) {
  //   return Object.entries(params).map(([k, v]) => `${k}=${v}`).join('&');
  // }

//   const tradeTest = async () => {
//     try {

//       console.log("tradeTest: ");
//       const contract = new ethers.Contract(props.network.DEX.SimpleTokenSwap, simpleAbi, web3Provider.getSigner());
//       const sellAmount = ethers.utils.parseUnits("1", 6);
//       var nowTimestamp = (await web3Provider.getBlock()).timestamp;
//       const quote = await Requester.getAsync(props.network.SwapApi + "swap/v1/quote", {
//         sellToken: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
//         buyToken: "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
//         sellAmount: sellAmount, // 1 ETH = 10^18 wei
//         slippagePercentage: slippage / 100
//       });

//       var receipt = await contract.swapExactTokensForTokensOn0x(
//         quote.sellTokenAddress,
//         quote.buyTokenAddress,
//         ethers.utils.parseUnits("1.05", 6),
//         // quote.sellAmount,
//         quote.allowanceTarget,
//         quote.to,
//         quote.data,
//         account,
//         nowTimestamp + config.SWAP_DEADLINE,
//         {
//           from: account,
//           // value: quote.value,
//           // gasPrice: quote.gasPrice,
//         });
//       receipt = await receipt.wait(receipt);

//       const boughtAmount = ethers.utils.formatUnits(receipt.events.BoughtTokens.returnValues.boughtAmount, 6);
//       console.info(`${'✔'} Successfully sold ${'1'} WETH for ${boughtAmount} USDT!`);





//       /*
//       // const web3 = new Web3(provider);
//       // const contract = new web3.eth.Contract(simpleAbi, props.network.DEX.SimpleTokenSwap);

//       const contract = new ethers.Contract(props.network.DEX.SimpleTokenSwap, simpleAbi, web3Provider.getSigner());

//       // Convert sellAmount from token units to wei.
//       const sellAmountWei = ethers.utils.parseUnits("1", 6);
//       var nowTimestamp = (await web3Provider.getBlock()).timestamp;

//       // Deposit some WETH into the contract. This function accepts ETH and
//       // wraps it to WETH on the fly.
//       // console.info(`Depositing 1 MATIC (WMATIC) into the contract at ${props.network.DEX.SimpleTokenSwap}...`);
//       // await waitForTxSuccess(contract.methods.depositETH().send({
//       //   value: sellAmountWei,
//       //   from: account,
//       // }));

//       // Get a quote from 0x-API to sell the WETH we just deposited into the contract.
//       console.info(`custom...`);
//       const qs = createQueryString({
//         sellToken: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
//         buyToken: "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
//         sellAmount: sellAmountWei,
//       });
//       const quoteUrl = `${props.network.SwapApi}swap/v1/quote?${qs}`;
//       console.info(`Fetching quote ${quoteUrl}...`);
//       const response = await fetch(quoteUrl);
//       const quote = await response.json();
//       console.info(`Received a quote with price ${quote.price}`);

//       // Have the contract fill the quote, selling its own WETH.
//       console.info(`Custom...`);
//       // var receipt = await contract.methods.swapExactTokensForTokensOn0x(
//       var receipt = await contract.swapExactTokensForTokensOn0x(
//         quote.sellTokenAddress,
//         quote.buyTokenAddress,
//         quote.sellAmount,
//         quote.allowanceTarget,
//         quote.to,
//         quote.data,
//         account,
//         nowTimestamp + config.SWAP_DEADLINE,
//         {
//           from: account,
//           // value: quote.value,
//           // gasPrice: quote.gasPrice,
//         });
//         receipt = await receipt.wait(receipt);

//       // var receipt = await waitForTxSuccess(contract.methods.fillQuote(
//       //   quote.sellTokenAddress,
//       //   quote.buyTokenAddress,
//       //   quote.allowanceTarget,
//       //   quote.to,
//       //   quote.data,
//       // ).send({
//       //   from: account,
//       //   value: quote.value,
//       //   // gasPrice: quote.gasPrice,
//       // }));

//       const boughtAmount = ethers.utils.formatUnits(receipt.events.BoughtTokens.returnValues.boughtAmount, 6);
//       console.info(`${'✔'} Successfully sold ${'1'} WETH for ${boughtAmount} USDT!`);
//       // The contract now has `boughtAmount` of USDT!
// */
//     } catch (error) {
//       console.log("tradeTest err: ", error);
//     }
//   }


  const wrapping = async () => {
    console.log("wrapping");
    var msg = "Wrapping"
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
        msg = "Unwrapping";
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
        alert(`${msg} success`);
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
    setLoading(false);
  }

  const invert = () => {
    // console.log("invert")
    const newFrom = Object.assign({}, to);
    const newTo = Object.assign({}, from);
    newFrom.amount = "";
    newTo.amount = "";
    setFrom(newFrom);
    setTo(newTo);
    resetQuote(newFrom, newTo);
  }

  const fill = async (side, value) => {
    // console.log("fill")
    // const test = "";
    // console.log("parseFloat(test)=", parseFloat(test));
    // console.log("isNaN(parseFloat(test))=", isNaN(parseFloat(test)));
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

      var sellAmount = ethers.utils.parseUnits(value.toString(), from.decimals);
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

      if (isNaN(parseFloat(newOther.amount)) || parseFloat(newOther.amount) <= 0) {
        setError("Unknown error");
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
    if (value > 49) {
      alert(`Slippage is too high.`)
      setSlippage(49);
    } else if (value < 0) {
      alert(`Slip must be greater than or equal to 0.`)
      setSlippage(0);
    } else {
      setSlippage(value);
    }
    console.log("slippage value: ", value);
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
      if (
        (tokenA.toLowerCase() === tokenB.toLowerCase()) &&
        (tokenA.toLowerCase() === props.network.Currency.Address.toLowerCase())
      ) {
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

      // setLoading(true);
      updateBalance(newFrom.address, newFrom, setFrom, true).then(() => {
        updateBalance(newTo.address, newTo, setTo, true).then(() => {
          // setLoading();
          resetQuote();
        });
      });
    }
    reloadFromToToken();
    if (ethers.utils.isAddress(account)) {
      setQuote();
      setReady();
    } else {
      resetBalances();
      resetQuote();
    }
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

  // if (account && !connected) {
  //   // console.log("account && !connected")
  //   setConnected(true);
  //   setQuote();
  //   setReady();

  //   setLoading(true);
  //   updateBalance(from.address, from, setFrom).then(() => {
  //     updateBalance(to.address, to, setTo).then(() => {
  //       setLoading();
  //       resetQuote();
  //     });
  //   });
  // }

  // if (!account && connected) {
  //   // console.log("!account && connected")
  //   setConnected();

  //   resetBalances();
  //   resetQuote();
  // }

  const SubmitButton = () => {
    // console.log("SubmitButton")
    if (account) {
      // return <button className="default-btn w-100" disabled={!ready} onClick={() => tradeTest()}>tradeTest</button>;
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
                  Slippage:
                  <input className='form-control d-inline-block'
                    style={{ width: 80 }} step={0.5} type="number"
                    autoComplete="off" onChange={onSlippageChange}
                    min="0" max={49} value={slippage} />
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
                            <label className="w-100">Minimum Receive</label>
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
