import React, { useState } from 'react';
import { logMessage } from '../../utils/helpers';

const ChainList = ({ title, chainListData, defaultID }) => {
  const [selectedChain, setSelectedChain] = useState(defaultID);
  logMessage(chainListData);
  return (
    <div className='chainList d-flex flex-column justify-content-between p-3'>
      <div className='title'>{title}</div>
      <div className='d-flex justify-content-center mt-3 mb-5'>
        <img src={chainListData[selectedChain].icon} alt="" />
      </div>
      <div className='selectChain'>
        
        <select className='w-100' value={selectedChain} onChange={(e) => setSelectedChain(e.target.value)}>
          {chainListData.map((chain, idx) => (
            <option value={idx} >{chain.simbol}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

export { ChainList }
