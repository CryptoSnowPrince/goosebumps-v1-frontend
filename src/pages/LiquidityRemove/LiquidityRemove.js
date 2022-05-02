import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import InputRange from "react-input-range";
import { useParams } from 'react-router-dom';
import { ethers, BigNumber } from 'ethers';
import { Contract, Provider, setMulticallAddress } from 'ethers-multicall';

import linq from "linq";
import pairAbi from '../../abis/pair.json';
import tokenAbi from '../../abis/token.json';
import routerAbi from '../../abis/token.json';

import DEXSubmenu from '../../components/Submenu/DEXSubmenu'
import { LiquidityHeader } from "../../components/LiquidityHeader/LiquidityHeader";
import { UserLpToken } from "../LiquidityAdd/UserLpToken"
import { TokenSelectModal } from "../../components/widgets/exchange/TokenSelectModal"
import { ConnectButtonModal } from '../../components/widgets/ConnectButtonModal';

import "react-input-range/lib/css/index.css";
import '../Liquidity/Liquidity.scss'

import * as selector from '../../store/selectors';
import networks from '../../networks.json'
import { formatNumberWithoutComma } from '../../utils/number';

const NOT_NEED_APPROVE = 0;
const NEED_APPROVE = 1;
const APPROVING = 2;
const APPROVED = 3;

const NATIVE_TOKEN = 0;
const W_NATIVE_TOKEN = 1;

const lpDecimals = 18;

