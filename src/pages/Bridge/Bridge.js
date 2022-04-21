import React, { useState } from 'react';
import { ChainList } from "./ChainList";

import './Bridge.scss'
import ETH from "../../assets/ETH.png";
import BSC from "../../assets/BSC.png";

const Bridge = () => {
  const chainListData = [
    {
      icon: ETH,
      simbol: "ETH",
    },
    {
      icon: BSC,
      simbol: "BTC",
    },
  ];
  const [bridgeWalletConnectStatus, setBridgeWalletConnectStatus] = useState(false);

  return (
    <div id='bridge' className={`${!bridgeWalletConnectStatus ? `p-5` : `p-4`}`}>
      <div className='align-items-center d-flex flex-column flex-sm-row gap-5 justify-content-between'>
        <ChainList title={"Wallet Connected from"} chainListData={chainListData} defaultID={0} />
        <ChainList title={"Transferring to"} chainListData={chainListData} defaultID={1} />
      </div>

      {bridgeWalletConnectStatus && <div className='d-flex justify-content-center mt-4 tokenList'><ChainList title={"Token"} chainListData={chainListData} defaultID={1} /></div>}
      {!bridgeWalletConnectStatus && <div className='d-flex justify-content-center mt-5'>
        <input placeholder='Enter Amount' className='bridge-amount w-75' />
      </div>}
      {bridgeWalletConnectStatus && (<>
        <div class="col-md-4 mt-5 textOnInput w-75">
          <label for="inputText">Reciepent</label>
          <input class="input-with-label" type="text" />
        </div>
        <div class="col-md-4 mt-4 textOnInput w-75">
          <label for="inputText">Enter Amount</label>
          <input class="input-with-label" type="text" />
        </div>
      </>)}
      <div className='d-flex justify-content-center mt-4'>
        <button onClick={() => setBridgeWalletConnectStatus(!bridgeWalletConnectStatus)} className='mt-2 bridge-connect-wallet w-50 default-btn'>{!bridgeWalletConnectStatus ? "Connect Wallet" : "Transfer Amount"}</button>
      </div>
    </div>
  );
}

export { Bridge }
