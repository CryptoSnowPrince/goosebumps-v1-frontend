import React, { useState, useEffect } from 'react';
import { Contract, Provider, setMulticallAddress } from 'ethers-multicall';
import { ethers, BigNumber } from 'ethers';
import { useSelector } from 'react-redux';
import { TokenSelectModal } from "../../components/widgets/exchange/TokenSelectModal"
import { ConnectButtonModal } from '../../components/widgets/ConnectButtonModal';
import { UserLpToken } from "./UserLpToken"
import DEXSubmenu from '../../components/Submenu/DEXSubmenu'
import { LiquidityHeader } from "../../components/LiquidityHeader/LiquidityHeader";
import tokenAbi from '../../abis/token';
import factoryAbi from '../../abis/factory';
import routerAbi from '../../abis/router';
import { formatNumberWithoutComma } from '../../utils/number';
import * as selector from '../../store/selectors';

import '../../components/components.scss'

const LiquidityAddBody = (props) => {

  const account = useSelector(selector.accountState);
  const web3Provider = useSelector(selector.web3ProviderState);

  const [loading, setLoading] = useState(false);
  const [reloadUserLp, setReloadUserLp] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);

  const [newPool, setNewPool] = useState(false);
  const [lpAddress, setLpAddress] = useState("")
  const [tokenAApproved, setTokenAApproved] = useState(false);
  const [tokenBApproved, setTokenBApproved] = useState(false);

  const [tokenA, setTokenA] = useState({ symbol: "", address: "", decimals: 0, amount: 0, balance: 0 });
  const [tokenB, setTokenB] = useState({ symbol: "", address: "", decimals: 0, amount: 0, balance: 0 });

  const [showTokenSelectModal, setShowTokenSelectModal] = useState();

  const [tokenABalOfPool, setTokenABalOfPool] = useState(0);
  const [tokenBBalOfPool, setTokenBBalOfPool] = useState(0);

  const getTokenBalOfPool = async () => {
    // console.log("getTokenBalOfPool")
    const provider = new ethers.providers.JsonRpcProvider(props.network.RPC);
    if (props.network.chainId === 97) // When bsc testnet
    {
      setMulticallAddress(props.network.chainId, props.network.MulticallAddress);
    }
    const ethcallProvider = new Provider(provider);

    try {
      await ethcallProvider.init();

      if (ethers.utils.isAddress(lpAddress)) {
        var tokenABalOfPool = 0;
        var tokenBBalOfPool = 0;

        const tokenAContract = new Contract(tokenA.address === "-" ? props.network.Currency.Address : tokenA.address, tokenAbi);
        const tokenBContract = new Contract(tokenB.address === "-" ? props.network.Currency.Address : tokenB.address, tokenAbi);

        [
          tokenABalOfPool,
          tokenBBalOfPool,
        ] = await ethcallProvider.all([
          tokenAContract.balanceOf(lpAddress),
          tokenBContract.balanceOf(lpAddress),
        ])

        setTokenABalOfPool(ethers.utils.formatUnits(tokenABalOfPool, tokenA.decimals));
        setTokenBBalOfPool(ethers.utils.formatUnits(tokenBBalOfPool, tokenB.decimals));
      } else {
        setTokenABalOfPool(0);
        setTokenBBalOfPool(0);
      }
    } catch (error) {
      setTokenABalOfPool(0);
      setTokenBBalOfPool(0);
      console.log("getTokenBalOfPool err: ", error)
    }
  };


  const updateBalance = async (forContract, forTarget, setForTarget, setAmount = false) => {
    // console.log("updateBalance")
    setReady(false)
    const provider = new ethers.providers.JsonRpcProvider(props.network.RPC);
    if (props.network.chainId === 97) // When bsc testnet
    {
      setMulticallAddress(props.network.chainId, props.network.MulticallAddress);
    }
    const ethcallProvider = new Provider(provider);

    try {
      await ethcallProvider.init();

      if (ethers.utils.isAddress(account) && (ethers.utils.isAddress(forContract) || forContract === "-")) {
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
      console.log("update balance err: ", error, "\nupdate balance forTarget err: ", forTarget)
    }
    setReady(true)
  };

  const invert = () => {
    // console.log("invert")
    const newTokenA = Object.assign({}, tokenB);
    const newTokenB = Object.assign({}, tokenA);
    setTokenA(newTokenA);
    setTokenB(newTokenB);
    setTokenABalOfPool(tokenBBalOfPool)
    setTokenBBalOfPool(tokenABalOfPool)
  }

  const onSelectToken = (token, forTarget) => {
    // console.log("onSelectToken")
    // console.log(token, forTarget)
    if ((token.Address === tokenB.address && forTarget === "tokenA") || (token.Address === tokenA.address && forTarget === "tokenB")) {
      invert();
    }
    else {
      setLoading(true);
      if (forTarget === "tokenA") {
        const newTokenA = Object.assign({}, tokenA);
        newTokenA.address = token.Address;
        newTokenA.symbol = token.Symbol;
        newTokenA.decimals = token.Decimals;
        updateBalance(token.Address, newTokenA, setTokenA, true).then(() => {
          updateBalance(tokenB.address, tokenB, setTokenB, true).then(() => {
            setLoading(false);
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
            setLoading(false);
          });
        });
      }
    }
  }

  const fill = (side, value) => {
    // console.log("fill")
    // console.log("tokenABalOfPool: ", tokenABalOfPool);
    // console.log("tokenBBalOfPool: ", tokenBBalOfPool);
    setReady(false);
    if (side === "tokenA") {
      var target = tokenA;
      var setTarget = setTokenA;
      var other = tokenB;
      var setOther = setTokenB;
      var rate = tokenABalOfPool > 0 ? tokenBBalOfPool / tokenABalOfPool : 0;
    }
    else if (side === "tokenB") {
      target = tokenB;
      setTarget = setTokenB;
      other = tokenA;
      setOther = setTokenA;
      rate = tokenBBalOfPool > 0 ? tokenABalOfPool / tokenBBalOfPool : 0;
    }

    const newTarget = Object.assign({}, target);
    newTarget.amount = value;
    setTarget(newTarget);

    var newOther = null;
    if (isInvalidPair()) {
      newOther = Object.assign({}, other);
      newOther.amount = "";
      setOther(newOther);
      setReady(true);
      return;
    }

    if (newPool) {
      setReady(true);
      return;
    }

    // pool already exists
    newOther = Object.assign({}, other);
    newOther.amount = value * rate;
    setOther(newOther);
    setReady(true)
  }

  const onAmountChange = (e, side) => {
    // console.log("onAmountChange")
    fill(side, e.target.value.replace(/[^0-9.]/g, ""));
  };

  const fillMaxAmount = (e, side) => {
    // console.log("fillMaxAmount")
    fill(side, e.target.dataset.balance);
  };

  const approve = async (side) => {
    // console.log("approve");
    var setTargetApproved = null;
    var targetToken = null;
    if (side === "tokenA") {
      targetToken = tokenA;
      setTargetApproved = setTokenAApproved;
    } else if (side === "tokenB") {
      targetToken = tokenB;
      setTargetApproved = setTokenBApproved;
    }

    if (targetToken.address === "-") {
      // console.log("Native coin: Don't need approve");
      return;
    }

    const contract = new ethers.Contract(
      targetToken.address,
      tokenAbi,
      web3Provider.getSigner()
    );

    setReady(false);
    setLoading(true);

    try {
      const tx = await contract.approve(
        props.network.DEX.Router,
        ethers.utils.parseUnits(targetToken.amount.toString(), targetToken.decimals));
      const receipt = await tx.wait(tx);
      if (receipt.status === 1) {
        setTargetApproved(true);
      }
    } catch (err) {
      console.log("approve err: ", err, "\napprove err targetToken: ", targetToken);
    }

    setReady(true);
    setLoading(false);
  };

  const isApproved = async (side) => {
    if (side === "tokenA") {
      var targetToken = tokenA;
      var targetTokenApproved = setTokenAApproved;
    } else if (side === "tokenB") {
      targetToken = tokenB;
      targetTokenApproved = setTokenBApproved;
    }

    if (targetToken.address === "-") {
      targetTokenApproved(true);
      return;
    }

    if (!ethers.utils.isAddress(targetToken.address) || targetToken.amount === "") {
      return;
    }

    const contract = new ethers.Contract(
      targetToken.address,
      tokenAbi,
      web3Provider
    );

    setReady(false);
    try {
      var allowance = await contract.allowance(account, props.network.DEX.Router);
      if (BigNumber.from(ethers.utils.parseUnits(targetToken.amount.toString(), targetToken.decimals))
        .gt(allowance)) {
        targetTokenApproved(false)
      }
      else {
        targetTokenApproved(true);
      }
    } catch (error) {
      console.log("isApproved err: ", error, "\nisApproved targetToken: ", targetToken)
    }
    setReady(true);
  }

  const addLiquidity = async () => {
    const contract = new ethers.Contract(
      props.network.DEX.Router,
      routerAbi,
      web3Provider.getSigner()
    );

    // console.log("===============test================")
    // console.log("web3Provider lastblock: ", (await web3Provider.getBlock()).timestamp)

    setLoading(true);
    setReloadUserLp(false);
    // Slippage Tolerance 5%
    const slippageTolerance = 5;
    try {
      var nowTimestamp = (await web3Provider.getBlock()).timestamp;
      if (tokenA.address === "-") {
        var options = { value: ethers.utils.parseUnits(tokenA.amount.toString(), tokenA.decimals) };
        var tx = await contract.addLiquidityETH(
          tokenB.address,
          ethers.utils.parseUnits(tokenB.amount.toString(), tokenB.decimals),
          ethers.utils.parseUnits((parseFloat(tokenB.amount) * (100 - slippageTolerance) / 100).toString(), tokenB.decimals),
          ethers.utils.parseUnits((parseFloat(tokenA.amount) * (100 - slippageTolerance) / 100).toString(), tokenA.decimals),
          account,
          nowTimestamp + 1200, // deadline: 20mins
          options
        )
      }
      else if (tokenB.address === "-") {
        options = { value: ethers.utils.parseUnits(tokenB.amount.toString(), tokenB.decimals) };
        tx = await contract.addLiquidityETH(
          tokenA.address,
          ethers.utils.parseUnits(tokenA.amount.toString(), tokenA.decimals),
          ethers.utils.parseUnits((parseFloat(tokenA.amount) * (100 - slippageTolerance) / 100).toString(), tokenA.decimals),
          ethers.utils.parseUnits((parseFloat(tokenB.amount) * (100 - slippageTolerance) / 100).toString(), tokenB.decimals),
          account,
          nowTimestamp + 1200, // deadline: 20mins
          options
        )
      }
      else {
        tx = await contract.addLiquidity(
          tokenA.address,
          tokenB.address,
          ethers.utils.parseUnits(tokenA.amount.toString(), tokenA.decimals),
          ethers.utils.parseUnits(tokenB.amount.toString(), tokenB.decimals),
          ethers.utils.parseUnits((parseFloat(tokenA.amount) * (100 - slippageTolerance) / 100).toString(), tokenA.decimals),
          ethers.utils.parseUnits((parseFloat(tokenB.amount) * (100 - slippageTolerance) / 100).toString(), tokenB.decimals),
          account,
          nowTimestamp + 1200 // deadline: 20mins
        );
      }
      const receipt = await tx.wait(tx);
      // console.log("receipt: ", receipt);
      updateBalance(tokenA.address, tokenA, setTokenA, true).then(() => {
        updateBalance(tokenB.address, tokenB, setTokenB, true).then(() => {
        });
      });
      if (receipt.status === 1) {
        alert(`add liquidity success`);
        isNewPair(tokenA.address, tokenB.address);
      }
    } catch (err) {
      console.log("add liquidity err: ", err);
      if (err.code === 4001) {
        alert(`User denied transaction signature.`)
      }
    }
    setLoading(false);
    setReloadUserLp(true);
  }

  const isNewPair = async (tokenAAddress, tokenBAddress) => {
    setReady(false);
    if (tokenAAddress === "-") tokenAAddress = props.network.Currency.Address;
    if (tokenBAddress === "-") tokenBAddress = props.network.Currency.Address;
    const provider = new ethers.providers.JsonRpcProvider(props.network.RPC);
    const contract = new ethers.Contract(
      props.network.DEX.Factory,
      factoryAbi,
      provider
    );
    try {
      const pairAddress = await contract.getPair(tokenAAddress, tokenBAddress)
      setLpAddress(pairAddress);
      // console.log("pairAddress: ", pairAddress);
      if (pairAddress === "0x0000000000000000000000000000000000000000") {
        // console.log("pair is not exist");
        setNewPool(true)
      } else {
        const tokenAContract = new ethers.Contract(tokenAAddress, tokenAbi, provider);
        const tokenABalance = await tokenAContract.balanceOf(pairAddress);
        // console.log("tokenABalance._hex: ", tokenABalance._hex);
        // console.log("typeof tokenABalance._hex: ", typeof tokenABalance._hex);
        // console.log("tokenABalance.decimals: ", parseInt(tokenABalance._hex));
        if (parseInt(tokenABalance._hex) > 0) {
          setNewPool(false)
        } else {
          setNewPool(true)
        }
      }
    } catch (error) {
      setNewPool(false)
      setLpAddress("");
      console.log("get Pair Address err: ", error)
    }
    setReady(true)
  }

  const isInvalidPair = () => {
    return !(tokenA.symbol && tokenB.symbol) ||
      (tokenA.address === "-" && tokenB.address === props.network.Currency.Address) ||
      (tokenB.address === "-" && tokenA.address === props.network.Currency.Address)
  }

  // const test = async () => {
  //   console.log("===============test================")
  //   const aaprovider = new ethers.providers.JsonRpcProvider(props.network.RPC);
  //   console.log("aaprovider lastblock: ", (await aaprovider.getBlock()).timestamp)
  //   console.log("web3Provider lastblock: ", (await web3Provider.getBlock()).timestamp)
  // }

  // useEffect(() => {
  //   console.log("tokenABalOfPool: ", tokenABalOfPool)
  //   console.log("tokenBBalOfPool: ", tokenBBalOfPool)
  // }, [tokenABalOfPool, tokenBBalOfPool])

  useEffect(() => {
    // test()
    // console.log("tokenA: ", tokenA)
    // console.log("tokenB: ", tokenB)
    // try {
    //   console.log("approve amount: ", ethers.utils.parseUnits(tokenA.amount.toString(), tokenA.decimals))
    // } catch (error) {
    //   console.log();
    // }
    if (!isInvalidPair()) {
      isNewPair(tokenA.address, tokenB.address);
      isApproved("tokenA");
      isApproved("tokenB");
    } else {
      setLpAddress("");
    }
  }, [tokenA, tokenB])

  useEffect(() => {
    if (ethers.utils.isAddress(lpAddress) && !newPool && !isInvalidPair()) {
      getTokenBalOfPool();
    }
  }, [lpAddress])

  useEffect(() => {
    setTokenA({ symbol: "", address: "", decimals: 0, amount: 0, balance: 0 })
    setTokenB({ symbol: "", address: "", decimals: 0, amount: 0, balance: 0 })
    // console.log("props.network: ", props.network);
    // console.log("account: ", account);
  }, [props.network, account])

  const SubmitButton = () => {
    // console.log("SubmitButton")
    if (isInvalidPair()) {
      return <button className="disable-btn w-100" disabled>Invalid pair</button>;
    }
    else if (account) {
      if (!ready) {
        return <button className="default-btn w-100" disabled="disabled">Please wait...</button>;
      }
      else if (!(parseFloat(tokenA.amount) > 0 && parseFloat(tokenB.amount) > 0)) {
        return <button className="default-btn w-100" disabled="disabled">Enter an amount</button>;
      }
      else if (!tokenAApproved) {
        return <button className="default-btn w-100" disabled={!ready}
          onClick={() => approve("tokenA")}>Enable {tokenA.symbol}</button>;
      }
      else if (!tokenBApproved) {
        return <button className="default-btn w-100" disabled={!ready}
          onClick={() => approve("tokenB")}>Enable {tokenB.symbol}</button>;
      }
      else if (error) {
        return <button className="default-btn w-100" disabled="disabled">{error}</button>;
      }
      else {
        return <button className="default-btn w-100" disabled={!ready} onClick={() => addLiquidity()}>Supply</button>;
      }
    }
    else {
      return <ConnectButtonModal />;
    }
  };

  return (
    <>
      <div className="dex" >
        <DEXSubmenu />
        <div id='liquidity' className={`${loading ? "loading-state" : ""}`} >
          <LiquidityHeader title="Add Liquidity" content="Add liquidity to receive LP tokens" />
          <div className='liquidityAddBody p-4'>
            <div className='wallet-tabs'>
              <div className='tab_content p-0'>
                {newPool && !isInvalidPair() ?
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

            {isInvalidPair() || lpAddress === "" ? "" :
              <div>
                <div className='mt-4 mb-4'>Prices and pool share</div>
                <div className='d-flex justify-content-around'>
                  <div className='text-center'>
                    <div>{
                      newPool ?
                        (
                          (parseFloat(tokenA.amount) > 0 && parseFloat(tokenB.amount) > 0) ?
                            tokenA.amount / tokenB.amount :
                            0
                        ) :
                        (parseFloat(tokenBBalOfPool) > 0 ? (parseFloat(tokenABalOfPool) / parseFloat(tokenBBalOfPool)) : 0)
                    }</div>
                    <div>{tokenA.symbol} per {tokenB.symbol}</div>
                  </div>
                  <div className='text-center'>
                    <div>{
                      newPool ?
                        (
                          (parseFloat(tokenA.amount) > 0 && parseFloat(tokenB.amount) > 0) ?
                            tokenB.amount / tokenA.amount :
                            0
                        ) :
                        (parseFloat(tokenABalOfPool) ? (parseFloat(tokenBBalOfPool) / parseFloat(tokenABalOfPool)) : 0)
                    }</div>
                    <div>{tokenB.symbol} per {tokenA.symbol}</div>
                  </div>
                  <div className='text-center'>
                    <div>{(newPool && parseFloat(tokenA.amount) > 0 && parseFloat(tokenB.amount) > 0) ?
                      100 :
                      (
                        (parseFloat(tokenA.amount) > 0 && parseFloat(tokenB.amount) > 0) ?
                          parseFloat(tokenA.amount) * 100 /
                          (parseFloat(tokenABalOfPool) + parseFloat(tokenA.amount)) : 0
                      )}%</div>
                    <div>Share of Pool</div>
                  </div>
                </div>
              </div>
            }
            <div className='d-flex justify-content-center mt-4'>
              <SubmitButton />
            </div>
          </div>
        </div>
        <UserLpToken
          network={props.network}
          lpAddress={newPool ? "" : lpAddress}
          account={account}
          reload={reloadUserLp} />
        <TokenSelectModal
          showFor={showTokenSelectModal}
          hide={() => setShowTokenSelectModal()}
          onSelect={onSelectToken}
          network={props.network} />
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
    </>
  );
}

export { LiquidityAddBody }
