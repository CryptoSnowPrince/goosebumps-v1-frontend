import React, { useEffect, useState } from 'react';
import { Contract, Provider, setMulticallAddress } from 'ethers-multicall';
import { ethers } from 'ethers';
import linq from "linq";

import "./userLpToken.scss"

import pairAbi from '../../abis/pair.json';
import tokenAbi from '../../abis/token.json';
import { formatNumberWithoutComma } from '../../utils/number';

/**
 * props.reload
 *     0: hide and update
 *     others: show and update
 */

const UserLpToken = (props) => {
  // console.log("UserLpToken props", props)
  const [lpBalance, setLpBalance] = useState(0);
  const [lpTotalSupply, setLpTotalSupply] = useState(0);
  const [tokenABalance, setTokenABalance] = useState(0);
  const [tokenBBalance, setTokenBBalance] = useState(0);
  const [tokenASymbol, setTokenASymbol] = useState("");
  const [tokenBSymbol, setTokenBSymbol] = useState("");
  const [tokenAAddrIsInList, setTokenAAddrIsInList] = useState("");
  const [tokenBAddrIsInList, setTokenBAddrIsInList] = useState("");

  const updateLpInfo = async () => {
    // console.log("UserLpToken updateBalance")
    const provider = new ethers.providers.JsonRpcProvider(props.network.RPC);
    if (props.network.chainId === 97) // When bsc testnet
    {
      setMulticallAddress(props.network.chainId, props.network.MulticallAddress);
    }
    const ethcallProvider = new Provider(provider);

    try {
      await ethcallProvider.init();

      if (ethers.utils.isAddress(props.account) && ethers.utils.isAddress(props.lpAddress)) {
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

        const contract = new Contract(props.lpAddress, pairAbi);
        [lpBalance, lpTotalSupply, lpDecimals, tokenAAddress, tokenBAddress] = await ethcallProvider.all([
          contract.balanceOf(props.account),
          contract.totalSupply(),
          contract.decimals(),
          contract.token0(),
          contract.token1(),
        ]);

        setLpBalance(ethers.utils.formatUnits(lpBalance, lpDecimals));
        setLpTotalSupply(ethers.utils.formatUnits(lpTotalSupply, lpDecimals));

        const tokenAContract = new Contract(tokenAAddress, tokenAbi);
        const tokenBContract = new Contract(tokenBAddress, tokenAbi);

        const tokenList = require("../../tokens/" + props.network.Name)
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
          tokenAContract.balanceOf(props.lpAddress),
          tokenAContract.symbol(),
          tokenAContract.decimals(),
          tokenBContract.balanceOf(props.lpAddress),
          tokenBContract.symbol(),
          tokenBContract.decimals(),
        ])

        setTokenABalance(ethers.utils.formatUnits(tokenABalance, tokenADecimals));
        setTokenBBalance(ethers.utils.formatUnits(tokenBBalance, tokenBDecimals));
        setTokenASymbol(
          tokenAAddress === props.network.Currency.Address ? props.network.Currency.Name : tokenASymbol
        )
        setTokenBSymbol(
          tokenBAddress === props.network.Currency.Address ? props.network.Currency.Name : tokenBSymbol
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
      console.log("updateLpInfo err: ", error)
    }
  };

  useEffect(() => {
    updateLpInfo()
  }, [props.network, props.lpAddress, props.account, props.reload])

  return (
    <>
      {(props.reload !== 0 &&
        parseFloat(lpBalance) > 0 &&
        parseFloat(lpTotalSupply) > 0 &&
        tokenASymbol !== "" &&
        tokenBSymbol !== "") ?
        <div className='mt-4 p-3' id="userLpToken">
          <div className='mt-2 fs-5'>LP tokens in your wallet</div>
          <div className='mt-2 d-flex justify-content-between'>
            <div className='d-flex fs-5 align-items-center'>
              <div>
                <img className='col-auto' style={{ height: 32 }}
                  src={
                    (tokenAAddrIsInList !== "" && props.network) ?
                      `/assets/tokens/${props.network.chainId}/${tokenAAddrIsInList}.png` :
                      "/assets/tokens/empty.png"
                  }
                  alt={tokenASymbol} />
              </div>
              <div>
                <img className='col-auto' style={{ height: 32, paddingLeft: 5, paddingRight: 15 }}
                  src={
                    (tokenBAddrIsInList !== "" && props.network) ?
                      `/assets/tokens/${props.network.chainId}/${tokenBAddrIsInList}.png` :
                      "/assets/tokens/empty.png"
                  }
                  alt={tokenBSymbol} />
              </div>
              <div>{tokenASymbol}{"-"}{tokenBSymbol} {"LP"}</div>
            </div>
            <div className='fs-6'>{formatNumberWithoutComma(Number(lpBalance), 1, 5)}</div>
          </div>
          <div className='mt-2 d-flex justify-content-between'>
            <div className='d-flex align-items-center'>
              <div style={{ color: "#04C0D7" }}>Share of Pool:</div>
            </div>
            <div style={{ color: "#40FF97" }}>
              {formatNumberWithoutComma(Number(lpBalance / lpTotalSupply * 100), 1, 5)}%
            </div>
          </div>
          <div className='mt-2 d-flex justify-content-between  mt-2'>
            <div className='d-flex align-items-center'>
              <div style={{ color: "#04C0D7" }}>
                Pooled {tokenASymbol}:
              </div>
            </div>
            <div style={{ color: "#40FF97" }}>{formatNumberWithoutComma(Number(tokenABalance * lpBalance / lpTotalSupply), 1, 5)}</div>
          </div>
          <div className='mt-2 d-flex justify-content-between  mt-2'>
            <div className='d-flex align-items-center'>
              <div style={{ color: "#04C0D7" }}>
                Pooled {tokenBSymbol}:
              </div>
            </div>
            <div style={{ color: "#40FF97" }}>{formatNumberWithoutComma(Number(tokenBBalance * lpBalance / lpTotalSupply), 1, 5)}</div>
          </div>
        </div>
        : ""}
    </>
  );
}

export { UserLpToken }
