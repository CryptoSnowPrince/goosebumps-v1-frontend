import React, { useState, useEffect } from 'react';
import { Contract, Provider, setMulticallAddress } from 'ethers-multicall';
import { /*singer, */ethers, BigNumber } from 'ethers';
import Web3 from 'web3';
import { useSelector } from 'react-redux';
// import { TokenSelectModal } from "./TokenModal"
import { TokenSelectModal } from "../../components/widgets/exchange/TokenSelectModal"
import { ConnectButtonModal } from '../../components/widgets/ConnectButtonModal';
import { UserLpToken } from "./UserLpToken"
import DEXSubmenu from '../../components/Submenu/DEXSubmenu'
import { LiquidityHeader } from "../../components/LiquidityHeader/LiquidityHeader";
import tokenAbi from '../../abis/token';
import factoryAbi from '../../abis/factory';
import routerAbi from '../../abis/router';
import { /*getFullDisplayBalance, */formatNumberWithoutComma } from '../../utils/number';
// import networks from '../../networks.json'
import * as selector from '../../store/selectors';

const LiquidityAddBody = (props) => {

  const account = useSelector(selector.accountState);
  const provider = useSelector(selector.providerState);
  const web3Provider = useSelector(selector.web3ProviderState);

  const [loading, setLoading] = useState();
  const [ready, setReady] = useState();
  const [newPair, setNewPair] = useState(false);
  const [lpAddress, setLpAddress] = useState("")
  const [needApprove, setNeedApprove] = useState();

  const [tokenA, setTokenA] = useState({ symbol: "", address: "", decimals: 0, amount: 0, balance: 0 });
  const [tokenB, setTokenB] = useState({ symbol: "", address: "", decimals: 0, amount: 0, balance: 0 });

  const [showTokenSelectModal, setShowTokenSelectModal] = useState();

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

  const invert = () => {
    // console.log("invert")
    const newTokenA = Object.assign({}, tokenB);
    const newTokenB = Object.assign({}, tokenA);
    setTokenA(newTokenA);
    setTokenB(newTokenB);
    // resetQuote(newTokenA, newTokenB);
  }

  const onSelectToken = (token, forTarget) => {
    console.log("onSelectToken")
    console.log(token, forTarget)
    if ((token.Address === tokenB.address && forTarget === "tokenA") || (token.Address === tokenA.address && forTarget === "tokenB")) {
      invert();
    }
    else {
      if (forTarget === "tokenA") {
        const newTokenA = Object.assign({}, tokenA);
        newTokenA.address = token.Address;
        newTokenA.symbol = token.Symbol;
        newTokenA.decimals = token.Decimals;
        updateBalance(token.Address, newTokenA, setTokenA, true).then(() => {
          updateBalance(tokenB.address, tokenB, setTokenB, true).then(() => {
            setLoading();
            // resetQuote();
          });
        });
      }
      else {
        const newTokenB = Object.assign({}, tokenB);
        newTokenB.address = token.Address;
        newTokenB.symbol = token.Symbol;
        newTokenB.decimals = token.Decimals;
        updateBalance(token.Address, newTokenB, setTokenB, true).then(() => {
          updateBalance(tokenA.address, tokenA, setTokenA, true).then(() => {
            setLoading();
            // resetQuote();
          });
        });
      }
    }
  }

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

    if (newPair) {
      setReady(true);
      return;
    }

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

  const approve = async (tokenAddress) => {
    // console.log("approve");
    setReady();

    // const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    const contract = new ethers.Contract(
      tokenA.address,
      tokenAbi,
      web3Provider.getSigner()
      // provider.getSigner()
    );

    // try {
    // 	const tx = await contract.approve(needApprove.target, tokenA.amount);
    // 	const receipt = await tx.wait(tx);
    // 	if (receipt.status === 1) {
    // 		setNeedApprove();
    // 	}
    // } catch (err) {
    // 	console.log("approve err: ", err);
    // }

    // updateBalance(tokenA.address, tokenA, setTokenA).then(() => {
    // 	updateBalance(tokenB.address, tokenB, setTokenB).then(() => {
    // 	});
    // });

    setReady(true);
  };

  const addLiquidity = async () => {
    // const params = {
    // 	sellToken: (tokenA.address === "-" ? tokenA.symbol : tokenA.address),
    // 	buyToken: (tokenB.address === "-" ? tokenB.symbol : tokenB.address),
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

    // updateBalance(tokenA.address, tokenA, setTokenA, true).then(() => {
    // 	updateBalance(tokenB.address, tokenB, setTokenB, true).then(() => {
    // 		setLoading();
    // 		resetQuote();
    // 	});
    // });
  }

  const isNewPair = async (tokenA, tokenB) => {
    if (tokenA === "-") tokenA = props.network.Currency.Address;
    if (tokenB === "-") tokenB = props.network.Currency.Address;
    const provider = new ethers.providers.JsonRpcProvider(props.network.RPC);
    const contract = new ethers.Contract(
      props.network.DEX.Factory,
      factoryAbi,
      provider
    );
    try {
      const pairAddress = await contract.getPair(tokenA, tokenB)
      setLpAddress(pairAddress);
      console.log("pairAddress: ", pairAddress);
      if (pairAddress === "0x0000000000000000000000000000000000000000") {
        // console.log("pair is not exist");
        setNewPair(true)
      } else {
        const tokenAContract = new ethers.Contract(tokenA, tokenAbi, provider);
        const tokenABalance = await tokenAContract.balanceOf(pairAddress);
        // console.log("tokenABalance._hex: ", tokenABalance._hex);
        // console.log("typeof tokenABalance._hex: ", typeof tokenABalance._hex);
        // console.log("tokenABalance.decimals: ", parseInt(tokenABalance._hex));
        if (parseInt(tokenABalance._hex) > 0) {
          // console.log("pass if")
          setNewPair(false)
        } else {
          // console.log("pass else")
          setNewPair(true)
        }
      }
    } catch (error) {
      setNewPair(false)
      setLpAddress("");
      console.log("get Pair Address err: ", error)
    }
  }

  const isInvalidPair = () => {
    return !(tokenA.symbol && tokenB.symbol) ||
      (tokenA.address === "-" && tokenB.address === props.network.Currency.Address) ||
      (tokenB.address === "-" && tokenA.address === props.network.Currency.Address)
  }

  useEffect(() => {
    console.log("tokenA: ", tokenA)
    console.log("tokenB: ", tokenB)
    if (!isInvalidPair()) {
      isNewPair(tokenA.address, tokenB.address);
    } else {
      setLpAddress("");
    }
  }, [tokenA, tokenB])

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
    if (isInvalidPair()) {
      return <button className="disable-btn w-100" disabled>Invalid pair</button>;
    }
    else if (account) {
      if (!ready) {
        return <button className="default-btn w-100" disabled="disabled">Please wait...</button>;
      }
      else if (!(tokenA.amount > 0 || tokenB.amount > 0)) {
        return <button className="default-btn w-100" disabled="disabled">Enter an amount</button>;
      }
      else if (needApprove) {
        return <button className="default-btn w-100" disabled={!ready} onClick={() => approve(tokenA.address)}>Approve</button>;
      }
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
    <div className="dex">
      <DEXSubmenu />
      <div id='liquidity' >
        <LiquidityHeader title="Add Liquidity" content="Add liquidity to receive LP tokens" />
        <div className='liquidityAddBody p-4'>
          <div className='wallet-tabs'>
            <div className='tab_content p-0'>
              {newPair && !isInvalidPair() ?
                <div className='form-group'>
                  <div className='d-flex justify-content-near' style={{ color: "#04C0D7" }}>
                    <div style={{ padding: 12.9 }}>
                      <img className='col-auto' style={{ height: 24 }}
                        src={"/assets/images/warn.png"}
                        alt={"Warn"} />
                    </div>
                    <div style={{ paddingTop: 10, paddingBottom: 10 }}>
                      <div>
                        You are the first liquidity provider.
                      </div>
                      <div>
                        The ratio of tokens you add will set the price of this pool.
                      </div>
                      <div>
                        Once you are happy with the rate click supply to add liquidity.
                      </div>
                    </div>
                  </div>
                </div>
                : ""
              }
              <div className="form-group">
                <div className="row justify-content-between">
                  <div className="col">
                    <label htmlFor="from" className="w-100">Token 1</label>
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
                    <label htmlFor="from" className="w-100">Token 2</label>
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

          {isInvalidPair() ? "" :
            <div>
              <div className='mt-4 mb-4'>Prices and pool share</div>
              <div className='d-flex justify-content-around'>
                <div className='text-center'>
                  <div>{(tokenA.amount > 0 && tokenB.amount > 0) ? tokenA.amount / tokenB.amount : 0}</div>
                  <div>{tokenA.symbol} per {tokenB.symbol}</div>
                </div>
                <div className='text-center'>
                  <div>{(tokenA.amount > 0 && tokenB.amount > 0) ? tokenB.amount / tokenA.amount : 0}</div>
                  <div>{tokenB.symbol} per {tokenA.symbol}</div>
                </div>
                <div className='text-center'>
                  <div>{(newPair && tokenA.amount > 0 && tokenB.amount > 0) ? 100 : 0}%</div>
                  <div>Share of Pool</div>
                </div>
              </div>
            </div>
          }
          <div className='d-flex justify-content-center mt-4'>
            {/* <div className="form-group btns"> */}
            <SubmitButton />
            {/* <button className='disable-btn' disabled>
          {"Invalid pair"}
        </button>
        <button className='default-btn'>Enter an amount</button> */}
          </div>
        </div>
      </div>
      <UserLpToken
        network={props.network}
        lpAddress={lpAddress}
        account={account} />
      <TokenSelectModal
        showFor={showTokenSelectModal}
        hide={() => setShowTokenSelectModal()}
        onSelect={onSelectToken}
        network={props.network} />
    </div>
  );
}

export { LiquidityAddBody }
