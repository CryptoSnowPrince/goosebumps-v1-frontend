import React, { useState } from 'react';
import { logMessage } from '../../utils/helpers';

export const ChainList = ({ title, chainListData, defaultID }) => {
  const [selectedChain, setSelectedChain] = useState(defaultID);

  return (
    <div className='chainList d-flex flex-column justify-content-between p-3'>
      <div className='title'>{title}</div>
      <div className='d-flex justify-content-center mt-3 mb-5'>
        <img src={chainListData[selectedChain].icon} alt="" />
      </div>
      <div className='selectChain'>
        <select className='w-100' value={selectedChain} onChange={(e) => setSelectedChain(e.target.value)}>
          {chainListData.map((chain, idx) => (
            <option value={idx} >{chain.symbol}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

export const ChainCard = ({ title, chainListData, defaultID }) => {
  const [selectedChain, setSelectedChain] = useState(defaultID);

  return (
    <div className='chainList d-flex flex-column justify-content-between p-3'>
      <div className='title'>{title}</div>
      <div className='d-flex justify-content-center mt-3 mb-5'>
        <img src={chainListData[selectedChain].icon} alt="" />
      </div>
      <div className='selectChain'>
        <select className='w-100' value={selectedChain} onChange={(e) => setSelectedChain(e.target.value)}>
          {chainListData.map((chain, idx) => (
            <option value={idx} >{chain.symbol}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

export const TokenCard = (props) => {
  return (
    <div className='chainList d-flex flex-column justify-content-between p-3'>
      <div className='title'>Token</div>
      <div className='d-flex justify-content-center mt-3 mb-5'>
        <img src={props.chainListData[0].icon} alt="" />
      </div>
      <div className='selectChain'>
        <select className='w-100' value={0} onChange={(e) => (logMessage())}>
          {props.chainListData.map((chain, idx) => (
            <option value={idx} >{chain.symbol}</option>
          ))}
        </select>
      </div>
    </div>
  );
}