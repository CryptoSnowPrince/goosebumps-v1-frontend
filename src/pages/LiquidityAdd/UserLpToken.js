import React, { useState } from 'react';
import { BiHelpCircle } from 'react-icons/bi';

import "./userLpToken.scss"

const UserLpToken = () => {
  return (
    <div className='mt-4 p-3' id="userLpToken">
      <div className='mt-2 fs-5'>LP tokens in your wallet</div>
      <div className='mt-2 d-flex justify-content-between'>
        <div className='d-flex fs-5 align-items-center'>
          <div><BiHelpCircle /> </div>
          <div><BiHelpCircle /> </div>
          <div>DSP/ </div>
          <div>TRM </div>
        </div>
        <div className='fs-6'>300</div>
      </div>
      <div className='mt-2 d-flex justify-content-between'>
        <div className='d-flex align-items-center'>
          <div style={{ color: "#04C0D7" }}>Share of Pool:</div>
        </div>
        <div style={{ color: "#40FF97" }}>9887.17</div>
      </div>
      <div className='mt-2 d-flex justify-content-between  mt-2'>
        <div className='d-flex align-items-center'>
          <div style={{ color: "#04C0D7" }}>Pooled DSP:</div>
        </div>
        <div style={{ color: "#40FF97" }}>0.10496</div>
      </div>
      <div className='mt-2 d-flex justify-content-between  mt-2'>
        <div style={{ color: "#04C0D7" }}>
          Pooled TRM:
        </div>
        <div style={{ color: "#40FF97" }}>8.53%</div>
      </div>
    </div>
  );
}

export { UserLpToken }
