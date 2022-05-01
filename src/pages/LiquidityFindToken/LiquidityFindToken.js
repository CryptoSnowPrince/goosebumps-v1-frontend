import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { ethers } from 'ethers';
import linq from "linq";

import DEXSubmenu from '../../components/Submenu/DEXSubmenu'
import { LiquidityHeader } from "../../components/LiquidityHeader/LiquidityHeader";
import { UserLpToken } from "../LiquidityAdd/UserLpToken"
import { TokenSelectModal } from "../../components/widgets/exchange/TokenSelectModal"
import tokenAbi from '../../abis/token';
import factoryAbi from '../../abis/factory';

import * as selector from '../../store/selectors'
import networks from '../../networks.json'

import "react-input-range/lib/css/index.css";
import '../Liquidity/Liquidity.scss'

const LiquidityFindToken = () => {
  const chainIndex = useSelector(selector.chainIndex);
  const account = useSelector(selector.accountState);

  const [newPool, setNewPool] = useState(false);
  const [lpAddress, setLpAddress] = useState("")

  const [tokenA, setTokenA] = useState({ symbol: "", address: "", decimals: 0 });
  const [tokenB, setTokenB] = useState({ symbol: "", address: "", decimals: 0 });

  const [tokenAAddrIsInList, setTokenAAddrIsInList] = useState("");
  const [tokenBAddrIsInList, setTokenBAddrIsInList] = useState("");

  const [showTokenSelectModal, setShowTokenSelectModal] = useState();

  const onSelectToken = (token, forTarget) => {
    // console.log("LiquidityFindToken onSelectToken")
    // console.log(token, forTarget)
    if ((token.Address === tokenB.address && forTarget === "tokenA") || (token.Address === tokenA.address && forTarget === "tokenB")) {
      invert();
    }
    else {
      if (forTarget === "tokenA") {
        const newTokenA = Object.assign({}, tokenA);
        newTokenA.address = token.Address;
        newTokenA.symbol = token.Symbol;
        newTokenA.decimals = token.Decimals;
        setTokenA(newTokenA);
      }
      else {
        const newTokenB = Object.assign({}, tokenB);
        newTokenB.address = token.Address;
        newTokenB.symbol = token.Symbol;
        newTokenB.decimals = token.Decimals;
        setTokenB(newTokenB);
      }
    }
  }

  const tokenIsInList = (tokenAaddress, tokenBaddress) => {
    console.log("tokenIsInList: \n    tokenAaddress: ", tokenAaddress, "\n    tokenBaddress: ", tokenBaddress)
    const tokenList = require("../../tokens/" + networks[chainIndex].Name)
    if (tokenAaddress === "-") {
      setTokenAAddrIsInList("0x0000000000000000000000000000000000000000");
    } else {
      var sched = linq.from(tokenList).where(x => x.Address === tokenAaddress).toArray();
      if (sched.length === 0) {
        setTokenAAddrIsInList("");
      } else {
        setTokenAAddrIsInList(tokenAaddress);
      }
    }
    if (tokenBaddress === "-") {
      setTokenBAddrIsInList("0x0000000000000000000000000000000000000000");
    } else {
      sched = linq.from(tokenList).where(x => x.Address === tokenBaddress).toArray();
      if (sched.length === 0) {
        setTokenBAddrIsInList("");
      } else {
        setTokenBAddrIsInList(tokenBaddress);
      }
    }
  }

  const invert = () => {
    // console.log("invert")
    const newTokenA = Object.assign({}, tokenB);
    const newTokenB = Object.assign({}, tokenA);
    setTokenA(newTokenA);
    setTokenB(newTokenB);
  }

  const isInvalidPair = () => {
    return !(tokenA.symbol && tokenB.symbol) ||
      (tokenA.address === "-" && tokenB.address === networks[chainIndex].Currency.Address) ||
      (tokenB.address === "-" && tokenA.address === networks[chainIndex].Currency.Address)
  }

  const isNewPair = async (tokenAAddress, tokenBAddress) => {
    if (tokenAAddress === "-") tokenAAddress = networks[chainIndex].Currency.Address;
    if (tokenBAddress === "-") tokenBAddress = networks[chainIndex].Currency.Address;
    const provider = new ethers.providers.JsonRpcProvider(networks[chainIndex].RPC);
    const contract = new ethers.Contract(
      networks[chainIndex].DEX.Factory,
      factoryAbi,
      provider
    );
    try {
      const pairAddress = await contract.getPair(tokenAAddress, tokenBAddress)
      setLpAddress(pairAddress);
      if (pairAddress === "0x0000000000000000000000000000000000000000") {
        setNewPool(true)
      } else {
        const tokenAContract = new ethers.Contract(tokenAAddress, tokenAbi, provider);
        const tokenABalance = await tokenAContract.balanceOf(pairAddress);
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
  }

  useEffect(() => {
    // console.log("tokenA: ", tokenA)
    // console.log("tokenB: ", tokenB)
    tokenIsInList(tokenA.address, tokenB.address);
    if (!isInvalidPair()) {
      isNewPair(tokenA.address, tokenB.address);
    } else {
      setLpAddress("");
    }
  }, [tokenA, tokenB])

  useEffect(() => {
    setTokenA({ symbol: "", address: "", decimals: 0, amount: 0, balance: 0 })
    setTokenB({ symbol: "", address: "", decimals: 0, amount: 0, balance: 0 })
    // console.log("networks[chainIndex]: ", networks[chainIndex]);
    // console.log("account: ", account);
  }, [chainIndex, account])

  return (
    <>
      <div className="dex">
        <DEXSubmenu />
        <div id='liquidity' >
          <LiquidityHeader title="Import Poll" content="Import an existing pool"></LiquidityHeader>
          <div className='liquidityfindtoken-body p-4'>
            <div className='wallet-tabs mt-4'>
              <div className='tab_content p-0'>
                <div className="form-group" style={{ padding: 8 }}>
                  <div className="input-group justify-content-between">
                    <div className='d-flex fs-5 align-items-center' style={{ paddingLeft: 10 }} >
                      {
                        tokenA.symbol !== "" ?
                          <>
                            <img className='col-auto' style={{ height: 40, paddingRight: 10 }}
                              src={
                                (tokenAAddrIsInList !== "" && networks[chainIndex]) ?
                                  `/assets/tokens/${networks[chainIndex].chainId}/${tokenAAddrIsInList}.png` :
                                  "/assets/tokens/empty.png"
                              }
                              alt={tokenA.symbol} />
                            <div>{tokenA.symbol}</div>
                          </>
                          : <div onClick={() => setShowTokenSelectModal("tokenA")}>Select a Token</div>
                      }
                    </div>
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
            <div className='wallet-tabs mt-4'>
              <div className='tab_content p-0'>
                <div className="form-group" style={{ padding: 8 }}>
                  <div className="input-group justify-content-between">
                    <div className='d-flex fs-5 align-items-center' style={{ paddingLeft: 10 }} >
                      {
                        tokenB.symbol !== "" ?
                          <>
                            <img className='col-auto' style={{ height: 40, paddingRight: 10 }}
                              src={
                                (tokenBAddrIsInList !== "" && networks[chainIndex]) ?
                                  `/assets/tokens/${networks[chainIndex].chainId}/${tokenBAddrIsInList}.png` :
                                  "/assets/tokens/empty.png"
                              }
                              alt={tokenB.symbol} />
                            <div>{tokenB.symbol}</div>
                          </>
                          : <div onClick={() => setShowTokenSelectModal("tokenB")}>Select a Token</div>
                      }
                    </div>
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
            {
              !ethers.utils.isAddress(account) ?
                (
                  <div className='mt-5 text-center'>
                    <div className='text-center content d-flex align-items-center justify-content-center'>
                      Connect to a wallet to find pools
                    </div>
                  </div>
                ) :
                (
                  <div className='mt-5 text-center'>
                    <div className='text-center content d-flex align-items-center justify-content-center'>
                      Select a token to find your liquidity.
                    </div>
                  </div>
                )
            }
          </div>
        </div>
        <UserLpToken
          network={networks[chainIndex]}
          lpAddress={
            (lpAddress && lpAddress !== "0x0000000000000000000000000000000000000000") ?
              lpAddress :
              ""
          }
          account={account}
          reload={false} />
        <TokenSelectModal
          showFor={showTokenSelectModal}
          hide={() => setShowTokenSelectModal()}
          onSelect={onSelectToken}
          network={networks[chainIndex]} />
      </div>
    </>
  );
}

export { LiquidityFindToken }
