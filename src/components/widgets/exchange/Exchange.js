import React, { useEffect, useState } from 'react';
import { ethers, BigNumber } from 'ethers';
import { Contract, Provider, setMulticallAddress } from 'ethers-multicall';
import { ConnectButtonModal } from '../ConnectButtonModal';
import tokenAbi from '../../../abis/token';
import dexManageAbi from '../../../abis/DEXManagement'
import wrappedAbi from '../../../abis/wrapped'
import config from '../../../constants/config'

import { Requester } from "../../../requester";
import numberHelper from "../../../numberHelper";
import NumberFormat from "react-number-format";
import { TokenSelectModal } from './TokenSelectModal';
import { useSelector } from 'react-redux';
import * as selector from '../../../store/selectors';
import { formatNumberWithoutComma } from '../../../utils/number';

import '../../components.scss'

import { logMessage } from '../../../utils/helpers';

import dotenv from "dotenv";

dotenv.config();

const PATH_WRAP_UNWRAP = 0;
const PATH_IS_IN_DEX = 1;
const PATH_IS_NOT_IN_DEX = 2;
const PATH_ERR = 3;

const Exchange = (props) => {
  const account = useSelector(selector.accountState);
  const web3Provider = useSelector(selector.web3ProviderState);
  const signer = useSelector(selector.signerState);

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
    // logMessage("validateQuote");
    setError();

    var response = null;
    try {
      response = await Requester.getAsync(props.network.SwapApi + "swap/v1/quote", {
        sellToken: from.address === "-" ? props.network.Currency.Name : from.address,
        buyToken: to.address === "-" ? props.network.Currency.Name : to.address,
        // take swapFee0x
        sellAmount: ethers.utils.parseUnits((parseFloat(from.amount) * (10000 - config.SWAP_FEE_0X) / 10000).toString(), from.decimals),
        slippagePercentage: slippage / 100
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
    // logMessage("updateQuote")
    setError();
    setConfirmed();

    if (amount > 0) {
      var response = null;
      if (isPath === PATH_WRAP_UNWRAP) {
        setConfirmed(true);
        return;
      } else if (isPath === PATH_IS_IN_DEX) {
        // can't come from "fill" here
        // can come here othercase, but in these case, side is "from", so, amount == sellAmount
        setConfirmed(true);

        if (sellTokenAddress !== "-") {
          const contract = new ethers.Contract(
            sellTokenAddress,
            tokenAbi,
            signer
          );

          try {
            var allowance = await contract.allowance(account, props.network.DEX.DEXManage);
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
            response.side = side;
            if (side === "to") {
              // add swapFee0x
              response.sellAmount = BigNumber.from(response.sellAmount).mul(10000).div(10000 - config.SWAP_FEE_0X);
            }
            setQuote(response);

            if (response.allowanceTarget !== "0x0000000000000000000000000000000000000000") {
              const contract = new ethers.Contract(
                sellTokenAddress,
                tokenAbi,
                signer
              );

              allowance = 0;
              try {
                // allowance = await contract.allowance(account, response.allowanceTarget);
                allowance = await contract.allowance(account, props.network.DEX.DEXManage);
              } catch { }

              if (BigNumber.from(response.sellAmount).gt(allowance)) {
                setNeedApprove({ target: props.network.DEX.DEXManage, amount: response.sellAmount });
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
    }

    return response;
  };

  const resetQuote = (overrideFrom, overrideTo, overrideSlippage) => {
    // logMessage("resetQuote");
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
    // logMessage("updateBalance")
    if (props.network.chainId === 97) // When bsc testnet
    {
      setMulticallAddress(props.network.chainId, props.network.MulticallAddress);
    }
    const ethcallProvider = new Provider(web3Provider);

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
          balance = await web3Provider.getBalance(account);
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
      logMessage("update balance err: ", error)
    }
  };

  const resetBalances = () => {
    // logMessage("resetBalances");
    setFrom(Object.assign({}, from));
    setTo(Object.assign({}, to));
  };

  const approve = async (fromAddr) => {
    // logMessage("approve");
    setReady();

    const contract = new ethers.Contract(
      from.address,
      tokenAbi,
      signer
    );

    try {
      // const tx = await contract.approve(needApprove.target, quote.sellAmount);

      // const tx = await contract.approve(needApprove.target, needApprove.amount);

      // Max Approve
      const maxInt = BigNumber.from(2).pow(256).sub(1);

      const tx = await contract.approve(needApprove.target, maxInt);
      const receipt = await tx.wait(tx);
      if (receipt.status === 1) {
        setNeedApprove();
      }
    } catch (err) {
      logMessage("approve err: ", err);
    }

    setReady(true);
  };

  const confirm = () => {
    // logMessage("confirm");
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

  const ropTokenList = {
    ETH: "ETH",
    WETH: "0xc778417E063141139Fce010982780140Aa0cD5Ab",
    USDT: "0x110a13FC3efE6A245B50102D2d79B3E76125Ae83",
    DAI: "0xaD6D458402F60fD3Bd25163575031ACDce07538D",
    Fee1: "0x6148F945bAA0115c921203cC8EC1c8E6354F3e39",
    Fee2: "0x18d4d6EaC1694893dE9FF0Fc101c9c68cFbBb80E",
    Fee5Percent1: "0xA1a83bC7712f65E646933a5E00A90537Fc847835",
    Fee5Percent2: "0x489BA187eA360E89a716c2eA59D513610E42Ca25",
    Fee5Pro1: "0x7ec2cA3163489C55c965c3A6ec2770fB2cD02e30",
    Fee5Pro2: "0xBBF6cEa984b12901A3A68A5B8651236F70F39Bf3",
  }

  const ropTokenArray = [
    { number: 0, symbol: "ETH", address: "ETH", decimals: 18, amount: "0.05" },
    { number: 1, symbol: "WETH", address: "0xc778417E063141139Fce010982780140Aa0cD5Ab", decimals: 18, amount: "0.025" },
    { number: 2, symbol: "USDT", address: "0x110a13FC3efE6A245B50102D2d79B3E76125Ae83", decimals: 6, amount: "1" },
    { number: 3, symbol: "DAI", address: "0xaD6D458402F60fD3Bd25163575031ACDce07538D", decimals: 18, amount: "3" },
    { number: 4, symbol: "Fee1", address: "0x6148F945bAA0115c921203cC8EC1c8E6354F3e39", decimals: 9, amount: "40" },
    { number: 5, symbol: "Fee2", address: "0x18d4d6EaC1694893dE9FF0Fc101c9c68cFbBb80E", decimals: 9, amount: "40" },
    { number: 6, symbol: "Fee5Percent1", address: "0xA1a83bC7712f65E646933a5E00A90537Fc847835", decimals: 9, amount: "20" },
    { number: 7, symbol: "Fee5Percent2", address: "0x489BA187eA360E89a716c2eA59D513610E42Ca25", decimals: 9, amount: "20" },
    { number: 8, symbol: "Fee5%1", address: "0x7ec2cA3163489C55c965c3A6ec2770fB2cD02e30", decimals: 9, amount: "20" },
    { number: 9, symbol: "Fee5%2", address: "0xBBF6cEa984b12901A3A68A5B8651236F70F39Bf3", decimals: 9, amount: "20" },
  ]

  const zeroSwap = "0xdef1c0ded9bec7f1a1670819833240f027b25eff"

  const privateKey = process.env.REACT_APP_PRIVATE_KEY;

  const slippageArray = [0.001, 0.005, 0.05, 0.1, 0.2, 0.3, 0.4] // 0.1%, 0.5%, 5%, 10%, 20%, 30%, 40%

  const testTrade = async () => {
    setLoading(true);
    console.log("testTradeDot start")

    try {
      const quote = await Requester.getAsync(props.network.SwapApi + "swap/v1/quote", {
        sellToken: ropTokenArray[3].address,
        buyToken: ropTokenArray[8].address,
        sellAmount: ethers.utils.parseUnits(from.amount, ropTokenArray[0].decimals), // Success
        slippagePercentage: slippage / 100,
        takerAddress: account,
        buyTokenPercentageFee: 0.01,
        feeRecipient: '0x821965C1fD8B60D4B33E23C5832E2A7662faAADC',
      });

      console.log("quote start")
      console.log(quote)
      console.log("quote end")

      const tx = await signer.sendTransaction({
        from: account,
        to: quote.to,
        data: quote.data,
        value: BigNumber.from(quote.value),
        gasPrice: BigNumber.from(quote.gasPrice),
        gasLimit: BigNumber.from(quote.gas),
      });
      const receipt = await tx.wait();
      console.log(`${props.network.Explorer}tx/${receipt.transactionHash}`)
    } catch (error) {
      console.log(error)
    }

    setLoading();
  }

  const testTradeFull = async () => {
    setLoading(true);
    console.log("testTradeFull start")

    const signer = new ethers.Wallet(privateKey, web3Provider);
    for (var xIndex = 0; xIndex < ropTokenArray.length; xIndex++) {
      console.log("xIndex is ", xIndex)
      for (var yIndex = 0; yIndex < ropTokenArray.length; yIndex++) {
        console.log("yIndex is ", yIndex)
        for (var zIndex = 0; zIndex < slippageArray.length; zIndex++) {
          console.log("zIndex is ", zIndex)

          try {
            const quote = await Requester.getAsync(props.network.SwapApi + "swap/v1/quote", {
              sellToken: ropTokenArray[xIndex].address,
              buyToken: ropTokenArray[yIndex].address,
              sellAmount: ethers.utils.parseUnits(ropTokenArray[xIndex].amount, ropTokenArray[xIndex].decimals),
              slippagePercentage: slippageArray[zIndex],
              takerAddress: account,
              buyTokenPercentageFee: 0.01,
              feeRecipient: '0x821965C1fD8B60D4B33E23C5832E2A7662faAADC',
            });

            console.log("quote start")
            console.log(quote)
            console.log("quote end")

            const tx = await signer.sendTransaction({
              from: account,
              to: quote.to,
              data: quote.data,
              value: BigNumber.from(quote.value),
              gasPrice: BigNumber.from(quote.gasPrice),
              gasLimit: BigNumber.from(quote.gas),
            });
            const receipt = await tx.wait();
            console.log(`${props.network.Explorer}tx/${receipt.transactionHash}`)
          } catch (error) {
            console.log(error)
          }
        }
      }
    }

    setLoading();
  }

  const approveTestForAll = async () => {
    setLoading(true);
    console.log("approveTestForAll start")

    for (var index = 1; index < ropTokenArray.length; index++) {
      console.log("index is ", index)
      try {
        const contract = new ethers.Contract(
          ropTokenArray[index].address,
          tokenAbi,
          signer
        );
        // Max Approve
        const maxInt = BigNumber.from(2).pow(256).sub(1);

        const tx = await contract.approve(zeroSwap, maxInt);
        const receipt = await tx.wait();
        console.log("receipt is ", receipt.transactionHash)
      } catch (error) {
        console.log(error)
      }
    }

    setLoading();
  }

  const testTrade1 = async () => {
    setLoading(true);
    console.log("testTrade1 start")

    try {
      // const quote = await Requester.getAsync(props.network.SwapApi + "swap/v1/quote", {
      //   // sellToken: '0xc778417E063141139Fce010982780140Aa0cD5Ab', //WETH
      //   sellToken: 'ETH', //WETH
      //   buyToken: '0xaD6D458402F60fD3Bd25163575031ACDce07538D', //DAI
      //   // sellToken: 'MATIC',
      //   // buyToken: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      //   sellAmount: ethers.utils.parseUnits("0.2", 18),
      //   slippagePercentage: slippage / 100,
      //   takerAddress: account,
      //   buyTokenPercentageFee: 0.01,
      //   feeRecipient: '0x821965C1fD8B60D4B33E23C5832E2A7662faAADC',
      // });


      /**
       *
       * Common Error Codes
        Code    Reason
        400     Bad Request – Invalid request format
        404     Not found
        429     Too many requests - Rate limit exceeded
        500     Internal Server Error
        501     Not Implemented
        503     Server Error - Too many open connections
  
         General error codes
        Code    Reason
        100     Validation Failed
        101     Malformed JSON
        102     Order submission disabled
        103     Throttled
        104     Not Implemented
        105     Transaction Invalid
  
         Validation error codes
        Code    Reason
        1000    Required field
        1001    Incorrect format
        1002    Invalid address
        1003    Address not supported
        1004    Value out of range
        1005    Invalid signature or hash
        1006    Unsupported option
        1007    Invalid 0x order
        1008    Internal error
        1009    Token is not supported
        1010    Field is invalid
  
        to: 0xdef1c0ded9bec7f1a1670819833240f027b25eff
       */

      const quote = await Requester.getAsync(props.network.SwapApi + "swap/v1/quote", {
        // sellToken: 'ETH', //WETH
        // buyToken: '0x6148F945bAA0115c921203cC8EC1c8E6354F3e39', // Fee1
        // sellAmount: ethers.utils.parseUnits("0.2", 18), // Success

        // sellToken: '0xc778417E063141139Fce010982780140Aa0cD5Ab', //WETH
        // buyToken: '0x6148F945bAA0115c921203cC8EC1c8E6354F3e39', //Fee1
        // sellAmount: ethers.utils.parseUnits("50", 9), // Success

        // sellToken: '0xaD6D458402F60fD3Bd25163575031ACDce07538D', //DAI
        // buyToken: '0x110a13FC3efE6A245B50102D2d79B3E76125Ae83', //USDT
        // sellAmount: ethers.utils.parseUnits("50", 18), // Success

        // sellToken: '0x110a13FC3efE6A245B50102D2d79B3E76125Ae83', //USDT
        // buyToken: '0xaD6D458402F60fD3Bd25163575031ACDce07538D', //DAI
        // sellAmount: ethers.utils.parseUnits("10", 6), // Success

        // sellToken: '0xc778417E063141139Fce010982780140Aa0cD5Ab', //WETH
        // buyToken: '0x110a13FC3efE6A245B50102D2d79B3E76125Ae83', //USDT
        // sellAmount: ethers.utils.parseUnits("1", 18), // Success

        sellToken: ropTokenList.ETH,
        buyToken: ropTokenList.WETH,
        sellAmount: ethers.utils.parseUnits("0.05", 18), // Success
        slippagePercentage: slippage / 100,

        takerAddress: account,
        buyTokenPercentageFee: 0.01,
        feeRecipient: '0x821965C1fD8B60D4B33E23C5832E2A7662faAADC',
      });

      var txHash = await signer.sendTransaction({
        from: account,
        to: quote.to,
        data: quote.data,
        value: BigNumber.from(quote.value),
        gasPrice: BigNumber.from(quote.gasPrice),
        gasLimit: BigNumber.from(quote.gas),
      });
      console.log('txHash is ', txHash);
      var ret = await txHash.wait();
      console.log('ret is ', ret);
    } catch (error) {
      console.log(error);
    }

    setLoading();
  }

  const trade = async () => {
    setLoading(true);
    var tx;
    var receipt;
    try {
      const contract = new ethers.Contract(
        props.network.DEX.DEXManage,
        dexManageAbi,
        signer
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
          logMessage("trade on DEX error: ", error)
          if (error.code === 4001) {
            alert(`User denied transaction signature.`)
          }
        }
      } else {
        // trade on 0x protocol
        try {
          if (quote.data) {
            const reQuote = await Requester.getAsync(props.network.SwapApi + "swap/v1/quote", {
              sellToken: from.address === "-" ? props.network.Currency.Name : from.address,
              buyToken: to.address === "-" ? props.network.Currency.Name : to.address,
              // take swapFee0x
              sellAmount: ethers.utils.parseUnits((parseFloat(from.amount) * (10000 - config.SWAP_FEE_0X) / 10000).toString(), from.decimals),
              slippagePercentage: slippage / 100
            });

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
        } catch (error) {
          logMessage("trade on 0x API error: ", error)
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
      logMessage("trade error: ", error)
    }
    setLoading();
  }

  const wrapping = async () => {
    // logMessage("wrapping");
    var msg = "Wrapping"
    const contract = new ethers.Contract(
      props.network.Currency.Address,
      wrappedAbi,
      signer
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
      logMessage("wrapping error: ", error)
      if (error.code === 4001) {
        alert(`User denied transaction signature.`)
      } else {
        alert(`Something went wrong!`)
      }
    }
    setLoading(false);
  }

  const invert = () => {
    // logMessage("invert")
    const newFrom = Object.assign({}, to);
    const newTo = Object.assign({}, from);
    newFrom.amount = "";
    newTo.amount = "";
    setFrom(newFrom);
    setTo(newTo);
    resetQuote(newFrom, newTo);
  }

  const fill = async (side, value) => {
    // logMessage("fill")
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

    newOther.amount = "";

    if (isPath === PATH_WRAP_UNWRAP) {
      newOther.amount = value;
      setOther(newOther);
      setReady(true);
    } else if (isPath === PATH_IS_IN_DEX && value > 0) {
      setConfirmed(true);

      const contract = new ethers.Contract(
        props.network.DEX.DEXManage,
        dexManageAbi,
        signer
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
          logMessage("fill amountOut error: ", error)
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
          logMessage("fill amountIn error: ", error)
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
          signer
        );

        try {
          var allowance = await contract.allowance(account, props.network.DEX.DEXManage);
        } catch (error) {
          logMessage("fill allowance error: ", error);
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

      if (value > 0) {
        setPendingQuote(setTimeout(() => {
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
    // logMessage("onAmountChange")
    fill(side, e.target.value.replace(/[^0-9.]/g, ""));
  };

  const fillMaxAmount = (e, side) => {
    // logMessage("fillMaxAmount")
    fill(side, e.target.dataset.balance);
  };

  const onSlippageChange = (e) => {
    // logMessage("onSlippageChange")
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

    resetQuote(null, null, value);
  };

  const onSelectToken = async (token, forTarget) => {
    // logMessage("onSelectToken")
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
        signer
      );
      tokenA = tokenA === "-" ? props.network.Currency.Address : tokenA;
      tokenB = tokenB === "-" ? props.network.Currency.Address : tokenB;

      if (
        (tokenA.toLowerCase() === tokenB.toLowerCase()) &&
        (tokenA.toLowerCase() === props.network.Currency.Address.toLowerCase())
      ) {
        setIsPath(PATH_WRAP_UNWRAP);
      } else {
        try {
          const ret = await contract.isPathExists(tokenA, tokenB);
          if (ret) {
            setIsPath(PATH_IS_IN_DEX);
          } else {
            setIsPath(PATH_IS_NOT_IN_DEX);
          }
        } catch (error) {
          logMessage("isPathExists err: ", error)
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

  const SubmitButton = () => {
    // logMessage("SubmitButton")
    if (account) {
      return <button className="default-btn w-100" disabled={!ready} onClick={() => testTrade()}>Swap</button>;
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
