import React, { useState } from 'react';

import "../page.scss"
import Submenu from '../../components/Submenu/Submenu'
import Help from '../../components/Help/Help'
import ClaimCard from '../../components/ClaimCard/ClaimCard'
import Control from '../../components/Control/Control'
import Filter from '../../components/Filter/Filter'
import StakingCard from '../../components/StakingCard/StakingCard'

const Staking = () => {
  const StakingCardsProps = [
    {},
    {},
    {},
    {},
    {},
    {},
  ];
  const [showMode, setShowMode] = useState(false);

  return (
    <div className='container'>
      <Submenu />
      <div className='d-flex align-items-center justify-content-end gap-5'>
        <Help />
        <ClaimCard />
      </div>
      <div id='MainPage' className='mt-4 p-4 mb-4'>
        <div id='FilterControl' className='d-flex justify-content-lg-between px-4 mb-4 flex-column flex-xl-row'>
          <Control handleShowMode={(val) => setShowMode(val)} />
          <Filter />
        </div>
        <div className='row' id='TokenItem'>
          {StakingCardsProps.map((token, idx) => (
            <StakingCard key={idx} showMode={showMode} />
          ))}
        </div>
      </div>
    </div>
  );
}

export { Staking }
