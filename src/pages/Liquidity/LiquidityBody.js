import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { UserTokenPair } from './UserTokenPair'

const LiquidityBody = ({ walletConnectStatus, userLiquidityFound }) => {
  const userTokenPairList = [
    {},
    {},
  ];

  return (
    <div className='liquidityBody p-3'>
      {!walletConnectStatus ? (<div className='text-center content d-flex align-items-center justify-content-center'>
        Connect to a wallet to view your liquidity.
      </div>) :
        (<>
          {!userLiquidityFound ? (<div className='text-center'>No liquidity found.</div>) : (
            userTokenPairList.map((token, idx) => (
              <UserTokenPair key={idx} />
            ))
          )}
          <div className='text-center mt-4'>Don't see a pool you joined?</div>
          <div className='d-flex justify-content-center mt-3 mb-4'><Link to="/liquidityFindToken"><button className='default-btn fs-6'>Find other LP tokens</button></Link></div>
        </>)}
      <hr />
      <div className='d-flex justify-content-center mt-4'>
        <Link to="/liquidityAdd"><button className='default-btn liquidity-btn fs-6'>+ Add Liquidity</button></Link>
      </div>
    </div>
  );
}

export { LiquidityBody }
