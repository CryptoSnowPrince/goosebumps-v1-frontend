import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import { ChainCard, TokenCard } from "./ChainList";
import { ConnectButtonModal } from '../../components/widgets/ConnectButtonModal';

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

  const SubmitButton = () => {
    // logMessage("SubmitButton")
    if (account) {
      return <button onClick={() => { }} className='mt-2 bridge-connect-wallet w-50 default-btn'>Transfer Amount</button>
    } else {
      return (
        <div className='w-50'>
          <ConnectButtonModal />
        </div>
      );
    }
  };

  return (
    <div id='bridge' className={`${!account ? `p-5` : `p-4`}`}>
      <div className='align-items-center d-flex flex-column flex-sm-row gap-5 justify-content-between'>
        <ChainCard title={"Wallet Connected from"} chainListData={chainListData} defaultID={0} />
        <ChainCard title={"Transferring to"} chainListData={chainListData} defaultID={1} />
      </div>

      {account && <div className='d-flex justify-content-center mt-4 tokenList'><TokenCard title={"Token"} chainListData={chainListData} defaultID={1} /></div>}
      {!account && <div className='d-flex justify-content-center mt-5'>
        <input placeholder='Enter Amount' className='bridge-amount w-75' />
      </div>}
      {account && (<>
        <div className="col-md-4 mt-5 textOnInput w-75">
          <label for="inputText">Recipient</label>
          <input className="input-with-label" type="text" placeholder="Input recipient address" />
        </div>
        <div className="col-md-4 mt-4 textOnInput w-75">
          <label for="inputText">Enter Amount</label>
          <input className="input-with-label" type="text" placeholder="Input amount" />
        </div>
      </>)}
      <div className='d-flex justify-content-center mt-4'>
        <SubmitButton />
      </div>
    </div>
  );
}

export { Bridge }
