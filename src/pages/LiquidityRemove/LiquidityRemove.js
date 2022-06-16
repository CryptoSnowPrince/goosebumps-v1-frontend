import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import InputRange from "react-input-range";
import { useParams } from 'react-router-dom';
import { ethers, BigNumber } from 'ethers';
import { Contract, Provider, setMulticallAddress } from 'ethers-multicall';

import linq from "linq";
import pairAbi from '../../abis/pair.json';
import tokenAbi from '../../abis/token.json';
import routerAbi from '../../abis/router.json';

import DEXSubmenu from '../../components/Submenu/DEXSubmenu'
import { LiquidityHeader } from "../../components/LiquidityHeader/LiquidityHeader";
import { UserLpToken } from "../LiquidityAdd/UserLpToken"
import { TokenSelectModal } from "../../components/widgets/exchange/TokenSelectModal"
import { ConnectButtonModal } from '../../components/widgets/ConnectButtonModal';

import "react-input-range/lib/css/index.css";
import '../Liquidity/Liquidity.scss'

import * as selector from '../../store/selectors';
import networks from '../../networks.json'
import { formatNumber } from '../../utils/number';

import config from '../../constants/config'
import { logMessage } from '../../utils/helpers';

const NOT_NEED_APPROVE = 0;
const NEED_APPROVE = 1;
const APPROVING = 2;
const APPROVED = 3;

const NATIVE_TOKEN = 0;
const W_NATIVE_TOKEN = 1;
const GENERAL_TOKEN = 2;
const INITIAL_TOKEN = 3;

const lpDecimals = 18;