const LiquidityRemove = () => {
  const account = useSelector(selector.accountState);
  const web3Provider = useSelector(selector.web3ProviderState);
  const chainIndex = useSelector(selector.chainIndex);

  const [removeAmount, setRemoveAmount] = useState(50);
  const [detailed, setDetailed] = useState(true);

  const [ready, setReady] = useState(false)
  const [error, setError] = useState(false)
  const [reloadUserLp, setReloadUserLp] = useState(1);
  const [receiveNTokenIsNeed, setReceiveNTokenIsNeed] = useState("");
  const [receiveNToken, setReceiveNToken] = useState(W_NATIVE_TOKEN)

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
  const [tokenAAddrIsInList, setTokenAAddrIsInList] = useState("");
  const [tokenBAddrIsInList, setTokenBAddrIsInList] = useState("");

  const [showTokenSelectModal, setShowTokenSelectModal] = useState();

  const params = useParams();

  const onSelectToken = (token, forTarget) => {
    console.log(token, forTarget)
  }

  const updateLpInfo = async () => {
    console.log("LiquidityRemove updateLpInfo")
    const provider = new ethers.providers.JsonRpcProvider(networks[chainIndex].RPC);
    if (networks[chainIndex].chainId === 97) // When bsc testnet
    {
      setMulticallAddress(networks[chainIndex].chainId, networks[chainIndex].MulticallAddress);
    }
    const ethcallProvider = new Provider(provider);

    try {
      await ethcallProvider.init();

      if (ethers.utils.isAddress(account) && ethers.utils.isAddress(lpAddress)) {
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

        const tokenList = require("../../tokens/" + networks[chainIndex].Name)
        var sched = linq.from(tokenList).where(x => x.Address === tokenAAddress).toArray();
        if (sched.length === 0) {
          setTokenAAddrIsInList("");
        } else {
          setTokenAAddrIsInList(tokenAAddress);
        }
        sched = linq.from(tokenList).where(x => x.Address === tokenBAddress).toArray();
        if (sched.length === 0) {
          setTokenBAddrIsInList("");
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
        setTokenASymbol(
          tokenAAddress === networks[chainIndex].Currency.Address ? networks[chainIndex].Currency.Name : tokenASymbol
        )
        setTokenBSymbol(
          tokenBAddress === networks[chainIndex].Currency.Address ? networks[chainIndex].Currency.Name : tokenBSymbol
        )
      } else {
        setLpBalance(0);
        setLpTotalSupply(0);
        setTokenABalance(0);
        setTokenBBalance(0);
        setTokenASymbol("");
        setTokenBSymbol("");
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
      setTokenAAddrIsInList("");
      setTokenBAddrIsInList("");
      console.log("LiquidityRemove updateLpInfo err: ", error)
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
      if (BigNumber.from(ethers.utils.parseUnits((lpBalance * removeAmount).toString(), lpDecimals))
        .gt(allowance)) {
        setLpApproveState(NEED_APPROVE)
      }
      else {
        setLpApproveState(APPROVED)
      }
    } catch (error) {
      console.log("isApproved err: ", error, "\nisApproved lpAddress: ", lpAddress)
    }
    setReady(true);
  }

  const approve = async () => {
    // console.log("approve");
    const contract = new ethers.Contract(
      lpAddress,
      tokenAbi,
      web3Provider.getSigner()
    );

    setReady(false);

    setLpApproveState(APPROVING);
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
      console.log("approve err: ", err, "\napprove err lpAddress: ", lpAddress);
    }

    setReady(true);
  };

  const remove = async () => {
    const contract = new ethers.Contract(
      networks[chainIndex].DEX.Router,
      routerAbi,
      web3Provider.getSigner()
    );

    setReloadUserLp(1);
    // Slippage Tolerance 5%
    const slippageTolerance = 5;
    try {
      var nowTimestamp = (await web3Provider.getBlock()).timestamp;
      // if (tokenAaddress === "-") {
      //   var options = { value: ethers.utils.parseUnits(tokenA.amount.toString(), tokenA.decimals) };
      //   var tx = await contract.addLiquidityETH(
      //     tokenB.address,
      //     ethers.utils.parseUnits(tokenB.amount.toString(), tokenB.decimals),
      //     ethers.utils.parseUnits((parseFloat(tokenB.amount) * (100 - slippageTolerance) / 100).toString(), tokenB.decimals),
      //     ethers.utils.parseUnits((parseFloat(tokenA.amount) * (100 - slippageTolerance) / 100).toString(), tokenA.decimals),
      //     account,
      //     nowTimestamp + 1200, // deadline: 20mins
      //     options
      //   )
      // }
      // else if (tokenB.address === "-") {
      //   options = { value: ethers.utils.parseUnits(tokenB.amount.toString(), tokenB.decimals) };
      //   tx = await contract.addLiquidityETH(
      //     tokenA.address,
      //     ethers.utils.parseUnits(tokenA.amount.toString(), tokenA.decimals),
      //     ethers.utils.parseUnits((parseFloat(tokenA.amount) * (100 - slippageTolerance) / 100).toString(), tokenA.decimals),
      //     ethers.utils.parseUnits((parseFloat(tokenB.amount) * (100 - slippageTolerance) / 100).toString(), tokenB.decimals),
      //     account,
      //     nowTimestamp + 1200, // deadline: 20mins
      //     options
      //   )
      // }
      // else {
      //   tx = await contract.addLiquidity(
      //     tokenA.address,
      //     tokenB.address,
      //     ethers.utils.parseUnits(tokenA.amount.toString(), tokenA.decimals),
      //     ethers.utils.parseUnits(tokenB.amount.toString(), tokenB.decimals),
      //     ethers.utils.parseUnits((parseFloat(tokenA.amount) * (100 - slippageTolerance) / 100).toString(), tokenA.decimals),
      //     ethers.utils.parseUnits((parseFloat(tokenB.amount) * (100 - slippageTolerance) / 100).toString(), tokenB.decimals),
      //     account,
      //     nowTimestamp + 1200 // deadline: 20mins
      //   );
      // }
      // const receipt = await tx.wait(tx);
      // // console.log("receipt: ", receipt);
      // updateBalance(tokenA.address, tokenA, setTokenA, true).then(() => {
      //   updateBalance(tokenB.address, tokenB, setTokenB, true).then(() => {
      //   });
      // });
      // if (receipt.status === 1) {
      //   alert(`add liquidity success`);
      //   isNewPair(tokenA.address, tokenB.address);
      // }
    } catch (err) {
      console.log("remove liquidity err: ", err);
      if (err.code === 4001) {
        alert(`User denied transaction signature.`)
      }
    }
    setReloadUserLp(2);
  }

  const checkPair = () => {
    if (
      tokenAAddrIsInList === "-" ||
      tokenAAddrIsInList.toLowerCase() === networks[chainIndex].Currency.Address.toLowerCase()
    ) {
      setReceiveNTokenIsNeed("tokenA")
    } else if (
      tokenBAddrIsInList === "-" ||
      tokenBAddrIsInList.toLowerCase() === networks[chainIndex].Currency.Address.toLowerCase()
    ) {
      setReceiveNTokenIsNeed("tokenB")
    } else {
      setReceiveNTokenIsNeed("")
    }
  }

  useEffect(() => {
    updateLpInfo()
    setReady(true);
  }, [chainIndex, lpAddress, account])

  useEffect(() => {
    console.log("LiquidityRemove params: ", params)
    if (ethers.utils.isAddress(params.lpAddress)) {
      setLpAddress(params.lpAddress);
    }
  }, [params])

  useEffect(() => {
    isApproved();
  }, [removeAmount])

  useEffect(() => {
    checkPair()
  }, [tokenAAddrIsInList, tokenBAddrIsInList])

  const SubmitButton = () => {
    // console.log("SubmitButton")
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
        return <button className="default-btn w-100" disabled={!ready} onClick={() => remove()}>Remove</button>;
      }
    }
    else {
      return <ConnectButtonModal />;
    }
  };

  const handleReceiveNativeToken = () => {
    console.log("handleReceiveNativeToken")
    receiveNToken === NATIVE_TOKEN ? setReceiveNToken(W_NATIVE_TOKEN) : setReceiveNToken(NATIVE_TOKEN)
  }

  const ReceiveNativeToken = () => {
    // console.log("ReceiveNativeToken");
    if (
      tokenAAddrIsInList === "-" ||
      tokenAAddrIsInList.toLowerCase() === networks[chainIndex].Currency.Address.toLowerCase()
    ) {
      return (
        <button className='letter-button' disabled={!ready}
          onClick={() => handleReceiveNativeToken()}>
          Receive {receiveNToken === NATIVE_TOKEN ?
            networks[chainIndex].Currency.Name :
            networks[chainIndex].Currency.WrappedName}
        </button>
      )
    } else if (
      tokenBAddrIsInList === "-" ||
      tokenBAddrIsInList.toLowerCase() === networks[chainIndex].Currency.Address.toLowerCase()
    ) {
      return (
        <button className='letter-button' disabled={!ready}
          onClick={() => handleReceiveNativeToken()}>
          Receive {receiveNToken === NATIVE_TOKEN ?
            networks[chainIndex].Currency.Name :
            networks[chainIndex].Currency.WrappedName}
        </button>
      )
    } else {
      return (<></>)
    }
  }

  return (
    <div className="dex">
      <DEXSubmenu />
      {(parseFloat(lpBalance) > 0 && tokenASymbol !== "" && tokenBSymbol !== "") ?
        <div id='liquidity' >
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
                  <div className='fs-4 mt-3 mb-3'>25%</div>
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
                          formatNumberWithoutComma(Number(tokenABalance * lpBalance / lpTotalSupply * removeAmount / 100), 1, 5) :
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
                          formatNumberWithoutComma(Number(tokenBBalance * lpBalance / lpTotalSupply * removeAmount / 100), 1, 5) :
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
                        formatNumberWithoutComma(Number(tokenBBalance / tokenABalance), 1, 5) :
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
                        formatNumberWithoutComma(Number(tokenABalance / tokenBBalance), 1, 5) :
                        0
                    }
                  </div>
                </div>
              </div>
            </div>
            <hr />
            <div className='mt-5 d-flex justify-content-around gap-2'>
              <SubmitButton />
              {/* <button className='default-btn w-50'>Enable</button>
              <button className='default-btn w-50'>Remove</button> */}
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
                {/* <div className='hand' onClick={() => setDetailed(!detailed)}>Detailed</div> */}
              </div>
              {detailed &&
                <>
                  <div className='fs-4 mt-3 mb-3'>25%</div>
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
  );
}

export { LiquidityRemove }
