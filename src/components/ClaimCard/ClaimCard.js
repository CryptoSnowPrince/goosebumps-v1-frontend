import React from 'react';
import { BiHelpCircle } from 'react-icons/bi';

import "./ClaimCard.scss"

const Submenu = () => {
  return (
    <div id='claimcard'>
      <div className='d-flex gap-2'>
        <div className='title'>Auto Goose Bounty</div>
        <div className='icon'><BiHelpCircle /></div>
      </div>
      <div className='d-flex align-items-center justify-content-between gap-5 mt-2'>
        <div>
          <div className='card-amount'>0.013</div>
          <div className='value'>~0.11 USD</div>
        </div>
        <div>
          <button className='button default-btn'>Claim</button>
        </div>
      </div>
    </div>
  );
}

export default Submenu;