const LiquidityRemove = () => {
  const account = useSelector(selector.accountState);
  const web3Provider = useSelector(selector.web3ProviderState);
  const chainIndex = useSelector(selector.chainIndex);

  const [removeAmount, setRemoveAmount] = useState(50);
  const [detailed, setDetailed] = useState(true);

  const [ready, setReady] = useState(false)
  const [pendingTx, setPendingTx] = useState(false);
  const [error, setError] = useState(false)
  const [reloadUserLp, setReloadUserLp] = useState(1);

  const [receiveNToken, setReceiveNToken] = useState(INITIAL_TOKEN)

  /**
   * 0: don't need approve
   * 1: need approve
   * 2: approving
   * 3: approved
   */
  const [lpApproveState, setLpApproveState] = useState(NOT_NEED_APPROVE)

  const [lpAddress, setLpAddress] = useState("")

  const [lpBalance, setLpBalance] = useState(0);
  const [lpTotalSupply, setLpTotalSupply] = useState(0);
  const [tokenABalance, setTokenABalance] = useState(0);
  const [tokenBBalance, setTokenBBalance] = useState(0);
  const [tokenASymbol, setTokenASymbol] = useState("");
  const [tokenBSymbol, setTokenBSymbol] = useState("");
  // to remove liquidity
  const [tokenAAddr, setTokenAAddr] = useState("");
  const [tokenBAddr, setTokenBAddr] = useState("");
  const [tokenADecimals, setTokenADecimals] = useState(0);
  const [tokenBDecimals, setTokenBDecimals] = useState(0);
  const [tokenAAddrIsInList, setTokenAAddrIsInList] = useState("");
  const [tokenBAddrIsInList, setTokenBAddrIsInList] = useState("");

  const [showTokenSelectModal, setShowTokenSelectModal] = useState();

  const params = useParams();

  const onSelectToken = (token, forTarget) => {
    // logMessage(token, forTarget)
  }

  const updateLpInfo = async () => {
    // logMessage("LiquidityRemove updateLpInfo")
    const provider = new ethers.providers.JsonRpcProvider(networks[chainIndex].RPC);
    if (networks[chainIndex].chainId === 97) // When bsc testnet
    {
      setMulticallAddress(networks[chainIndex].chainId, networks[chainIndex].MulticallAddress);
    }
    const ethcallProvider = new Provider(provider);

    try {
      await ethcallProvider.init();

      if (ethers.utils.isAddress(account) && ethers.utils.isAddress(lpAddress) && lpAddress !== "0x0000000000000000000000000000000000000000") {
        var lpBalance = null;
        var lpTotalSupply = 0;
        var lpDecimals = 0;
        var tokenAAddress = "";
        var tokenBAddress = "";
        var tokenABalance = null;
        var tokenBBalance = null;
        var tokenASymbol = "";
        var tokenBSymbol = "";
        var tokenADecimals = 0;
        var tokenBDecimals = 0;

        const contract = new Contract(lpAddress, pairAbi);
        [lpBalance, lpTotalSupply, lpDecimals, tokenAAddress, tokenBAddress] = await ethcallProvider.all([
          contract.balanceOf(account),
          contract.totalSupply(),
          contract.decimals(),
          contract.token0(),
          contract.token1(),
        ]);

        setLpBalance(ethers.utils.formatUnits(lpBalance, lpDecimals));
        setLpTotalSupply(ethers.utils.formatUnits(lpTotalSupply, lpDecimals));

        const tokenAContract = new Contract(tokenAAddress, tokenAbi);
        const tokenBContract = new Contract(tokenBAddress, tokenAbi);

        setTokenAAddr(tokenAAddress);
        setTokenBAddr(tokenBAddress);

        const tokenList = require("../../tokens/" + networks[chainIndex].Name)
        var sched = linq.from(tokenList).where(x => x.Address.toLowerCase() === tokenAAddress.toLowerCase()).toArray();
        if (sched.length === 0) {
          setTokenAAddrIsInList("");
        } else if (tokenAAddress.toLowerCase() === networks[chainIndex].Currency.Address.toLowerCase()) {
          setTokenAAddrIsInList("0x0000000000000000000000000000000000000000");
        } else {
          setTokenAAddrIsInList(tokenAAddress);
        }

        sched = linq.from(tokenList).where(x => x.Address.toLowerCase() === tokenBAddress.toLowerCase()).toArray();
        if (sched.length === 0) {
          setTokenBAddrIsInList("");
        } else if (tokenBAddress.toLowerCase() === networks[chainIndex].Currency.Address.toLowerCase()) {
          setTokenBAddrIsInList("0x0000000000000000000000000000000000000000");
        } else {
          setTokenBAddrIsInList(tokenBAddress);
        }

        [
          tokenABalance,
          tokenASymbol,
          tokenADecimals,
          tokenBBalance,
          tokenBSymbol,
          tokenBDecimals
        ] = await ethcallProvider.all([
          tokenAContract.balanceOf(lpAddress),
          tokenAContract.symbol(),
          tokenAContract.decimals(),
          tokenBContract.balanceOf(lpAddress),
          tokenBContract.symbol(),
          tokenBContract.decimals(),
        ])

        setTokenABalance(ethers.utils.formatUnits(tokenABalance, tokenADecimals));
        setTokenBBalance(ethers.utils.formatUnits(tokenBBalance, tokenBDecimals));

        setTokenADecimals(tokenADecimals);
        setTokenBDecimals(tokenBDecimals);

        setTokenASymbol(
          tokenAAddress.toLowerCase() === networks[chainIndex].Currency.Address.toLowerCase() ? networks[chainIndex].Currency.Name : tokenASymbol
        )
        setTokenBSymbol(
          tokenBAddress.toLowerCase() === networks[chainIndex].Currency.Address.toLowerCase() ? networks[chainIndex].Currency.Name : tokenBSymbol
        )
      } else {
        setLpBalance(0);
        setLpTotalSupply(0);
        setTokenABalance(0);
        setTokenBBalance(0);
        setTokenASymbol("");
        setTokenBSymbol("");
        setTokenAAddr("");
        setTokenBAddr("");
        setTokenADecimals(0);
        setTokenBDecimals(0);
        setTokenAAddrIsInList("");
        setTokenBAddrIsInList("");
      }
    } catch (error) {
      setLpBalance(0);
      setLpTotalSupply(0);
      setTokenABalance(0);
      setTokenBBalance(0);
      setTokenASymbol("");
      setTokenBSymbol("");
      setTokenAAddr("");
      setTokenBAddr("");
      setTokenADecimals(0);
      setTokenBDecimals(0);
      setTokenAAddrIsInList("");
      setTokenBAddrIsInList("");
      logMessage("LiquidityRemove updateLpInfo err: ", error)
    }
  };

  const isApproved = async () => {
    if (!ethers.utils.isAddress(lpAddress) || parseFloat(lpBalance) <= 0 || parseFloat(removeAmount) <= 0) {
      setLpApproveState(NOT_NEED_APPROVE)
      return;
    }

    const contract = new ethers.Contract(
      lpAddress,
      tokenAbi,
      web3Provider
    );

    setReady(false);
    try {
      var allowance = await contract.allowance(account, networks[chainIndex].DEX.Router);
      if (BigNumber.from(ethers.utils.parseUnits((lpBalance * removeAmount / 100).toString(), lpDecimals))
        .gt(allowance)) {
        setLpApproveState(NEED_APPROVE)
      }
      else {
        setLpApproveState(APPROVED)
      }
    } catch (error) {
      logMessage("isApproved err: ", error, "\nisApproved lpAddress: ", lpAddress)
    }
    setReady(true);
  }

  const approve = async () => {
    // logMessage("approve");
    const contract = new ethers.Contract(
      lpAddress,
      tokenAbi,
      web3Provider.getSigner()
    );

    setReady(false);

    setLpApproveState(APPROVING);
    setPendingTx(true);
    try {
      const tx = await contract.approve(
        networks[chainIndex].DEX.Router,
        ethers.utils.parseUnits((lpBalance * removeAmount / 100).toString(), lpDecimals));
      const receipt = await tx.wait(tx);
      if (receipt.status === 1) {
        setLpApproveState(APPROVED)
      }
    } catch (err) {
      setLpApproveState(NEED_APPROVE)
      logMessage("approve err: ", err, "\napprove err lpAddress: ", lpAddress);
    }
    setPendingTx(false);

    setReady(true);
  };

  const removeLiquidity = async () => {
    logMessage("removeLiquidity");
    const routerContract = new ethers.Contract(
      networks[chainIndex].DEX.Router,
      routerAbi,
      web3Provider.getSigner()
    );

    setReloadUserLp(1);
    setPendingTx(true);

    // Slippage Tolerance 5%
    const slippageTolerance = 5;
    try {
      var nowTimestamp = (await web3Provider.getBlock()).timestamp;
      if (receiveNToken === GENERAL_TOKEN || receiveNToken === W_NATIVE_TOKEN) {
        var tx = await routerContract.removeLiquidity(
          tokenAAddr,
          tokenBAddr,
          ethers.utils.parseUnits((lpBalance * removeAmount / 100).toString(), lpDecimals),
          ethers.utils.parseUnits((tokenABalance * lpBalance / lpTotalSupply * removeAmount * (100 - slippageTolerance) / 10000).toString(), tokenADecimals),
          ethers.utils.parseUnits((tokenBBalance * lpBalance / lpTotalSupply * removeAmount * (100 - slippageTolerance) / 10000).toString(), tokenBDecimals),
          account,
          nowTimestamp + config.SWAP_DEADLINE, // deadline: 20 mins
        )
      } else if (receiveNToken === NATIVE_TOKEN) {
        if (
          tokenAAddr === "-" ||
          tokenAAddr === "0x0000000000000000000000000000000000000000" ||
          tokenAAddr.toLowerCase() === networks[chainIndex].Currency.Address.toLowerCase()) {

          tx = await routerContract.removeLiquidityETH(
            tokenBAddr,
            ethers.utils.parseUnits((lpBalance * removeAmount / 100).toString(), lpDecimals),
            ethers.utils.parseUnits((tokenBBalance * lpBalance / lpTotalSupply * removeAmount * (100 - slippageTolerance) / 10000).toString(), tokenBDecimals),
            ethers.utils.parseUnits((tokenABalance * lpBalance / lpTotalSupply * removeAmount * (100 - slippageTolerance) / 10000).toString(), tokenADecimals),
            account,
            nowTimestamp + config.SWAP_DEADLINE, // deadline: 20 mins
          )

        } else if (
          tokenBAddr === "-" ||
          tokenBAddr === "0x0000000000000000000000000000000000000000" ||
          tokenBAddr.toLowerCase() === networks[chainIndex].Currency.Address.toLowerCase()) {

          tx = await routerContract.removeLiquidityETH(
            tokenAAddr,
            ethers.utils.parseUnits((lpBalance * removeAmount / 100).toString(), lpDecimals),
            ethers.utils.parseUnits((tokenABalance * lpBalance / lpTotalSupply * removeAmount * (100 - slippageTolerance) / 10000).toString(), tokenADecimals),
            ethers.utils.parseUnits((tokenBBalance * lpBalance / lpTotalSupply * removeAmount * (100 - slippageTolerance) / 10000).toString(), tokenBDecimals),
            account,
            nowTimestamp + config.SWAP_DEADLINE, // deadline: 20 mins
          )

        }
      }
      const receipt = await tx.wait(tx);
      await updateLpInfo();
      if (receipt.status === 1) {
        alert(`remove liquidity success`);
      }
    } catch (err) {
      logMessage("remove liquidity err: ", err);
      if (err.code === 4001) {
        alert(`User denied transaction signature.`)
      }
    }
    setReloadUserLp(2);
    setPendingTx(false);
  }

  useEffect(() => {
    const reUpdateLpInfo = async () => {
      await updateLpInfo()
      if (ethers.utils.isAddress(account) &&
        ethers.utils.isAddress(lpAddress) &&
        lpAddress !== "0x0000000000000000000000000000000000000000" &&
        chainIndex >= 0) {
        setReceiveNToken(GENERAL_TOKEN)
        setReady(true);
      };
    }
    reUpdateLpInfo()
  }, [chainIndex, lpAddress, account])

  useEffect(() => {
    if (ethers.utils.isAddress(params.lpAddress)) {
      setLpAddress(params.lpAddress);
    }
  }, [params])

  useEffect(() => {
    isApproved();
  }, [removeAmount, lpBalance])

  useEffect(() => {
    switch (receiveNToken) {
      case NATIVE_TOKEN:
        if (
          tokenAAddrIsInList === "-" ||
          tokenAAddrIsInList === "0x0000000000000000000000000000000000000000" ||
          tokenAAddrIsInList.toLowerCase() === networks[chainIndex].Currency.Address.toLowerCase()
        ) {
          setTokenAAddrIsInList("0x0000000000000000000000000000000000000000");
          setTokenASymbol(networks[chainIndex].Currency.Name);
        } else if (
          tokenBAddrIsInList === "-" ||
          tokenBAddrIsInList === "0x0000000000000000000000000000000000000000" ||
          tokenBAddrIsInList.toLowerCase() === networks[chainIndex].Currency.Address.toLowerCase()
        ) {
          setTokenBAddrIsInList("0x0000000000000000000000000000000000000000");
          setTokenBSymbol(networks[chainIndex].Currency.Name);
        } else {
          // logMessage("else routine NATIVE_TOKEN")
        }
        break;
      case W_NATIVE_TOKEN:
        if (
          tokenAAddrIsInList === "-" ||
          tokenAAddrIsInList === "0x0000000000000000000000000000000000000000" ||
          tokenAAddrIsInList.toLowerCase() === networks[chainIndex].Currency.Address.toLowerCase()
        ) {
          setTokenAAddrIsInList(networks[chainIndex].Currency.Address);
          setTokenASymbol(networks[chainIndex].Currency.WrappedName);
        } else if (
          tokenBAddrIsInList === "-" ||
          tokenBAddrIsInList === "0x0000000000000000000000000000000000000000" ||
          tokenBAddrIsInList.toLowerCase() === networks[chainIndex].Currency.Address.toLowerCase()
        ) {
          setTokenBAddrIsInList(networks[chainIndex].Currency.Address);
          setTokenBSymbol(networks[chainIndex].Currency.WrappedName);
        } else {
          // logMessage("else routine W_NATIVE_TOKEN")
        }
        break;
      case GENERAL_TOKEN:
        if (
          tokenAAddrIsInList === "-" ||
          tokenAAddrIsInList === "0x0000000000000000000000000000000000000000" ||
          tokenAAddrIsInList.toLowerCase() === networks[chainIndex].Currency.Address.toLowerCase() ||
          tokenBAddrIsInList === "-" ||
          tokenBAddrIsInList === "0x0000000000000000000000000000000000000000" ||
          tokenBAddrIsInList.toLowerCase() === networks[chainIndex].Currency.Address.toLowerCase()
        ) {
          setReceiveNToken(NATIVE_TOKEN)
        } else {
          // logMessage("else routine GENERAL_TOKEN")
        }
        break;
      default:
        break;
    }
  }, [receiveNToken])

  const SubmitButton = () => {
    // logMessage("SubmitButton")
    if (account) {
      if (!ready) {
        return <button className='default-btn w-100' disabled="disabled">Please wait...</button>
      }
      else if (lpApproveState === NEED_APPROVE) {
        return <button className="default-btn w-100" disabled={!ready}
          onClick={() => approve()}>Enable</button>;
      }
      else if (error) {
        return <button className="default-btn w-100" disabled="disabled">{error}</button>;
      }
      else {
        return <button className="default-btn w-100" disabled={!ready} onClick={() => removeLiquidity()}>Remove</button>;
      }
    }
    else {
      return <ConnectButtonModal />;
    }
  };

  const handleReceiveNativeToken = () => {
    // logMessage("handleReceiveNativeToken")
    receiveNToken !== NATIVE_TOKEN ? setReceiveNToken(NATIVE_TOKEN) : setReceiveNToken(W_NATIVE_TOKEN)
  }

  const ReceiveNativeToken = () => {
    if (
      tokenAAddrIsInList === "-" ||
      tokenAAddrIsInList === "0x0000000000000000000000000000000000000000" ||
      tokenAAddrIsInList.toLowerCase() === networks[chainIndex].Currency.Address.toLowerCase() ||
      tokenBAddrIsInList === "-" ||
      tokenBAddrIsInList === "0x0000000000000000000000000000000000000000" ||
      tokenBAddrIsInList.toLowerCase() === networks[chainIndex].Currency.Address.toLowerCase()
    ) {
      return (
        <button className='letter-button' disabled={!ready}
          onClick={() => handleReceiveNativeToken()}>
          Receive {receiveNToken !== W_NATIVE_TOKEN ?
            networks[chainIndex].Currency.WrappedName :
            networks[chainIndex].Currency.Name}
        </button>
      )
    } else {
      return (<></>)
    }
  }

  return (
    <>
      <div className="dex">
        <DEXSubmenu />
        {(parseFloat(lpBalance) > 0 && tokenASymbol !== "" && tokenBSymbol !== "") ?
          <div id='liquidity' className={`${pendingTx ? "loading-state" : ""}`} >
            <LiquidityHeader
              title={`Remove ${tokenASymbol}-${tokenBSymbol} liquidity`}
              content={`To receive ${tokenASymbol} and ${tokenBSymbol}`} />
            <div className='p-3 mt-4'>
              <div>
                <div className='d-flex justify-content-between'>
                  <div>Amount</div>
                  {/* <div className='hand' onClick={() => setDetailed(!detailed)}>Detailed</div> */}
                </div>
                {detailed &&
                  <>
                    <div className='fs-4 mt-3 mb-3'>{removeAmount}%</div>
                    <div>
                      <InputRange
                        step={1}
                        maxValue={100}
                        minValue={0}
                        value={removeAmount}
                        onChange={(value) => {
                          setRemoveAmount(value);
                        }}
                      />
                    </div>
                    <div className='mt-3 mb-3 d-flex justify-content-around gap-2'>
                      <button className='default-btn' onClick={() => { setRemoveAmount(25) }}>25%</button>
                      <button className='default-btn' onClick={() => { setRemoveAmount(50) }}>50%</button>
                      <button className='default-btn' onClick={() => { setRemoveAmount(75) }}>75%</button>
                      <button className='default-btn' onClick={() => { setRemoveAmount(100) }}>Max</button>
                    </div>
                  </>
                }
              </div>
              {detailed &&
                <div className='mt-4'>
                  <div>YOU WILL RECEIVE</div>
                  <div className='flex justify-content-between'>
                    <div className='mt-2 d-flex justify-content-between'>
                      <div className='d-flex fs-5 align-items-center'>
                        <div>
                          <img className='col-auto' style={{ height: 32, paddingLeft: 10, paddingRight: 15 }}
                            src={
                              (tokenAAddrIsInList !== "" && networks[chainIndex]) ?
                                `/assets/tokens/${networks[chainIndex].chainId}/${tokenAAddrIsInList}.png` :
                                "/assets/tokens/empty.png"
                            }
                            alt={tokenASymbol} />
                        </div>
                        <div>{tokenASymbol}</div>
                      </div>
                      <div style={{ color: "#40FF97" }}>
                        {
                          parseFloat(lpTotalSupply) > 0 ?
                            formatNumber(Number(tokenABalance * lpBalance / lpTotalSupply * removeAmount / 100), 1, 5) :
                            0
                        }
                      </div>
                    </div>
                    <div className='mt-2 d-flex justify-content-between'>
                      <div className='d-flex fs-5 align-items-center'>
                        <div>
                          <img className='col-auto' style={{ height: 32, paddingLeft: 10, paddingRight: 15 }}
                            src={
                              (tokenBAddrIsInList !== "" && networks[chainIndex]) ?
                                `/assets/tokens/${networks[chainIndex].chainId}/${tokenBAddrIsInList}.png` :
                                "/assets/tokens/empty.png"
                            }
                            alt={tokenBSymbol} />
                        </div>
                        <div>{tokenBSymbol}</div>
                      </div>
                      <div style={{ color: "#40FF97" }}>
                        {
                          parseFloat(lpTotalSupply) > 0 ?
                            formatNumber(Number(tokenBBalance * lpBalance / lpTotalSupply * removeAmount / 100), 1, 5) :
                            0
                        }
                      </div>
                    </div>
                    <div className='mt-2 d-flex justify-content-end'>
                      <ReceiveNativeToken />
                    </div>
                  </div>
                </div>
              }
              {!detailed && <>
                <div className='wallet-tabs mt-3'>
                  <div className='tab_content p-0'>
                    <div className="form-group">
                      <div className="row justify-content-between">
                        <div className="col">
                          <label htmlFor="from" className="w-100">From</label>
                        </div>
                        <div className="col text-end">
                          <button type="button" className="w-100 text-end badge btn text-white">Balance: 0.0</button>
                        </div>
                      </div>
                      <div className="input-group">
                        <input id="from" type="text" className="form-control me-2" placeholder="0" autoComplete="off" min="0" value={0} />
                        <div className="input-group-addon">
                          <button type="button" className="default-btn" onClick={() => setShowTokenSelectModal("from")}>BNB</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <>
                  <div className='wallet-tabs mt-4'>
                    <div className='tab_content p-0'>
                      <div className="form-group">
                        <div className="row justify-content-between">
                          <div className="col">
                            <label htmlFor="from" className="w-100">From</label>
                          </div>
                          <div className="col text-end">
                            <button type="button" className="w-100 text-end badge btn text-white">Balance: 0.0</button>
                          </div>
                        </div>
                        <div className="input-group">
                          <input id="from" type="text" className="form-control me-2" placeholder="0" autoComplete="off" min="0" value={0} />
                          <div className="input-group-addon">
                            <button type="button" className="default-btn" onClick={() => setShowTokenSelectModal("from")}>BNB</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
                <>
                  <div className='wallet-tabs mt-4'>
                    <div className='tab_content p-0'>
                      <div className="form-group">
                        <div className="row justify-content-between">
                          <div className="col">
                            <label htmlFor="from" className="w-100">From</label>
                          </div>
                          <div className="col text-end">
                            <button type="button" className="w-100 text-end badge btn text-white">Balance: 0.0</button>
                          </div>
                        </div>
                        <div className="input-group">
                          <input id="from" type="text" className="form-control me-2" placeholder="0" autoComplete="off" min="0" value={0} />
                          <div className="input-group-addon">
                            <button type="button" className="default-btn" onClick={() => setShowTokenSelectModal("from")}>BNB</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              </>}
              <hr />
              <div>
                <div>PRICE</div>
                <div className='flex justify-content-between'>
                  <div className='mt-2 d-flex justify-content-between'>
                    <div className='d-flex fs-5 align-items-center'>
                      {`1 ${tokenASymbol}`} =
                    </div>
                    <div style={{ color: "#40FF97" }}>
                      {
                        parseFloat(tokenABalance) > 0 ?
                          `${formatNumber(Number(tokenBBalance / tokenABalance), 1, 5)} ${tokenBSymbol}` :
                          0
                      }
                    </div>
                  </div>
                  <div className='mt-2 d-flex justify-content-between'>
                    <div className='d-flex fs-5 align-items-center'>
                      {`1 ${tokenBSymbol}`} =
                    </div>
                    <div style={{ color: "#40FF97" }}>
                      {
                        parseFloat(tokenBBalance) > 0 ?
                          `${formatNumber(Number(tokenABalance / tokenBBalance), 1, 5)} ${tokenASymbol}` :
                          0
                      }
                    </div>
                  </div>
                </div>
              </div>
              <hr />
              <div className='mt-5 d-flex justify-content-around gap-2'>
                <SubmitButton />
              </div>
            </div>
          </div> :
          <div id='liquidity' >
            <LiquidityHeader
              title={`Remove liquidity`}
              content={`Please wait...`} />
            <div className='p-3 mt-4'>
              <div>
                <div className='d-flex justify-content-between'>
                  <div>Amount</div>
                </div>
                {detailed &&
                  <>
                    <div className='fs-4 mt-3 mb-3'>{removeAmount}%</div>
                    <div>
                      <InputRange
                        step={1}
                        maxValue={100}
                        minValue={0}
                        value={removeAmount}
                        onChange={(value) => {
                          setRemoveAmount(value);
                        }}
                      />
                    </div>
                    <div className='mt-3 mb-3 d-flex justify-content-around gap-2'>
                      <button className='default-btn' onClick={() => { setRemoveAmount(25) }}>25%</button>
                      <button className='default-btn' onClick={() => { setRemoveAmount(50) }}>50%</button>
                      <button className='default-btn' onClick={() => { setRemoveAmount(75) }}>75%</button>
                      <button className='default-btn' onClick={() => { setRemoveAmount(100) }}>Max</button>
                    </div>
                  </>
                }
              </div>
            </div>
          </div>
        }
        <UserLpToken
          network={networks[chainIndex]}
          lpAddress={
            (lpAddress && lpAddress !== "0x0000000000000000000000000000000000000000") ?
              lpAddress :
              ""
          }
          account={account}
          reload={reloadUserLp} />
        <TokenSelectModal
          showFor={showTokenSelectModal}
          hide={() => setShowTokenSelectModal()}
          onSelect={onSelectToken}
          network={networks[chainIndex]} />
      </div>
      {pendingTx ?
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

export { LiquidityRemove }
