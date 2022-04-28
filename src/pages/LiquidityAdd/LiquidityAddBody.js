import React, { useState, useEffect } from 'react';
import { Contract, Provider, setMulticallAddress } from 'ethers-multicall';
import { /*singer, */ethers, BigNumber } from 'ethers';
import Web3 from 'web3';
import { useSelector } from 'react-redux';
// import { TokenSelectModal } from "./TokenModal"
import { TokenSelectModal } from "../../components/widgets/exchange/TokenSelectModal"
import { ConnectButtonModal } from '../../components/widgets/ConnectButtonModal';
import tokenAbi from '../../abis/token';
import { /*getFullDisplayBalance, */formatNumberWithoutComma } from '../../utils/number';
// import networks from '../../networks.json'
import * as selector from '../../store/selectors';

const LiquidityAddBody = (props) => {

  const account = useSelector(selector.accountState);
  const provider = useSelector(selector.providerState);
  const web3Provider = useSelector(selector.web3ProviderState);

  const [loading, setLoading] = useState();
  const [ready, setReady] = useState();

  const [tokenA, setTokenA] = useState({ symbol: "", address: "", decimals: 0, amount: 0, balance: 0 });
  const [tokenB, setTokenB] = useState({ symbol: "", address: "", decimals: 0, amount: 0, balance: 0 });

  const [showTokenSelectModal, setShowTokenSelectModal] = useState();

  const onSelectToken = (token, forTarget) => {
    console.log("onSelectToken")
    console.log(token, forTarget)
    if ((token.Address === tokenB.address && forTarget === "tokenA") || (token.Address === tokenA.address && forTarget === "tokenB")) {
      // invert();
    }
    else {
      if (forTarget === "tokenA") {
        const newFrom = Object.assign({}, tokenA);
        newFrom.address = token.Address;
        newFrom.symbol = token.Symbol;
        newFrom.decimals = token.Decimals;
        updateBalance(token.Address, newFrom, setTokenA, true).then(() => {
          updateBalance(tokenB.address, tokenB, setTokenB, true).then(() => {
            setLoading();
            // resetQuote();
          });
        });
      }
      else {
        const newTo = Object.assign({}, tokenB);
        newTo.address = token.Address;
        newTo.symbol = token.Symbol;
        newTo.decimals = token.Decimals;
        updateBalance(token.Address, newTo, setTokenB, true).then(() => {
          updateBalance(tokenA.address, tokenA, setTokenA, true).then(() => {
            setLoading();
            // resetQuote();
          });
        });
      }
    }
  }

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
          newTarget.amount = 0;
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

  const fill = (side, value) => {
    console.log("fill")
    setReady();
    if (side === "tokenA") {
      var target = tokenA;
      var setTarget = setTokenA;
      var other = tokenB;
      var setOther = setTokenB;
    }
    else {
      target = tokenB;
      setTarget = setTokenB;
      other = tokenA;
      setOther = setTokenA;
    }

    const newTarget = Object.assign({}, target);
    newTarget.amount = value;
    setTarget(newTarget);

    var newOther = Object.assign({}, other);
    newOther.amount = "";
    setOther(newOther);
    // setQuote();

    // if (pendingQuote) {
    // 	clearTimeout(pendingQuote);
    // }
    // console.log("L292")
    if (value > 0) {
      // setPendingQuote(setTimeout(() => {
      // 	// console.log("L295")
      // 	updateQuote(tokenA.address, tokenA.decimals, tokenB.address, tokenB.decimals, value, slippage, side).then(quote => {
      // 		if (quote?.price > 0) {
      // 			const buyAmount = ethers.utils.formatUnits(quote.buyAmount, tokenB.decimals);
      // 			const sellAmount = ethers.utils.formatUnits(quote.sellAmount, tokenA.decimals);

      // 			newOther.amount = side === "tokenA" ? buyAmount : sellAmount;
      // 			setOther(newOther);
      // 		}
      setReady(true);
      // 	});
      // 	setPendingQuote();
      // }, 1500));
    }
    else {
      setReady(true);
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

  const addLiquidity = async () => {
		// const params = {
		// 	sellToken: (from.address === "-" ? from.symbol : from.address),
		// 	buyToken: (to.address === "-" ? to.symbol : to.address),
		// 	sellAmount: quote.sellAmount, // 1 ETH = 10^18 wei
		// 	takerAddress: account,
		// }

		// try {
		// 	// Fetch the swap quote.
		// 	const response = await fetch(
		// 		`${props.network.SwapApi}swap/v1/quote?${qs.stringify(params)}`
		// 	);

		// 	const web3 = new Web3(provider);
		// 	const ret = await response.json();
		// 	await web3.eth.sendTransaction(ret);
		// } catch (error) {
		// 	console.log("trade error: ", error)
		// }

		// updateBalance(from.address, from, setFrom, true).then(() => {
		// 	updateBalance(to.address, to, setTo, true).then(() => {
		// 		setLoading();
		// 		resetQuote();
		// 	});
		// });
	}

  useEffect(() => {
    setTokenA({ symbol: "", address: "", decimals: 0, amount: "", balance: 0 })
    setTokenB({ symbol: "", address: "", decimals: 0, amount: "", balance: 0 })
    console.log("props.network: ", props.network);
    console.log("account: ", account);
  }, [props.network, account])

  if (loading) {
    // console.log("loading")
    return (
      <div className="text-center p-5 w-100">
        <span className="spinner-border" role="status"></span>
      </div>
    );
  }

  const SubmitButton = () => {
    // console.log("SubmitButton")
    if (account) {
      if (!ready) {
        return <button className="default-btn w-100" disabled="disabled">Please wait...</button>;
      }
      else if (!(tokenA.amount > 0 || tokenB.amount > 0)) {
        return <button className="default-btn w-100" disabled="disabled">Enter an amount</button>;
      }
      // else if (needApprove) {
      //   return <button className="default-btn w-100" disabled={!ready} onClick={() => approve(from.address)}>Approve</button>;
      // }
      // else if (error) {
      //   return <button className="default-btn w-100" disabled="disabled">{error}</button>;
      // }
      // else if (!confirmed) {
      //   return <button className="default-btn w-100" disabled={!ready} onClick={() => confirm()}>Confirm</button>;
      // }
      else {
        return <button className="default-btn w-100" disabled={!ready} onClick={() => addLiquidity()}>Supply</button>;
      }
    }
    else {
      return <ConnectButtonModal />;
    }
  };

  return (
    <div className='liquidityAddBody p-4' >
      <div className='wallet-tabs'>
        <div className='tab_content p-0'>
          <div className="form-group">
            <div className="row justify-content-between">
              <div className="col">
                <label htmlFor="from" className="w-100">TokenA</label>
              </div>
              <div className="col text-end">
                <button
                  data-balance={tokenA.balance}
                  onClick={e => fillMaxAmount(e, "tokenA")}
                  type="button" className="w-100 text-end badge btn text-white">
                  Balance: {formatNumberWithoutComma(Number(tokenA.balance))}
                </button>
              </div>
            </div>
            <div className="input-group">
              <input id="from" type="text" className="form-control me-2"
                placeholder="0" autoComplete="off"
                onChange={e => onAmountChange(e, "tokenA")}
                min="0"
                max={tokenA.balance}
                value={tokenA.amount} />
              <div className="input-group-addon">
                <button type="button" className="default-btn"
                  onClick={() => setShowTokenSelectModal("tokenA")}>
                  {tokenA.symbol ? tokenA.symbol : "Select"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='d-flex justify-content-center m-4'>+</div>
      <div className='wallet-tabs'>
        <div className='tab_content p-0'>
          <div className="form-group">
            <div className="row justify-content-between">
              <div className="col">
                <label htmlFor="from" className="w-100">TokenB</label>
              </div>
              <div className="col text-end">
                <button
                  data-balance={tokenB.balance}
                  onClick={e => fillMaxAmount(e, "tokenB")}
                  type="button" className="w-100 text-end badge btn text-white">
                  Balance: {formatNumberWithoutComma(Number(tokenB.balance))}
                </button>
              </div>
            </div>
            <div className="input-group">
              <input id="from" type="text" className="form-control me-2"
                placeholder="0" autoComplete="off"
                onChange={e => onAmountChange(e, "tokenB")}
                min="0"
                max={tokenB.balance}
                value={tokenB.amount} />
              <div className="input-group-addon">
                <button type="button" className="default-btn"
                  onClick={() => setShowTokenSelectModal("tokenB")}>
                  {tokenB.symbol ? tokenB.symbol : "Select"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='mt-4 mb-4'>Prices and pool share</div>
      <div className='d-flex justify-content-around'>
        <div className='text-center'>
          <div>1085.91</div>
          <div>DSP per BNB</div>
        </div>
        <div className='text-center'>
          <div>0.000920886</div>
          <div>BNB per DSP</div>
        </div>
        <div className='text-center'>
          <div>9%</div>
          <div>Share of Pool</div>
        </div>
      </div>
      <div className='d-flex justify-content-center mt-4'>
      {/* <div className="form-group btns"> */}
        <SubmitButton />
        {/* <button className='disable-btn' disabled>
          {"Invalid pair"}
        </button>
        <button className='default-btn'>Enter an amount</button> */}
      </div>

      <TokenSelectModal
        showFor={showTokenSelectModal}
        hide={() => setShowTokenSelectModal()}
        onSelect={onSelectToken}
        network={props.network} />
    </div>
  );
}

export { LiquidityAddBody }
