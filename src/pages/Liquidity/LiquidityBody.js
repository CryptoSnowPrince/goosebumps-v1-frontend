import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import { UserTokenPair } from './UserTokenPair'
import * as selector from '../../store/selectors'
import config from '../../constants/config'
import networks from '../../networks'
import { ethers } from 'ethers';

const LiquidityBody = () => {
  const account = useSelector(selector.accountState);
  const chainIndex = useSelector(selector.chainIndex);

  const [ready, setReady] = useState(true)
  const [lpList, setLpList] = useState([])

  const fetchLpList = async (address, chainIndex) => {
    setReady(false)
    var userAllTokenBalance;
    var chainName = "";
    switch (networks[chainIndex].Name) {
      case "ethereum":
        chainName = "ethereum";
        break;
      case "bsc":
        chainName = "bsc";
        break;
      case "bsctestnet":
        chainName = "bsc_testnet";
        break;
      case "polygon":
        chainName = "matic";
        break;
      default:
        break;
    }
    // console.log("chainName: ", chainName);
    try {
      if (ethers.utils.isAddress(address)) {
        if (chainName !== "") {
          let url = "https://graphql.bitquery.io/";
          let query = `query ($network: EthereumNetwork!, $address: String!) {ethereum(network: $network) {address(address: {is: $address}) {balances {currency {symbol address}}}}}`;
          let variables = `{"limit": 10,"offset": 0,"network": "` + chainName + `","address": "` + address + `"}`;
          let opts = {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-API-KEY": config.GET_TOEKN_LIST_API_KEY
            },
            body: JSON.stringify({
              query,
              variables
            })
          };
          await fetch(url, opts).then(res => res.json())
            .then(data => userAllTokenBalance = data.data.ethereum.address[0].balances)
            .catch(console.error);
          var schedLpList = (userAllTokenBalance ? userAllTokenBalance : []).filter(e => e.currency.symbol === "GooseBumps-LP").map(t => t.currency.address);
          schedLpList = JSON.parse(JSON.stringify(schedLpList).toLowerCase())
          if (localStorage.getItem(networks[chainIndex].Name + "LpList")) {
            setLpList([...new Set(
              [
                ...schedLpList,
                ...JSON.parse(
                  localStorage
                    .getItem(networks[chainIndex].Name + "LpList")
                )
              ]
            )
            ]);
          } else {
            setLpList(schedLpList)
          }
        } else {
          if (localStorage.getItem(networks[chainIndex].Name + "LpList")) {
            setLpList(JSON.parse(localStorage.getItem(networks[chainIndex].Name + "LpList")));
          }
        }
      } else {
        setLpList([])
      }
    } catch (error) {
      setLpList([])
      console.log("fetchLpList err: ", error)
    }
    setReady(true)
  }

  useEffect(() => {
    fetchLpList(account, chainIndex)
  }, [account, chainIndex]);

  useEffect(() => {
    console.log("lpList: ", lpList)
    // lpList.map((lpaddress, idx) => {
    //   console.log("map: ", lpaddress)
    //   console.log("map: ", idx)
    // })
  }, [lpList])

  const MainBody = () => {
    if (!ready) {
      return (
        <div className='text-center content d-flex align-items-center justify-content-center'>
          Please wait...
        </div>
      );
    } else if (!ethers.utils.isAddress(account)) {
      return (
        <div className='text-center content d-flex align-items-center justify-content-center'>
          Connect to a wallet to view your liquidity.
        </div>
      );
    } else {
      return (
        <>
          {(lpList.length < 1) ? (<div className='text-center'>No liquidity found.</div>) :
            (
              lpList.map((lpaddress, idx) => (
                <UserTokenPair
                  key={idx}
                  network={networks[chainIndex]}
                  lpAddress={lpaddress}
                  account={account}
                  reload={false} />
              ))
            )}
          <div className='text-center mt-4'>Don't see a pool you joined?</div>
          <div className='d-flex justify-content-center mt-3 mb-4'>
            <Link to="/liquidityFindToken">
              <button className='default-btn fs-6'>
                Find other LP tokens
              </button>
            </Link>
          </div>
        </>
      )
    }
  }

  return (
    <div className='liquidityBody p-3'>
      <MainBody />
      <hr />
      <div className='d-flex justify-content-center mt-4'>
        <Link to="/liquidityAdd">
          <button className='default-btn liquidity-btn fs-6'>
            + Add Liquidity
          </button>
        </Link>
      </div>
    </div>
  );
}

export { LiquidityBody }
