import React, { useEffect, useState } from 'react';
import { BiHelpCircle } from 'react-icons/bi';
import { Contract, Provider, setMulticallAddress } from 'ethers-multicall';
import { ethers } from 'ethers';

import "./userLpToken.scss"

import pairAbi from '../../abis/pair.json';
import tokenAbi from '../../abis/token.json';

const UserLpToken = (props) => {
  const [lpBalance, setLpBalance] = useState(0);
  const [lpTotalSupply, setLpTotalSupply] = useState(0);
  const [tokenABalance, setTokenABalance] = useState(0);
  const [tokenBBalance, setTokenBBalance] = useState(0);
  const [tokenASymbol, setTokenASymbol] = useState("");
  const [tokenBSymbol, setTokenBSymbol] = useState("");

  const updateLpInfo = async () => {
    console.log("UserLpToken updateBalance")
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
      }
    } catch (error) {
      setLpBalance(0);
      setLpTotalSupply(0);
      setTokenABalance(0);
      setTokenBBalance(0);
      setTokenASymbol("");
      setTokenBSymbol("");
      console.log("update balance err: ", error)
    }
  };

  useEffect(() => {
    updateLpInfo()
  }, [props.network, props.lpAddress, props.account])

  return (
    <div className='mt-4 p-3' id="userLpToken">
      {lpBalance > 0 ?
        <>
          <div className='mt-2 fs-5'>LP tokens in your wallet</div>
          <div className='mt-2 d-flex justify-content-between'>
            <div className='d-flex fs-5 align-items-center'>
              {/* <div><BiHelpCircle /> </div>
              <div><BiHelpCircle /> </div> */}
              <div>
                <img className='col-auto' style={{ height: 32 }}
                  // src={token.Logo ? token.Logo : "/assets/tokens/empty.png"}
                  src={`/assets/tokens/${tokenASymbol}.png` || "/assets/tokens/empty.png"}
                  alt={tokenASymbol} />
              </div>
              <div>
                <img className='col-auto' style={{ height: 32 }}
                  src={`/assets/tokens/${tokenBSymbol}.png` || "/assets/tokens/empty.png"}
                  // src={tokenBSymbol ? token.Logo : "/assets/tokens/empty.png"}
                  alt={tokenBSymbol} />
              </div>
              <div>{tokenASymbol}-</div>
              <div>{tokenBSymbol} {" LP"}</div>
            </div>
            <div className='fs-6'>{lpBalance}</div>
          </div>
          <div className='mt-2 d-flex justify-content-between'>
            <div className='d-flex align-items-center'>
              <div style={{ color: "#04C0D7" }}>Share of Pool:</div>
            </div>
            <div style={{ color: "#40FF97" }}>{lpBalance / lpTotalSupply * 100}%</div>
          </div>
          <div className='mt-2 d-flex justify-content-between  mt-2'>
            <div className='d-flex align-items-center'>
              <div style={{ color: "#04C0D7" }}>Pooled {tokenASymbol}:</div>
            </div>
            <div style={{ color: "#40FF97" }}>{tokenABalance}</div>
          </div>
          <div className='mt-2 d-flex justify-content-between  mt-2'>
            <div style={{ color: "#04C0D7" }}>
              Pooled {tokenBSymbol}:
            </div>
            <div style={{ color: "#40FF97" }}>{tokenBBalance}</div>
          </div>
        </>
        : ""}
    </div>
  );
}

export { UserLpToken }
