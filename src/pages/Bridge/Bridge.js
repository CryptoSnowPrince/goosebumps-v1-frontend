import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import { ChainList } from "./ChainList";

import * as selector from '../../store/selectors';

import './Bridge.scss'

const Bridge = () => {
  const chainListData = [
    {
      icon: "/assets/images/bridge/ETH.png",
      symbol: "Ethereum",
    },
    {
      icon: "/assets/images/bridge/BSC.png",
      symbol: "BSC",
    },
  ];

  const account = useSelector(selector.accountState);
  const chainIndex = useSelector(selector.chainIndex);

  return (
    <div id='bridge' className={`${!account ? `p-5` : `p-4`}`}>
      <div className='align-items-center d-flex flex-column flex-sm-row gap-5 justify-content-between'>
        <ChainList title={"Wallet Connected from"} chainListData={chainListData} defaultID={0} />
        <ChainList title={"Transferring to"} chainListData={chainListData} defaultID={1} />
      </div>

      {account && <div className='d-flex justify-content-center mt-4 tokenList'><ChainList title={"Token"} chainListData={chainListData} defaultID={1} /></div>}
      {!account && <div className='d-flex justify-content-center mt-5'>
        <input placeholder='Enter Amount' className='bridge-amount w-75' />
      </div>}
      {account && (<>
        <div className="col-md-4 mt-5 textOnInput w-75">
          <label for="inputText">Reciepent</label>
          <input className="input-with-label" type="text" />
        </div>
        <div className="col-md-4 mt-4 textOnInput w-75">
          <label for="inputText">Enter Amount</label>
          <input className="input-with-label" type="text" />
        </div>
      </>)}
      <div className='d-flex justify-content-center mt-4'>
        <button onClick={() => { }} className='mt-2 bridge-connect-wallet w-50 default-btn'>{!account ? "Connect Wallet" : "Transfer Amount"}</button>
      </div>
    </div>
  );
}

export { Bridge }
